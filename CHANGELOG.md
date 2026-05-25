# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0

### Added

- Added Antigravity CLI launcher command for opening Antigravity CLI in a side terminal from the editor toolbar.
- Added consent-based guided install flow that uses the official Google installer only after explicit confirmation.
- Added Windows, macOS, and Linux PATH handling for the guided install flow.
- Added absolute installed path fallback so the launcher can work before VS Code reloads updated PATH values.
- Added configurable command, terminal name, guided install, and absolute path preferences.
- Added Workspace Trust gating and machine-scoped launch command configuration to avoid workspace-controlled command execution.
- Added unit tests, VS Code integration smoke tests, metadata checks, package inspection, and CI coverage.
- Added legal, support, security, and trademark documentation for a public repository.
