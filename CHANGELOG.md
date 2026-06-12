# Changelog

All notable changes to this project will be documented in this file.

## 0.1.2

### Changed

- Unified the `LICENSE` copyright holder to **Michael Gasperini (Mikesoft)**. No functional changes.

## 0.1.1

### Changed

- Marketplace discoverability: added the **AI** and **Chat** categories, a more descriptive title and summary, and reordered keywords.
- Added Marketplace, Open VSX, CI, and GitHub Sponsors badges, a `sponsor` link, and a pointer to **Super CLI** (the all-in-one launcher) to the README. No functional changes.

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
