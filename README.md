# Antigravity CLI Launcher

Launch the Antigravity CLI (`agy`) in a fresh side terminal from the editor toolbar

[![CI](https://github.com/TheStreamCode/antigravity-cli-launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/antigravity-cli-launcher/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-antigravity-cli-launcher?label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-antigravity-cli-launcher)

<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="Antigravity CLI Launcher icon">
</p>

Antigravity CLI Launcher is a small, unofficial VS Code extension for developers who already use Antigravity CLI and want a predictable one-click launcher inside the editor. It works in VS Code, Cursor, and Windsurf on Windows, macOS, and Linux wherever `agy` is available to the integrated terminal.

> **Independent and unofficial.** This extension is not affiliated with, endorsed by, sponsored by, or approved by Google. Installation and authentication remain under your control. See [`TRADEMARKS.md`](TRADEMARKS.md) for the full notice.

## Install

Install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-antigravity-cli-launcher), from [Open VSX](https://open-vsx.org/extension/mikesoft/vscode-antigravity-cli-launcher), or download the latest VSIX from [GitHub releases](https://github.com/TheStreamCode/antigravity-cli-launcher/releases/latest).

```bash
code --install-extension mikesoft.vscode-antigravity-cli-launcher
```

Antigravity CLI itself is a separate product. Install it from the [official Google installation guide](https://antigravity.google/docs/cli/install), review the instructions before running any command, and confirm that `agy` works in an integrated terminal.

## Quick start

1. Install Antigravity CLI and make sure `agy` runs in your integrated terminal.
2. Install this extension and open a file or workspace.
3. Trust the workspace and click the launcher button in the editor title bar.

Each click creates a new terminal beside the active editor and sends the configured command immediately. Existing terminals are not reused.

## Features

- Launcher button in the editor title toolbar
- A fresh side terminal for every launch
- Active-editor workspace selection, with the first workspace folder as fallback
- Configurable CLI command and terminal label
- Missing-command guidance that opens Google's official installation page
- Quoted Windows executable paths are preserved
- No PATH edits, shell-profile changes, installer downloads, or background services
- No telemetry, analytics, or personal data collection

## Requirements

- VS Code 1.103.0 or newer, or a compatible editor that provides the same extension API
- Antigravity CLI installed by the user and available in the integrated terminal environment

## Configuration

| Setting | Purpose | Default |
| --- | --- | --- |
| `antigravityCliLauncher.cliCommand` | Command executed when the launcher button is clicked. Machine-scoped; workspace values are ignored. | `agy` |
| `antigravityCliLauncher.terminalName` | Base label used for created launch terminals. | `Antigravity` |

Open the settings with **Antigravity CLI Launcher: Open Settings** from the Command Palette.

A Windows executable path that contains spaces must be quoted:

```json
"antigravityCliLauncher.cliCommand": "\"C:\\Users\\You\\AppData\\Local\\agy\\bin\\agy.exe\""
```

A macOS or Linux absolute path:

```json
"antigravityCliLauncher.cliCommand": "\"/Users/you/.local/bin/agy\""
```

## Privacy and security

The extension does not collect telemetry, analytics, or personal data. It launches commands in your local integrated terminal, and Antigravity CLI itself is a separate product with its own authentication, network access, and terms.

Launching is disabled in untrusted workspaces. `antigravityCliLauncher.cliCommand` is a machine-level setting: the extension ignores workspace-controlled values, so a repository cannot change the command that runs when you click the toolbar button. The extension may open the official installation guide, but it does not download or execute installer content, create installer scripts, modify `PATH`, or edit shell profiles. Installation remains entirely under the user's control.

See [`SECURITY.md`](SECURITY.md) for vulnerability reporting.

## Troubleshooting

### The terminal opens but `agy` is not recognized

Follow the [official Google installation guide](https://antigravity.google/docs/cli/install), then restart VS Code so new terminal processes inherit environment changes made during setup.

### Windows PATH was updated but terminals still cannot find `agy`

Confirm that `%LOCALAPPDATA%\agy\bin` is present in your user PATH. Restart VS Code and open a new terminal: existing terminal sessions do not reload Windows user environment changes.

### Nothing happens after clicking the button

Check `antigravityCliLauncher.cliCommand` and verify that the same command works in a regular integrated terminal. Confirm that the workspace is trusted.

### Custom executable path on Windows

Quote executable paths that contain spaces, for example `"C:\Program Files\agy\agy.exe"`.

### Multi-root workspaces

The launcher prefers the workspace folder of the active editor. To control where Antigravity CLI starts in a multi-root window, open a file from the target workspace before clicking the toolbar button.

## Development

Requirements: Node.js 22 or newer and npm. The repository uses npm with the committed `package-lock.json`.

```bash
git clone https://github.com/TheStreamCode/antigravity-cli-launcher.git
cd antigravity-cli-launcher
npm ci
npm run check
npm run audit
```

`npm run check` compiles the extension, runs the unit, security, and metadata tests, executes the VS Code Extension Host smoke test, and lists the files that would ship in the VSIX. `npm run package` creates a local `.vsix` file. Set `VSCODE_TEST_VERSION` to an exact VS Code version before `npm run test:integration` to validate the compatibility floor.

## Support

Open a [GitHub issue](https://github.com/TheStreamCode/antigravity-cli-launcher/issues) for bugs and feature requests, or read [`SUPPORT.md`](SUPPORT.md) for the information to include. Maintenance can be supported through [GitHub Sponsors](https://github.com/sponsors/TheStreamCode).

Looking for a single launcher for several coding agents? [Super CLI](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-super-cli) covers multiple agent CLIs from one sidebar.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Pull requests must pass the required CI checks.

## License

MIT License — see [`LICENSE`](LICENSE).

---

Maintained by [Michael Gasperini (Mikesoft)](https://mikesoft.it).
If this project is useful to you, consider [sponsoring its maintenance](https://github.com/sponsors/TheStreamCode).
