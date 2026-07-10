# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Upgraded TypeScript from `^6.0.0` to `^7.0.0` (resolved 7.0.2). No source or configuration changes were required.
- Raised the minimum required VS Code version to `^1.103.0` and aligned `@types/vscode` to match, so `vsce` validation passes against the declared engine floor.
- Enabled TypeScript 6 compatibility in `tsconfig.json` and stopped tracking compiled `out/` output in git.

### Security

- Resolved npm audit vulnerabilities in transitive dependencies (`form-data`, `js-yaml`, `tmp`, `undici`) via `npm audit fix`.

## 0.1.3

### Changed

- Raised the minimum required VS Code version to `^1.93.0`, the actual floor for the terminal shell integration APIs the launcher uses. Earlier manifests declared `^1.86.0`, where those APIs are unavailable.

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
