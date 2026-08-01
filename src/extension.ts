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

/**
 * Teardown callbacks for launches that still have live listeners. Entries remove
 * themselves once their launch finishes, so repeated launches in a long-running
 * window cannot accumulate listeners.
 */
const pendingLaunchTeardowns = new Set<() => void>();

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
  onShellExecutionEnd?: (event: vscode.TerminalShellExecutionEndEvent, output: string) => void | Promise<void>,
): void {
  const launchDisposables: vscode.Disposable[] = [];
  let executionStarted = false;
  let isTornDown = false;

  const tearDown = () => {
    if (isTornDown) {
      return;
    }

    isTornDown = true;
    clearTimeout(fallbackHandle);
    pendingLaunchTeardowns.delete(tearDown);

    for (const disposable of launchDisposables.splice(0)) {
      disposable.dispose();
    }
  };

  const startExecution = (shellIntegration: vscode.TerminalShellIntegration) => {
    if (executionStarted || isTornDown) {
      return;
    }

    executionStarted = true;
    shellIntegrationListener.dispose();
    clearTimeout(fallbackHandle);

    let execution: vscode.TerminalShellExecution | undefined;
    let outputPromise: Promise<string> | undefined;

    if (onShellExecutionEnd) {
      launchDisposables.push(vscode.window.onDidEndTerminalShellExecution(async (endEvent) => {
        if (endEvent.terminal !== terminal || (execution && endEvent.execution !== execution)) {
          return;
        }

        tearDown();
        const output = outputPromise ? await outputPromise : '';
        await onShellExecutionEnd(endEvent, output);
      }));
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

  const closedTerminalListener = vscode.window.onDidCloseTerminal((closedTerminal) => {
    if (closedTerminal === terminal) {
      tearDown();
    }
  });

  const fallbackHandle = setTimeout(() => {
    if (terminal.shellIntegration) {
      startExecution(terminal.shellIntegration);
      return;
    }

    executionStarted = true;
    tearDown();
    terminal.sendText(command, true);
  }, 3000);

  launchDisposables.push(shellIntegrationListener, closedTerminalListener);
  pendingLaunchTeardowns.add(tearDown);

  if (terminal.shellIntegration) {
    startExecution(terminal.shellIntegration);
  }
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

  context.subscriptions.push(
    openCliCommand,
    openSettingsCommand,
    {
      dispose: () => {
        for (const runTeardown of [...pendingLaunchTeardowns]) {
          runTeardown();
        }
      },
    },
  );
}

export function deactivate(): void {
  for (const runTeardown of [...pendingLaunchTeardowns]) {
    runTeardown();
  }
}
