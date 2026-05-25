import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  FALLBACK_TERMINAL_NAME,
  buildExtensionSettingsQuery,
  buildTerminalName,
  normalizeTerminalName,
  resolveCliCommandSetting,
  resolveTerminalCwd,
  shouldPromptToInstallAntigravity,
} from './command-utils.js';
import {
  buildAntigravityInstallPromptCommand,
  buildAntigravityInstallPromptMessage,
  buildAntigravityInstallPromptScript,
  buildQuotedCommandPath,
  getDefaultAntigravityExecutablePath,
} from './install-utils.js';

const SETTINGS_NAMESPACE = 'antigravityCliLauncher';
const DOCS_URL = 'https://github.com/google-antigravity/antigravity-cli';

let terminalSequence = 1;

function collectShellExecutionOutput(execution: vscode.TerminalShellExecution): Promise<string> {
  return (async () => {
    let output = '';

    try {
      for await (const chunk of execution.read()) {
        output += chunk;
      }
    } catch {
      return output;
    }

    return output;
  })();
}

function writeAntigravityInstallPromptScript(): string {
  const scriptPath = path.join(os.tmpdir(), `antigravity-cli-launcher-install-${process.pid}-${Date.now()}.js`);
  fs.writeFileSync(scriptPath, buildAntigravityInstallPromptScript(), 'utf8');

  return scriptPath;
}

async function openExtensionSettings(context: vscode.ExtensionContext): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.openSettings', buildExtensionSettingsQuery(context.extension.id));
}

async function openAntigravityInstallInstructions(): Promise<void> {
  await vscode.env.openExternal(vscode.Uri.parse(DOCS_URL));
}

async function updateCommandToInstalledPathIfAvailable(): Promise<void> {
  const configuration = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);
  if (!configuration.get<boolean>('preferAbsoluteInstalledPath', true)) {
    return;
  }

  const executablePath = getDefaultAntigravityExecutablePath(process.platform, process.env, os.homedir());
  if (!fs.existsSync(executablePath)) {
    return;
  }

  const quotedPath = buildQuotedCommandPath(executablePath);
  await configuration.update('cliCommand', quotedPath, vscode.ConfigurationTarget.Global);
  void vscode.window.showInformationMessage(
    `Antigravity CLI was installed. The launcher command now uses ${quotedPath}. Restart VS Code if existing terminals do not see the updated PATH.`,
  );
}

function executeCommandWithOptionalShellIntegration(
  terminal: vscode.Terminal,
  command: string,
  context: vscode.ExtensionContext,
  onShellExecutionEnd?: (event: vscode.TerminalShellExecutionEndEvent, output: string) => void | Promise<void>,
): void {
  let executionStarted = false;

  const startExecution = (shellIntegration: vscode.TerminalShellIntegration) => {
    if (executionStarted) {
      return;
    }

    executionStarted = true;
    shellIntegrationListener.dispose();
    clearTimeout(fallbackHandle);

    let execution: vscode.TerminalShellExecution | undefined;
    let outputPromise: Promise<string> | undefined;

    const executionListener = onShellExecutionEnd
      ? vscode.window.onDidEndTerminalShellExecution(async (endEvent) => {
      if (endEvent.terminal !== terminal || (execution && endEvent.execution !== execution)) {
        return;
      }

      executionListener?.dispose();
      const output = outputPromise ? await outputPromise : '';
      await onShellExecutionEnd(endEvent, output);
    })
      : undefined;

    if (executionListener) {
      context.subscriptions.push(executionListener);
    }

    execution = shellIntegration.executeCommand(command);
    outputPromise = collectShellExecutionOutput(execution);
  };

  const shellIntegrationListener = vscode.window.onDidChangeTerminalShellIntegration((event) => {
    if (event.terminal !== terminal) {
      return;
    }

    startExecution(event.shellIntegration);
  });

  const fallbackHandle = setTimeout(() => {
    if (terminal.shellIntegration) {
      startExecution(terminal.shellIntegration);
      return;
    }

    executionStarted = true;
    shellIntegrationListener.dispose();
    terminal.sendText(command, true);
  }, 3000);

  if (terminal.shellIntegration) {
    startExecution(terminal.shellIntegration);
    return;
  }

  context.subscriptions.push(
    shellIntegrationListener,
    { dispose: () => clearTimeout(fallbackHandle) },
  );
}

