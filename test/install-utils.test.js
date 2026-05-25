const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ANTIGRAVITY_INSTALL_SH_URL,
  ANTIGRAVITY_INSTALL_PS1_URL,
  buildAntigravityInstallPromptCommand,
  buildAntigravityInstallPromptMessage,
  buildAntigravityInstallPromptScript,
  buildQuotedCommandPath,
  getDefaultAntigravityBinDir,
  getDefaultAntigravityExecutablePath,
  hasPathEntry,
  appendPathEntry,
} = require('../out/install-utils.js');

test('install URLs point to the official Antigravity installers', () => {
  assert.equal(ANTIGRAVITY_INSTALL_SH_URL, 'https://antigravity.google/cli/install.sh');
  assert.equal(ANTIGRAVITY_INSTALL_PS1_URL, 'https://antigravity.google/cli/install.ps1');
});

test('buildAntigravityInstallPromptMessage is concise and explicit', () => {
  assert.equal(buildAntigravityInstallPromptMessage(), 'Antigravity CLI was not found.');
});

test('buildAntigravityInstallPromptCommand runs a generated node script path safely', () => {
  const command = buildAntigravityInstallPromptCommand('C:\\Temp\\agy install prompt.js');

  assert.equal(command, 'node "C:\\Temp\\agy install prompt.js"');
  assert.doesNotMatch(command, /node -e/);
});

test('getDefaultAntigravityBinDir resolves Windows LOCALAPPDATA bin directory', () => {
  assert.equal(
    getDefaultAntigravityBinDir('win32', { LOCALAPPDATA: 'C:\\Users\\Ada\\AppData\\Local' }, '/ignored'),
    'C:\\Users\\Ada\\AppData\\Local\\agy\\bin',
  );
});

test('getDefaultAntigravityBinDir resolves POSIX local bin directory', () => {
  assert.equal(
    getDefaultAntigravityBinDir('darwin', {}, '/Users/ada'),
    '/Users/ada/.local/bin',
  );
});

test('getDefaultAntigravityExecutablePath resolves platform executable names', () => {
  assert.equal(
    getDefaultAntigravityExecutablePath('win32', { LOCALAPPDATA: 'C:\\Users\\Ada\\AppData\\Local' }, '/ignored'),
    'C:\\Users\\Ada\\AppData\\Local\\agy\\bin\\agy.exe',
  );
  assert.equal(
    getDefaultAntigravityExecutablePath('linux', {}, '/home/ada'),
    '/home/ada/.local/bin/agy',
  );
});

test('buildQuotedCommandPath quotes paths with spaces and escapes embedded quotes', () => {
  assert.equal(
    buildQuotedCommandPath('C:\\Users\\Ada Lovelace\\AppData\\Local\\agy\\bin\\agy.exe'),
    '"C:\\Users\\Ada Lovelace\\AppData\\Local\\agy\\bin\\agy.exe"',
  );
  assert.equal(buildQuotedCommandPath('/Users/ada/.local/bin/agy'), '"/Users/ada/.local/bin/agy"');
});

test('hasPathEntry detects Windows path entries case-insensitively', () => {
  assert.equal(hasPathEntry('C:\\Tools;C:\\Users\\Ada\\AppData\\Local\\agy\\bin', 'c:\\users\\ada\\appdata\\local\\agy\\bin', ';', true), true);
});

test('hasPathEntry detects POSIX path entries exactly', () => {
  assert.equal(hasPathEntry('/usr/local/bin:/Users/ada/.local/bin', '/Users/ada/.local/bin', ':', false), true);
  assert.equal(hasPathEntry('/usr/local/bin:/Users/ada/.local/bin', '/users/ada/.local/bin', ':', false), false);
});

test('appendPathEntry avoids duplicates and appends missing entries', () => {
  assert.equal(appendPathEntry('C:\\Tools', 'C:\\Users\\Ada\\AppData\\Local\\agy\\bin', ';', true), 'C:\\Tools;C:\\Users\\Ada\\AppData\\Local\\agy\\bin');
  assert.equal(appendPathEntry('C:\\Tools;C:\\Users\\Ada\\AppData\\Local\\agy\\bin', 'c:\\users\\ada\\appdata\\local\\agy\\bin', ';', true), 'C:\\Tools;C:\\Users\\Ada\\AppData\\Local\\agy\\bin');
});

test('buildAntigravityInstallPromptScript uses the official installers and configures PATH on all supported platforms', () => {
  const script = buildAntigravityInstallPromptScript();

  assert.match(script, /https:\/\/antigravity\.google\/cli\/install\.sh/);
  assert.match(script, /https:\/\/antigravity\.google\/cli\/install\.ps1/);
  assert.match(script, /irm ' \+ windowsInstallUrl \+ ' \| iex/);
  assert.match(script, /SetEnvironmentVariable\('Path'/);
  assert.match(script, /\.zprofile/);
  assert.match(script, /\.bashrc/);
  assert.match(script, /fish_add_path \$HOME\/\.local\/bin/);
  assert.match(script, /Run 'agy' to get started/);
});
