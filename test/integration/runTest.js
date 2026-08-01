const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runTests } = require('@vscode/test-electron');

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
  const extensionTestsPath = path.resolve(__dirname, 'suite');
  const testRuntimePath = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-vscode-'));

  try {
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',
        `--user-data-dir=${path.join(testRuntimePath, 'user-data')}`,
        `--extensions-dir=${path.join(testRuntimePath, 'extensions')}`,
      ],
    });
  } catch (error) {
    console.error('VS Code integration tests failed.');
    throw error;
  } finally {
    fs.rmSync(testRuntimePath, { recursive: true, force: true });
  }
}

main();
