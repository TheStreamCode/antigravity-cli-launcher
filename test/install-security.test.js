const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'src');

function readRuntimeSources() {
  const sourceText = fs.readdirSync(sourceDir)
    .filter((fileName) => fileName.endsWith('.ts'))
    .map((fileName) => fs.readFileSync(path.join(sourceDir, fileName), 'utf8'))
    .join('\n');
  const outputDir = path.join(rootDir, 'out');
  const outputText = fs.existsSync(outputDir)
    ? fs.readdirSync(outputDir)
      .filter((fileName) => fileName.endsWith('.js'))
      .map((fileName) => fs.readFileSync(path.join(outputDir, fileName), 'utf8'))
      .join('\n')
    : '';

  return `${sourceText}\n${outputText}`;
}

test('missing agy directs users to official instructions without automated installation', () => {
  const runtimeSources = readRuntimeSources();
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const settings = packageJson.contributes.configuration.properties;
  const scriptEndpointPattern = new RegExp(`install\\.(?:${['s', 'h'].join('')}|${['p', 's', '1'].join('')}|cmd)`, 'i');
  const windowsPipePattern = new RegExp(`\\b${['i', 'r', 'm'].join('')}\\b[^\\n]*\\|[^\\n]*\\b${['i', 'e', 'x'].join('')}\\b`, 'i');
  const posixPipePattern = new RegExp(`\\b${['c', 'u', 'r', 'l'].join('')}\\b[^\\n]*\\|[^\\n]*\\b${['b', 'a', 's', 'h'].join('')}\\b`, 'i');
  const policyBypassPattern = new RegExp(`${['Execution', 'Policy'].join('')}[^\\n]{0,80}${['By', 'pass'].join('')}`, 'i');

  assert.doesNotMatch(runtimeSources, scriptEndpointPattern);
  assert.doesNotMatch(runtimeSources, /node:child_process/);
  assert.doesNotMatch(runtimeSources, windowsPipePattern);
  assert.doesNotMatch(runtimeSources, posixPipePattern);
  assert.doesNotMatch(runtimeSources, policyBypassPattern);
  assert.doesNotMatch(runtimeSources, /(?:appendFileSync|SetEnvironmentVariable)[^\n]*Path/i);
  assert.match(runtimeSources, /https:\/\/antigravity\.google\/docs\/cli\/install/);
  assert.equal(settings['antigravityCliLauncher.autoInstall'], undefined);
  assert.equal(settings['antigravityCliLauncher.preferAbsoluteInstalledPath'], undefined);
});
