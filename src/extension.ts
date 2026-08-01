import * as vscode from 'vscode';
import {
  FALLBACK_TERMINAL_NAME,
  appendBoundedOutput,
  buildExtensionSettingsQuery,
  buildTerminalName,
  normalizeTerminalName,
  resolveCliCommandSetting,
  resolveTerminalCwd,
  shouldPromptToInstallAntigravity,
} from './command-utils.js';

const SETTINGS_NAMESPACE = 'antigravityCliLauncher';
const INSTALL_DOCS_URL = 'https://antigravity.google/docs/cli/install';

let terminalSequence = 1;

async function collectShellExecutionOutput(execution: vscode.TerminalShellExecution): Promise<string> {
  let output = '';

  try {
    for await (const chunk of execution.read()) {
      output = appendBoundedOutput(output, chunk);
    }
  } catch {
    return output;
  }

  return output;
}

async function openExtensionSettings(context: vscode.ExtensionContext): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.openSettings', buildExtensionSettingsQuery(context.extension.id));
}

async function openAntigravityInstallInstructions(): Promise<void> {
  await vscode.env.openExternal(vscode.Uri.parse(INSTALL_DOCS_URL));
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

async function handleMissingAntigravity(context: vscode.ExtensionContext): Promise<void> {
  const selection = await vscode.window.showWarningMessage(
    'Antigravity CLI was not found. Install it by following the official Google instructions, then restart VS Code if agy is still unavailable. This extension does not download or run installers.',
    { modal: true },
    'Open Installation Guide',
    'Open Settings',
  );

  if (selection === 'Open Installation Guide') {
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
