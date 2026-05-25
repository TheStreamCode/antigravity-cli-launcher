import * as path from 'node:path';

const ANTIGRAVITY_INSTALL_SH_URL = 'https://antigravity.google/cli/install.sh';
const ANTIGRAVITY_INSTALL_PS1_URL = 'https://antigravity.google/cli/install.ps1';

type EnvironmentLike = Record<string, string | undefined>;

function quoteJavaScriptString(value: string): string {
  return JSON.stringify(value);
}

function trimTrailingSeparators(value: string): string {
  return value.replace(/[\\/]+$/g, '');
}

function normalizePathEntry(value: string, caseInsensitive: boolean): string {
  const normalized = trimTrailingSeparators(value.trim());
  return caseInsensitive ? normalized.toLowerCase() : normalized;
}

function getHomeDir(platform: NodeJS.Platform | string, env: EnvironmentLike, homedir: string): string {
  if (platform === 'win32') {
    return env.USERPROFILE || env.HOME || homedir;
  }

  return env.HOME || homedir;
}

/** Returns the terminal-facing missing CLI message. */
export function buildAntigravityInstallPromptMessage(): string {
  return 'Antigravity CLI was not found.';
}

/** Returns the short terminal command that runs the generated installer script. */
export function buildAntigravityInstallPromptCommand(scriptPath: string): string {
  return `node ${buildQuotedCommandPath(scriptPath)}`;
}

/** Returns the default Antigravity bin directory for the target platform. */
export function getDefaultAntigravityBinDir(
  platform: NodeJS.Platform | string = process.platform,
  env: EnvironmentLike = process.env,
  homedir = '',
): string {
  if (platform === 'win32') {
    const localAppData = env.LOCALAPPDATA || path.win32.join(getHomeDir(platform, env, homedir), 'AppData', 'Local');
    return path.win32.join(localAppData, 'agy', 'bin');
  }

  return path.posix.join(getHomeDir(platform, env, homedir), '.local', 'bin');
}

/** Returns the expected Antigravity executable path after the official installer completes. */
export function getDefaultAntigravityExecutablePath(
  platform: NodeJS.Platform | string = process.platform,
  env: EnvironmentLike = process.env,
  homedir = '',
): string {
  const executableName = platform === 'win32' ? 'agy.exe' : 'agy';

  if (platform === 'win32') {
    return path.win32.join(getDefaultAntigravityBinDir(platform, env, homedir), executableName);
  }

  return path.posix.join(getDefaultAntigravityBinDir(platform, env, homedir), executableName);
}

/** Quotes a command path so it can be sent directly to an integrated terminal. */
export function buildQuotedCommandPath(commandPath: string): string {
  return `"${commandPath.replace(/"/g, '\\"')}"`;
}

/** Returns whether a PATH-like string already contains the directory. */
export function hasPathEntry(pathValue: string, directory: string, delimiter: string, caseInsensitive: boolean): boolean {
  const expected = normalizePathEntry(directory, caseInsensitive);

  return pathValue
    .split(delimiter)
    .map((entry) => normalizePathEntry(entry, caseInsensitive))
    .some((entry) => entry === expected);
}

/** Appends a PATH entry only when it is not already present. */
export function appendPathEntry(pathValue: string, directory: string, delimiter: string, caseInsensitive: boolean): string {
  if (!pathValue.trim()) {
    return directory;
  }

  if (hasPathEntry(pathValue, directory, delimiter, caseInsensitive)) {
    return pathValue;
  }

  return `${pathValue}${delimiter}${directory}`;
}

