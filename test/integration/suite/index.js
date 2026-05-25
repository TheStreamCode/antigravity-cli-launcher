const assert = require('node:assert/strict');
const vscode = require('vscode');

async function waitForNewTerminal(beforeCount, timeoutMs = 3000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (vscode.window.terminals.length > beforeCount) {
      return vscode.window.terminals[vscode.window.terminals.length - 1];
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('Expected the launcher to create a terminal.');
}

async function run() {
  const extension = vscode.extensions.getExtension('mikesoft.vscode-antigravity-cli-launcher');
  assert.ok(extension, 'Expected extension to be available in the test host');

  await extension.activate();
  assert.equal(extension.isActive, true);

  const commands = await vscode.commands.getCommands(true);
  assert.ok(commands.includes('antigravityCliLauncher.openCli'));
  assert.ok(commands.includes('antigravityCliLauncher.openSettings'));

  const configuration = vscode.workspace.getConfiguration('antigravityCliLauncher');
  const originalCliCommand = configuration.get('cliCommand');
  const originalTerminalName = configuration.get('terminalName');
  const originalAutoInstall = configuration.get('autoInstall');

  try {
    await configuration.update('cliCommand', 'node --version', vscode.ConfigurationTarget.Global);
    await configuration.update('terminalName', 'Antigravity Test', vscode.ConfigurationTarget.Global);
    await configuration.update('autoInstall', false, vscode.ConfigurationTarget.Global);

    const beforeCount = vscode.window.terminals.length;
    await vscode.commands.executeCommand('antigravityCliLauncher.openCli');
    const terminal = await waitForNewTerminal(beforeCount);

    assert.match(terminal.name, /^Antigravity Test/);
    terminal.dispose();

    await vscode.commands.executeCommand('antigravityCliLauncher.openSettings');
  } finally {
    await configuration.update('cliCommand', originalCliCommand, vscode.ConfigurationTarget.Global);
    await configuration.update('terminalName', originalTerminalName, vscode.ConfigurationTarget.Global);
    await configuration.update('autoInstall', originalAutoInstall, vscode.ConfigurationTarget.Global);
  }
}

module.exports = { run };
