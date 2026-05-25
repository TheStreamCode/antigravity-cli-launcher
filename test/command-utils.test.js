const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FALLBACK_CLI_COMMAND,
  FALLBACK_TERMINAL_NAME,
  buildExtensionSettingsQuery,
  buildTerminalName,
  extractExecutable,
  normalizeCliCommand,
  normalizeTerminalName,
  resolveCliCommandSetting,
  resolveTerminalCwd,
  shouldPromptToInstallAntigravity,
} = require('../out/command-utils.js');

test('default command and terminal name match Antigravity branding', () => {
  assert.equal(FALLBACK_CLI_COMMAND, 'agy');
  assert.equal(FALLBACK_TERMINAL_NAME, 'Antigravity');
});

test('normalizeCliCommand trims configured values', () => {
  assert.equal(normalizeCliCommand('  agy --help  '), 'agy --help');
});

test('normalizeCliCommand falls back when value is undefined', () => {
  assert.equal(normalizeCliCommand(undefined), 'agy');
});

test('normalizeCliCommand preserves blank commands for runtime validation', () => {
  assert.equal(normalizeCliCommand('   '), '');
});

test('resolveCliCommandSetting uses global values and ignores workspace-controlled commands', () => {
  assert.equal(
    resolveCliCommandSetting({ defaultValue: 'agy', globalValue: 'agy --safe', workspaceValue: 'malicious-command' }),
    'agy --safe',
  );
});

test('resolveCliCommandSetting falls back to the default when no global value exists', () => {
  assert.equal(resolveCliCommandSetting({ defaultValue: 'agy', workspaceValue: 'malicious-command' }), 'agy');
});

test('resolveCliCommandSetting preserves a blank global value for validation', () => {
  assert.equal(resolveCliCommandSetting({ defaultValue: 'agy', globalValue: '   ', workspaceValue: 'agy' }), '');
});

test('normalizeTerminalName falls back when value is blank', () => {
  assert.equal(normalizeTerminalName('   '), 'Antigravity');
});

test('buildTerminalName uses the base name for the first terminal', () => {
  assert.equal(buildTerminalName('  Antigravity  ', 1), 'Antigravity');
});

test('buildTerminalName appends the sequence after the first terminal', () => {
  assert.equal(buildTerminalName('Antigravity', 3), 'Antigravity 3');
});

test('buildExtensionSettingsQuery targets the current extension id', () => {
  assert.equal(
    buildExtensionSettingsQuery('mikesoft.vscode-antigravity-cli-launcher'),
    '@ext:mikesoft.vscode-antigravity-cli-launcher',
  );
});

test('extractExecutable returns the first token for simple commands', () => {
  assert.equal(extractExecutable('agy --version'), 'agy');
});

test('extractExecutable preserves quoted Windows paths with spaces', () => {
  assert.equal(
    extractExecutable('"C:\\Users\\Test User\\AppData\\Local\\agy\\bin\\agy.exe" --help'),
    'C:\\Users\\Test User\\AppData\\Local\\agy\\bin\\agy.exe',
  );
});

test('shouldPromptToInstallAntigravity detects PowerShell command-not-found output', () => {
  const output = "agy: The term 'agy' is not recognized as a name of a cmdlet, function, script file, or executable program.";

  assert.equal(shouldPromptToInstallAntigravity('agy', 1, output), true);
});

test('shouldPromptToInstallAntigravity detects POSIX command-not-found exit codes', () => {
  assert.equal(shouldPromptToInstallAntigravity('agy', 127, ''), true);
});

test('shouldPromptToInstallAntigravity ignores custom wrapper commands', () => {
  assert.equal(shouldPromptToInstallAntigravity('custom-agy-wrapper', 1, 'custom-agy-wrapper: command not found'), false);
});

test('shouldPromptToInstallAntigravity ignores unrelated Antigravity runtime failures', () => {
  assert.equal(shouldPromptToInstallAntigravity('agy', 1, 'Error: authentication failed'), false);
  assert.equal(shouldPromptToInstallAntigravity('agy', 1, 'Error: model not found'), false);
});

test('shouldPromptToInstallAntigravity ignores missing project files from an installed CLI', () => {
  assert.equal(shouldPromptToInstallAntigravity('agy', 1, 'Error: no such file or directory, open "/workspace/README.md"'), false);
});

test('shouldPromptToInstallAntigravity ignores non-command-not-found exit codes', () => {
  assert.equal(shouldPromptToInstallAntigravity('agy', 2, 'agy: command not found'), false);
});

test('resolveTerminalCwd uses the active editor workspace when available', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder(uri) {
      return uri === 'file-b' ? { uri: 'workspace-b' } : undefined;
    },
  };

  const activeEditor = {
    document: {
      uri: 'file-b',
    },
  };

  assert.equal(resolveTerminalCwd(activeEditor, workspace), 'workspace-b');
});

test('resolveTerminalCwd falls back to the first workspace when active editor is outside the workspace', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder() {
      return undefined;
    },
  };

  const activeEditor = {
    document: {
      uri: 'external-file',
    },
  };

  assert.equal(resolveTerminalCwd(activeEditor, workspace), 'workspace-a');
});

test('resolveTerminalCwd returns undefined when no workspace is open', () => {
  const workspace = {
    workspaceFolders: undefined,
    getWorkspaceFolder() {
      return undefined;
    },
  };

  assert.equal(resolveTerminalCwd(undefined, workspace), undefined);
});
