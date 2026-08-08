# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Added a dedicated CI smoke test for the minimum supported VS Code `1.103.0`, while retaining latest-stable coverage on Windows, macOS, and Linux.

### Security

- Refreshed locked transitive development dependencies to resolve high-severity advisories in `fast-uri`, `js-yaml`, and `undici`. The published extension continues to ship without runtime dependencies.

## 0.1.9 - 2026-08-01

### Fixed

- Launch listeners are now released as soon as a launch finishes or its terminal is closed, instead of staying registered for the lifetime of the window. Repeated launches no longer accumulate terminal shell-integration and shell-execution subscriptions.

### Changed

- Extended the VS Code Extension Host smoke test to cover a second launch, verifying that each click opens a distinct terminal with the expected sequence suffix.
- Documented the repository layout, the individual verification scripts, and `F5` debugging in `README.md` and `CONTRIBUTING.md`.

### Added

- `.vscode/launch.json` and `.vscode/tasks.json` with **Run Extension** and **Extension Tests** debug configurations backed by the `npm: watch` build task. Both are excluded from the published VSIX.
- `.gitignore` entry for the local `.antigravitycli/` state directory created by Antigravity CLI in a workspace.

### Security

- `npm audit --audit-level=high` reports no vulnerabilities. `@types/node` and `@types/vscode` remain pinned to the declared Node and VS Code compatibility floors, so no dependency updates were applied.

## 0.1.8

### Fixed

- Isolated VS Code integration-test user data and extensions in short-lived temporary directories, avoiding the macOS Unix-domain socket path limit in CI.

## 0.1.7

### Changed

- Bounded terminal shell-output capture to prevent long-running Antigravity sessions from growing extension memory without limit.
- Losslessly reduced the toolbar SVG size while preserving pixel-identical rendering and leaving the Marketplace icon unchanged.
- Removed a stale icon generator that did not reproduce the tracked Marketplace artwork.
- Added macOS CI coverage, workflow concurrency controls, timeouts, immutable action pins, stricter TypeScript checks, and repository-wide editor settings.
- Replaced legacy issue templates with validated GitHub issue forms and expanded contribution and pull-request guidance.
- Pinned VS Code API types to the declared compatibility floor and refreshed Node/test dependencies.

### Security

- Resolved the high-severity `brace-expansion` development dependency advisory.
- Added a dependency-audit command and CI gate, private vulnerability reporting guidance, and least-privilege workflow hardening.
- Removed the dormant Dependabot auto-merge workflow after version-update PRs were intentionally disabled.

## 0.1.6

### Changed

- Replaced guided installation with a link to the authoritative Google Antigravity CLI installation guide.
- Removed obsolete automatic-install settings and documented user-directed installation.

### Security

- Removed all installer downloads, remote script execution, temporary installer generation, PATH updates, shell profile edits, and automatic launch-command rewrites for marketplace scanner compatibility.

## 0.1.5

### Changed

- Improved legal documentation, trademark notices, third-party terms references, and metadata cleanup.

## 0.1.4

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
