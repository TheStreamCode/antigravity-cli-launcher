# Antigravity CLI Launcher

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-antigravity-cli-launcher?label=Marketplace&color=6366F1)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-antigravity-cli-launcher)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/mikesoft.vscode-antigravity-cli-launcher?color=0EA5E9)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-antigravity-cli-launcher)
[![Open VSX](https://img.shields.io/open-vsx/v/mikesoft/vscode-antigravity-cli-launcher?label=Open%20VSX&color=a60ee5)](https://open-vsx.org/extension/mikesoft/vscode-antigravity-cli-launcher)
[![CI](https://github.com/TheStreamCode/antigravity-cli-launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/antigravity-cli-launcher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-TheStreamCode-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/TheStreamCode)

Antigravity CLI Launcher is an unofficial VS Code extension that launches Antigravity CLI (`agy`) in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux.

Current documented release: `0.1.7`. See `CHANGELOG.md` for release-by-release changes.

Repository: https://github.com/TheStreamCode/antigravity-cli-launcher

> **✨ Want one launcher for every agent?** Try **[Super CLI](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-super-cli)** — a single sidebar that launches Claude Code, Codex, Copilot, Cursor, Grok, Kilo, Antigravity, OpenCode, and more. Install this launcher for Antigravity alone, or Super CLI for the whole set.

> **Independent project disclaimer**
> This extension is an independent, unofficial project. It is not affiliated with, endorsed by, sponsored by, or approved by Google. Antigravity, agy, Google, and related names, logos, and trademarks are property of their respective owners. This project does not include official Google or Antigravity logos.

## Features

- Adds a launcher button to the editor title toolbar
- Opens a fresh side terminal beside the active editor on every launch
- Uses the active editor workspace when available, with a fallback to the first open workspace folder
- Runs the configurable Antigravity CLI command, defaulting to `agy`
- Detects when the default `agy` command is missing and offers the official installation guide
- Opens installation guidance in the external browser without downloading or executing installer content
- Never changes PATH or shell profile files
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code 1.103.0 or newer
- Antigravity CLI installed by the user and available in the integrated terminal environment

## Installation

1. Install the extension from the VS Code Marketplace or from a local `.vsix` package.
2. Open a workspace or file in VS Code.
3. Click the Antigravity CLI Launcher button in the editor title toolbar.

If Antigravity CLI is already installed and `agy` is on PATH, the launcher starts immediately.

Install Antigravity CLI yourself by following the [official Google installation guide](https://antigravity.google/docs/cli/install). Review the instructions before running any command, then restart VS Code if new terminals do not recognize `agy`.

## Installation Guidance

When the default `agy` command is missing, the extension explains that installation is user-directed and offers **Open Installation Guide**. This opens Google's authoritative Antigravity CLI installation page in the external browser.

For security and marketplace scanner compatibility, the extension does not download installer scripts, execute installation commands, create temporary installer files, change PATH, edit shell profiles, or rewrite the configured CLI command. Installation remains entirely under the user's control.

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

`antigravityCliLauncher.cliCommand` is a machine-level setting. Configure it from your user or remote machine settings, not from repository workspace settings.

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

## Troubleshooting

### The terminal opens but `agy` is not recognized

Follow the [official Google installation guide](https://antigravity.google/docs/cli/install), then restart VS Code so new terminal processes inherit any environment changes made during your user-directed setup.

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
npm ci
npm run check
npm run audit
npm run package
```

`npm run package` creates the `.vsix` file in the workspace root.

The repository includes unit tests, metadata and security checks, a VS Code Extension Host smoke test, dependency auditing, and CI coverage for Windows, macOS, and Linux.

## Support

Open a GitHub issue for bugs and feature requests. For support details, see `SUPPORT.md`.

Financial support for the independent maintainer is available through GitHub Sponsors: [github.com/sponsors/TheStreamCode](https://github.com/sponsors/TheStreamCode).

## License

Released under the MIT License. See `LICENSE` for details.
