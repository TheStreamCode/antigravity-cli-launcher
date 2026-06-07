# Antigravity CLI Launcher

Antigravity CLI Launcher is an unofficial VS Code extension that launches Antigravity CLI (`agy`) in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux.

Current documented release: `0.1.0`. See `CHANGELOG.md` for release-by-release changes.

Repository: https://github.com/TheStreamCode/antigravity-cli-launcher

> **Independent project disclaimer**
> This extension is an independent, unofficial project. It is not affiliated with, endorsed by, sponsored by, or approved by Google. Antigravity, agy, Google, and related names, logos, and trademarks are property of their respective owners. This project does not include official Google or Antigravity logos.

## Features

- Adds a launcher button to the editor title toolbar
- Opens a fresh side terminal beside the active editor on every launch
- Uses the active editor workspace when available, with a fallback to the first open workspace folder
- Runs the configurable Antigravity CLI command, defaulting to `agy`
- Offers consent-based guided installation when the default `agy` command is missing
- Adds the expected Antigravity binary directory to PATH during guided install where supported
- Falls back to the absolute installed `agy` executable path after guided install when enabled
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code `^1.86.0`
- Antigravity CLI available in the integrated terminal environment, or guided installation enabled

## Installation

1. Install the extension from the VS Code Marketplace or from a local `.vsix` package.
2. Open a workspace or file in VS Code.
3. Click the Antigravity CLI Launcher button in the editor title toolbar.

If Antigravity CLI is already installed and `agy` is on PATH, the launcher starts immediately.

Manual Antigravity CLI installation uses the official Google installer:

```bash
# macOS / Linux
curl -fsSL https://antigravity.google/cli/install.sh | bash
```

```powershell
# Windows PowerShell
irm https://antigravity.google/cli/install.ps1 | iex
```

## Guided Installation

When the launcher runs the default `agy` command and the integrated terminal reports that it is missing, the extension asks for explicit confirmation before installing anything.

If you choose **Install**, the extension opens a visible install terminal and runs a generated local Node script. That script invokes the official Google installer and then configures the expected PATH location.

Platform behavior:

- Windows: runs the official PowerShell installer (`irm https://antigravity.google/cli/install.ps1 | iex`) and ensures `%LOCALAPPDATA%\agy\bin` is present in the Windows user PATH using the Windows user environment API.
- macOS: runs the official installer (`curl -fsSL https://antigravity.google/cli/install.sh | bash`) through the active shell and ensures `$HOME/.local/bin` is present in the relevant shell startup files, including `.zshrc` and `.zprofile` for zsh.
- Linux: runs the official installer through the active shell and ensures `$HOME/.local/bin` is present in the relevant shell startup file, such as `.bashrc`, `.zshrc`, `.profile`, or fish config.

After a successful guided install, the extension can update `antigravityCliLauncher.cliCommand` to the detected absolute executable path. This makes the launcher work even before VS Code is restarted and before new terminals inherit the updated PATH.

The guided install flow is enabled by default, but it never runs without explicit confirmation.

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

When possible, the launcher opens the terminal in the workspace folder of the active editor. If the active editor is outside the workspace, it falls back to the first workspace folder in the current VS Code window.

The launcher checks command availability through VS Code terminal shell integration, so detection follows the same environment used by the integrated terminal rather than the extension host process.

For safety, the launcher is disabled in untrusted workspaces. The executable command is treated as machine-level user configuration and workspace-controlled command values are ignored, preventing a repository from changing the command that runs when you click the toolbar button.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `antigravityCliLauncher.cliCommand` | `agy` | Command executed when the launcher button is clicked. |
| `antigravityCliLauncher.terminalName` | `Antigravity` | Base label used for created launch terminals. |
| `antigravityCliLauncher.autoInstall` | `true` | Offer guided installation when the default `agy` command is missing. Installation still requires explicit confirmation. |
| `antigravityCliLauncher.preferAbsoluteInstalledPath` | `true` | After guided install, update the launch command to the detected absolute `agy` executable path. |

`antigravityCliLauncher.cliCommand`, `antigravityCliLauncher.autoInstall`, and `antigravityCliLauncher.preferAbsoluteInstalledPath` are machine-level settings. Configure them from your user or remote machine settings, not from repository workspace settings.

Use the Command Palette to open the extension settings:

- `Antigravity CLI Launcher: Open Settings`

Examples:

Default command:

```json
"antigravityCliLauncher.cliCommand": "agy"
```

Windows absolute executable path:

```json
"antigravityCliLauncher.cliCommand": "\"C:\\Users\\You\\AppData\\Local\\agy\\bin\\agy.exe\""
```

macOS or Linux absolute executable path:

```json
"antigravityCliLauncher.cliCommand": "\"/Users/you/.local/bin/agy\""
```

Disable guided install prompts:

```json
"antigravityCliLauncher.autoInstall": false
```

## Troubleshooting

### The terminal opens but `agy` is not recognized

Install Antigravity CLI with the official Google installer:

```bash
# macOS / Linux
curl -fsSL https://antigravity.google/cli/install.sh | bash
```

```powershell
# Windows PowerShell
irm https://antigravity.google/cli/install.ps1 | iex
```

If installation succeeds but existing terminals still do not see `agy`, restart VS Code so new terminal processes inherit the updated PATH.

### Windows PATH was updated but PowerShell still cannot find `agy`

Confirm that `%LOCALAPPDATA%\agy\bin` is present in your user PATH. Restart VS Code and open a new terminal. Existing terminal sessions do not automatically reload Windows user environment changes.

### Nothing happens after clicking the button

Check `antigravityCliLauncher.cliCommand` and verify that the same command works in a regular integrated terminal.

### Custom executable path on Windows

Quote executable paths that contain spaces. This is required for paths such as `"C:\Program Files\agy\agy.exe"`.

### Multi-root workspaces

The launcher prefers the workspace folder of the active editor. To control where Antigravity CLI starts in a multi-root window, open a file from the target workspace before clicking the toolbar button.

## Privacy

Antigravity CLI Launcher does not collect telemetry, analytics, or personal data.

The extension launches commands in your local VS Code integrated terminal. Antigravity CLI itself is a separate product with its own behavior, authentication, network access, and terms.

## Legal And Trademarks

This repository contains only the extension code and original launcher assets. It does not include official Google or Antigravity logos.

See `TRADEMARKS.md` for the full affiliation and trademark notice.

## Development

Local verification and packaging:

```bash
npm install
npm run check
npm run test:integration
npm run package
```

`npm run package` creates the `.vsix` file in the workspace root.

The repository includes unit tests, metadata checks, VS Code integration smoke tests, and CI coverage for Windows and Linux.

## Support

Open a GitHub issue for bugs and feature requests. For support details, see `SUPPORT.md`.

Financial support for the independent maintainer is available through GitHub Sponsors: [github.com/sponsors/TheStreamCode](https://github.com/sponsors/TheStreamCode).

## License

Released under the MIT License. See `LICENSE` for details.