function startGuidedInstall(context: vscode.ExtensionContext): void {
  const installTerminal = vscode.window.createTerminal({
    name: 'Install Antigravity CLI',
    location: vscode.TerminalLocation.Panel,
  });
  const installCommand = buildAntigravityInstallPromptCommand(writeAntigravityInstallPromptScript());

  installTerminal.show();
  executeCommandWithOptionalShellIntegration(
    installTerminal,
    installCommand,
    context,
    async (event) => {
      if (event.exitCode === 0) {
        await updateCommandToInstalledPathIfAvailable();
      }
    },
  );
}

async function handleMissingAntigravity(context: vscode.ExtensionContext): Promise<void> {
  const configuration = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);
  const autoInstall = configuration.get<boolean>('autoInstall', true);

  if (!autoInstall) {
    const selection = await vscode.window.showWarningMessage(
      `${buildAntigravityInstallPromptMessage()} Install it manually or enable guided install in settings.`,
      'Open Settings',
      'Open Antigravity Docs',
    );

    if (selection === 'Open Settings') {
      await openExtensionSettings(context);
    } else if (selection === 'Open Antigravity Docs') {
      await openAntigravityInstallInstructions();
    }

    return;
  }

  const selection = await vscode.window.showWarningMessage(
    `${buildAntigravityInstallPromptMessage()} Install it now with the official Google installer?`,
    { modal: true },
    'Install',
    'Open Antigravity Docs',
    'Open Settings',
  );

  if (selection === 'Install') {
    startGuidedInstall(context);
  } else if (selection === 'Open Antigravity Docs') {
    await openAntigravityInstallInstructions();
  } else if (selection === 'Open Settings') {
    await openExtensionSettings(context);
  }
}

function watchForMissingAntigravity(terminal: vscode.Terminal, cliCommand: string, context: vscode.ExtensionContext): void {
  executeCommandWithOptionalShellIntegration(
    terminal,
    cliCommand,
    context,
    async (endEvent, output) => {
      if (shouldPromptToInstallAntigravity(cliCommand, endEvent.exitCode, output)) {
        await handleMissingAntigravity(context);
      }
    },
  );
}

export function activate(context: vscode.ExtensionContext): void {
  const openCliCommand = vscode.commands.registerCommand('antigravityCliLauncher.openCli', async () => {
    if (!vscode.workspace.isTrusted) {
      const selection = await vscode.window.showWarningMessage(
        'Antigravity CLI Launcher runs terminal commands in the current workspace. Trust this workspace before launching Antigravity CLI.',
        'Manage Workspace Trust',
        'Open Settings',
      );

      if (selection === 'Manage Workspace Trust') {
        await vscode.commands.executeCommand('workbench.trust.manage');
      } else if (selection === 'Open Settings') {
        await openExtensionSettings(context);
      }

      return;
    }

    const configuration = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);
    const cliCommand = resolveCliCommandSetting(configuration.inspect<string>('cliCommand'), 'agy');
    const configuredTerminalName = configuration.get<string>('terminalName', FALLBACK_TERMINAL_NAME);
    const terminalBaseName = normalizeTerminalName(configuredTerminalName, FALLBACK_TERMINAL_NAME);
    const terminalName = buildTerminalName(configuredTerminalName, terminalSequence, FALLBACK_TERMINAL_NAME);

    if (!cliCommand) {
      void vscode.window.showErrorMessage('Set "antigravityCliLauncher.cliCommand" to the command that starts Antigravity CLI.');
      return;
    }

    terminalSequence += 1;
    const cwd = resolveTerminalCwd(vscode.window.activeTextEditor, vscode.workspace);

    const terminal = vscode.window.createTerminal({
      name: terminalName,
      location: { viewColumn: vscode.ViewColumn.Beside },
      cwd,
    });
    terminal.show();
    watchForMissingAntigravity(terminal, cliCommand, context);
    void vscode.window.setStatusBarMessage(`Started ${terminalBaseName}`, 2500);
  });

  const openSettingsCommand = vscode.commands.registerCommand('antigravityCliLauncher.openSettings', async () => {
    await openExtensionSettings(context);
  });

  context.subscriptions.push(openCliCommand, openSettingsCommand);
}

export function deactivate(): void {
}
