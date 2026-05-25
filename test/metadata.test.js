const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const PNG_SIGNATURE_SIZE = 8;

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function readPackageJson() {
  return JSON.parse(readText('package.json'));
}

function readIgnoreEntries(relativePath) {
  return readText(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readPngSize(relativePath) {
  const fileBuffer = fs.readFileSync(path.join(rootDir, relativePath));
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  assert.deepEqual(fileBuffer.subarray(0, PNG_SIGNATURE_SIZE), pngSignature);

  return {
    width: fileBuffer.readUInt32BE(16),
    height: fileBuffer.readUInt32BE(20),
  };
}

function stripEmbeddedImagePayloads(svgText) {
  return svgText.replace(/data:image\/[^"'\s>]+;base64,[^"'\s>]+/gi, 'data:image/embedded;base64,');
}

test('package metadata is public-ready and clearly unofficial', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.name, 'vscode-antigravity-cli-launcher');
  assert.equal(packageJson.displayName, 'Antigravity CLI Launcher');
  assert.equal(packageJson.description, 'Unofficial VS Code extension that launches Antigravity CLI in a side terminal from the editor toolbar.');
  assert.equal(packageJson.publisher, 'mikesoft');
  assert.equal(packageJson.version, '0.1.0');
  assert.equal(packageJson.icon, 'media/icon.png');
  assert.equal(packageJson.license, 'MIT');
  assert.equal(packageJson.repository.url, 'https://github.com/TheStreamCode/antigravity-cli-launcher.git');
  assert.equal(packageJson.bugs.url, 'https://github.com/TheStreamCode/antigravity-cli-launcher/issues');
  assert.equal(packageJson.engines.vscode, '^1.86.0');
  assert.deepEqual(packageJson.capabilities.untrustedWorkspaces.restrictedConfigurations, [
    'antigravityCliLauncher.cliCommand',
  ]);
  assert.ok(packageJson.keywords.includes('antigravity'));
  assert.ok(packageJson.keywords.includes('coding agent'));
});

test('package contributes launcher commands, toolbar item, and safe install settings', () => {
  const packageJson = readPackageJson();
  const [openCliCommand, openSettingsCommand] = packageJson.contributes.commands;

  assert.equal(openCliCommand.command, 'antigravityCliLauncher.openCli');
  assert.equal(openCliCommand.title, 'Open Antigravity CLI in Side Terminal');
  assert.equal(openCliCommand.category, 'Antigravity CLI Launcher');
  assert.deepEqual(openCliCommand.icon, {
    light: './media/launcher-mark.svg',
    dark: './media/launcher-mark.svg',
  });
  assert.equal(openSettingsCommand.command, 'antigravityCliLauncher.openSettings');
  assert.equal(packageJson.contributes.menus['editor/title'][0].command, 'antigravityCliLauncher.openCli');
  assert.equal(packageJson.contributes.menus['editor/title'][0].group, 'navigation');

  const settings = packageJson.contributes.configuration.properties;
  assert.equal(settings['antigravityCliLauncher.cliCommand'].default, 'agy');
  assert.equal(settings['antigravityCliLauncher.cliCommand'].scope, 'machine');
  assert.equal(settings['antigravityCliLauncher.terminalName'].default, 'Antigravity');
  assert.equal(settings['antigravityCliLauncher.autoInstall'].default, true);
  assert.equal(settings['antigravityCliLauncher.autoInstall'].scope, 'machine');
  assert.equal(settings['antigravityCliLauncher.preferAbsoluteInstalledPath'].default, true);
  assert.equal(settings['antigravityCliLauncher.preferAbsoluteInstalledPath'].scope, 'machine');
  assert.match(settings['antigravityCliLauncher.autoInstall'].description, /explicit confirmation/i);
});

test('extension assets are original packaged assets on expected paths', () => {
  const marketplaceIcon = readPngSize('media/icon.png');
  const commandIcon = readText('media/launcher-mark.svg');
  const commandIconMarkup = stripEmbeddedImagePayloads(commandIcon);

  assert.equal(marketplaceIcon.width, 256);
  assert.equal(marketplaceIcon.height, 256);
  assert.match(commandIcon, /<svg/i);
  assert.doesNotMatch(commandIconMarkup, /google|gemini/i);
});

test('README covers setup, auto install, PATH behavior, privacy, and affiliation disclaimer', () => {
  const readme = readText('README.md');

  assert.match(readme, /^# Antigravity CLI Launcher$/m);
  assert.match(readme, /unofficial VS Code extension/i);
  assert.match(readme, /https:\/\/github\.com\/TheStreamCode\/antigravity-cli-launcher/);
  assert.match(readme, /VS Code `\^1\.86\.0`/);
  assert.match(readme, /not affiliated with, endorsed by, sponsored by, or approved by Google/i);
  assert.match(readme, /Antigravity, agy, Google, and related names/i);
  assert.match(readme, /## Features/);
  assert.match(readme, /## Guided Installation/);
  assert.match(readme, /official Google installer/);
  assert.match(readme, /curl -fsSL https:\/\/antigravity\.google\/cli\/install\.sh \| bash/);
  assert.match(readme, /irm https:\/\/antigravity\.google\/cli\/install\.ps1 \| iex/);
  assert.match(readme, /%LOCALAPPDATA%\\agy\\bin/);
  assert.match(readme, /\.local\/bin/);
  assert.match(readme, /explicit confirmation/i);
  assert.match(readme, /does not collect telemetry, analytics, or personal data/i);
  assert.match(readme, /npm run check/);
});

test('legal and support documents are present and do not overclaim affiliation', () => {
  const trademarks = readText('TRADEMARKS.md');
  const support = readText('SUPPORT.md');
  const security = readText('SECURITY.md');
  const license = readText('LICENSE');
  const contributing = readText('CONTRIBUTING.md');

  assert.match(trademarks, /This project is not affiliated with, endorsed by, sponsored by, or approved by Google/i);
  assert.match(trademarks, /All product names, logos, brands, and trademarks are property of their respective owners/i);
  assert.match(support, /GitHub Issues/);
  assert.match(support, /info@mikesoft\.it/);
  assert.match(security, /Please do not report security vulnerabilities through public GitHub issues/i);
  assert.match(license, /MIT License/);
  assert.match(contributing, /Do not add official Google or Antigravity logos/i);
});

test('package scripts use deterministic local tooling entry points', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.scripts.compile, 'node ./node_modules/typescript/bin/tsc -p . --pretty false');
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./test/integration/runTest.js');
  assert.equal(packageJson.scripts.check, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./test/integration/runTest.js && node ./node_modules/@vscode/vsce/vsce ls');
  assert.equal(packageJson.scripts.package, 'node ./node_modules/@vscode/vsce/vsce package');
});

test('ignore rules keep generated, local, and engineering-only files out of artifacts', () => {
  const gitignoreEntries = readIgnoreEntries('.gitignore');
  const vscodeignoreEntries = readIgnoreEntries('.vscodeignore');

  assert.ok(gitignoreEntries.includes('node_modules/'));
  assert.ok(gitignoreEntries.includes('.vscode-test/'));
  assert.ok(gitignoreEntries.includes('.vsce/'));
  assert.ok(gitignoreEntries.includes('*.vsix'));
  assert.ok(gitignoreEntries.includes('out/**/*.map'));
  assert.ok(!gitignoreEntries.includes('package-lock.json'));

  assert.ok(vscodeignoreEntries.includes('src/**'));
  assert.ok(vscodeignoreEntries.includes('test/**'));
  assert.ok(vscodeignoreEntries.includes('docs/**'));
  assert.ok(vscodeignoreEntries.includes('scripts/**'));
  assert.ok(vscodeignoreEntries.includes('.github/**'));
  assert.ok(vscodeignoreEntries.includes('out/**/*.map'));
  assert.ok(vscodeignoreEntries.includes('package-lock.json'));
});

test('CI validates the extension with npm on Windows and Linux', () => {
  const workflow = readText('.github/workflows/ci.yml');

  assert.match(workflow, /^name: CI$/m);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /ubuntu-latest/);
  assert.match(workflow, /cache: npm/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run check/);
});

test('changelog documents the initial release scope', () => {
  const changelog = readText('CHANGELOG.md');

  assert.match(changelog, /^# Changelog$/m);
  assert.match(changelog, /## 0\.1\.0/);
  assert.match(changelog, /Added Antigravity CLI launcher command/);
  assert.match(changelog, /Added consent-based guided install flow/);
  assert.match(changelog, /Added legal, support, security, and trademark documentation/);
});