/** Returns the Node installer script executed inside a visible VS Code terminal after user consent. */
export function buildAntigravityInstallPromptScript(
  shellInstallUrl = ANTIGRAVITY_INSTALL_SH_URL,
  windowsInstallUrl = ANTIGRAVITY_INSTALL_PS1_URL,
): string {
  const message = quoteJavaScriptString(buildAntigravityInstallPromptMessage());
  const shellUrl = quoteJavaScriptString(shellInstallUrl);
  const psUrl = quoteJavaScriptString(windowsInstallUrl);

  return String.raw`const cp = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const shellInstallUrl = ${shellUrl};
const windowsInstallUrl = ${psUrl};

const isWindows = process.platform === 'win32';
const binDir = isWindows
  ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'agy', 'bin')
  : path.join(os.homedir(), '.local', 'bin');
const executablePath = path.join(binDir, isWindows ? 'agy.exe' : 'agy');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(command + ' exited with code ' + code));
    });
  });
}

async function runOfficialInstaller() {
  if (isWindows) {
    const psCommand = 'irm ' + windowsInstallUrl + ' | iex';
    await run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psCommand]);
    return;
  }

  const command = 'curl -fsSL ' + shellInstallUrl + ' | bash';
  await run(process.env.SHELL || '/bin/sh', ['-lc', command]);
}

async function ensureWindowsUserPath() {
  const script = "$dir = " + JSON.stringify(binDir) + "; " +
    "$userPath = [Environment]::GetEnvironmentVariable('Path', 'User'); " +
    "$entries = @(); if ($userPath) { $entries = $userPath -split ';' | Where-Object { $_ } }; " +
    "$exists = $entries | Where-Object { $_.TrimEnd('\\') -ieq $dir.TrimEnd('\\') }; " +
    "if (-not $exists) { $newPath = (($entries + $dir) -join ';'); [Environment]::SetEnvironmentVariable('Path', $newPath, 'User'); Write-Host 'Added ' $dir ' to the Windows user PATH.' } " +
    "else { Write-Host 'Windows user PATH already contains ' $dir }";

  await run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script]);
}

function appendIfMissing(filePath, block) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (existing.includes('.local/bin')) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, (existing.endsWith('\n') || existing.length === 0 ? '' : '\n') + block, 'utf8');
  console.log('Updated PATH configuration in ' + filePath);
}

function ensurePosixShellPath() {
  const shellName = path.basename(process.env.SHELL || '');
  const exportBlock = '\n# >>> antigravity cli launcher >>>\nexport PATH="$HOME/.local/bin:$PATH"\n# <<< antigravity cli launcher <<<\n';
  const fishBlock = '\n# >>> antigravity cli launcher >>>\nfish_add_path $HOME/.local/bin\n# <<< antigravity cli launcher <<<\n';
  const home = os.homedir();

  if (shellName === 'fish') {
    appendIfMissing(path.join(home, '.config', 'fish', 'config.fish'), fishBlock);
    return;
  }

  if (shellName === 'zsh') {
    appendIfMissing(path.join(home, '.zshrc'), exportBlock);
    if (process.platform === 'darwin') {
      appendIfMissing(path.join(home, '.zprofile'), exportBlock);
    }
    return;
  }

  if (shellName === 'bash') {
    appendIfMissing(path.join(home, '.bashrc'), exportBlock);
    if (process.platform === 'darwin') {
      appendIfMissing(path.join(home, '.bash_profile'), exportBlock);
    }
    return;
  }

  appendIfMissing(path.join(home, '.profile'), exportBlock);
}

(async () => {
  console.log(${message});
  console.log('Installing Antigravity CLI with the official Google installer...');
  await runOfficialInstaller();

  if (isWindows) {
    await ensureWindowsUserPath();
  } else {
    ensurePosixShellPath();
  }

  if (!fs.existsSync(executablePath)) {
    console.warn('Install completed, but the expected executable was not found at ' + executablePath + '.');
    console.warn('Restart VS Code or run the official installer manually if the agy command is still unavailable.');
    process.exit(0);
  }

  console.log('Antigravity CLI installed at ' + executablePath + '.');
  console.log("Run 'agy' to get started.");
  console.log('Restart VS Code if existing terminals do not see the updated PATH.');
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
`;
}

export { ANTIGRAVITY_INSTALL_SH_URL, ANTIGRAVITY_INSTALL_PS1_URL };
