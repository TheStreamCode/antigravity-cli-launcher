# Repository Agent Guide

## Scope

This file applies to the entire repository. More specific `AGENTS.md` files, if
added later, override it only for their own subtrees.

## Project Overview

Antigravity CLI Launcher is a small, unofficial VS Code extension that opens the
user-installed `agy` command in a side terminal. It supports VS Code, Cursor, and
Windsurf on Windows, macOS, and Linux.

Keep the extension focused. It is a launcher, not an installer, package manager,
telemetry client, or wrapper around Antigravity authentication and networking.

## Repository Map

- `src/extension.ts`: VS Code activation, terminal lifecycle, commands, prompts,
  and editor integration.
- `src/command-utils.ts`: pure command parsing, configuration resolution, output
  bounds, missing-command detection, and workspace selection helpers.
- `test/*.test.js`: unit, security, and repository-metadata tests.
- `test/integration/`: VS Code Extension Host smoke test and its runner.
- `media/icon.png`: Marketplace icon.
- `media/launcher-mark.svg`: editor-title launcher icon.
- `package.json`: extension manifest, compatibility floor, scripts, and package
  metadata.
- `README.md`, `CHANGELOG.md`, `SECURITY.md`, `SUPPORT.md`, `TRADEMARKS.md`, and
  `CITATION.cff`: public documentation and release metadata.
- `.github/workflows/ci.yml`: Windows, Ubuntu, and macOS validation matrix.

`out/`, `.vscode-test/`, `node_modules/`, `.vsce/`, and `*.vsix` are generated or
local artifacts. Do not edit or commit them.

## Toolchain And Setup

- Use Node.js 22 or newer.
- Use npm and the committed `package-lock.json`; do not introduce another package
  manager or lockfile.
- Install exactly from the lockfile:

```bash
npm ci
```

Useful commands:

```bash
npm run test:unit          # Compile, then run unit/security/metadata tests
npm run test:command-utils # Focused helper tests
npm run test:metadata      # Manifest, docs, assets, and repository-policy tests
npm run test:integration   # VS Code Extension Host smoke test
npm run check              # Full compile, tests, integration test, and package list
npm run audit              # High-severity npm audit gate
npm run package            # Build a local ignored VSIX
```

Use `npm run check` as the default pre-handoff gate. Warnings emitted by the VS
Code test host are not failures by themselves; use the process exit code and test
summary. The integration runner must retain its short temporary user-data and
extensions paths so macOS does not exceed its Unix-domain socket path limit.

## Implementation Rules

- Keep TypeScript strict and preserve the checks in `tsconfig.json`.
- Put deterministic, editor-independent logic in `src/command-utils.ts` and cover
  it with focused Node tests. Keep VS Code API orchestration in `src/extension.ts`.
- Import compiled local modules with the `.js` suffix, as required by the current
  NodeNext configuration.
- Preserve the VS Code compatibility floor in `engines.vscode`. Keep
  `@types/vscode` pinned exactly to that minimum version so newer APIs cannot be
  introduced accidentally.
- Keep changes narrow. Do not add frameworks, runtime dependencies, background
  services, or abstractions that are not justified by current behavior.
- Update user-facing documentation and tests whenever behavior or configuration
  changes.

## Security Invariants

These behaviors are intentional and must not regress:

- Launching is blocked in untrusted workspaces.
- `antigravityCliLauncher.cliCommand` is machine-scoped. Runtime resolution uses
  the global/default value and ignores workspace-controlled command values.
- The extension may open the official installation guide, but it must not
  download or execute installers, create installer scripts, modify `PATH`, edit
  shell profiles, or rewrite the configured command.
- Missing-`agy` detection must remain conservative. Do not treat arbitrary exit
  code `127` or generic `not found` text from custom wrapper commands as proof that
  Antigravity is absent.
- Captured terminal output must remain bounded; long-running sessions must not
  cause unbounded memory growth. The current cap is 64 KiB.
- Do not add telemetry, analytics, personal-data collection, credential handling,
  or secret logging without an explicit product decision and corresponding
  security/privacy documentation.

Run `npm run audit` after dependency changes. Never commit tokens, credentials,
local environment files, or private workspace data.

## Tests

- Behavior changes in `src/command-utils.ts` require focused unit tests.
- Changes to activation, terminal creation, commands, or contributed manifest
  items require an integration-test review and, where practical, a smoke-test
  update.
- Changes involving installation guidance or command execution require updates to
  `test/install-security.test.js` when the enforced security contract changes.
- Manifest, documentation, workflow, icon, version, or packaging changes require
  corresponding assertions in `test/metadata.test.js`.
- Tests intentionally consume compiled `out/` files. Compile through npm scripts;
  never hand-edit generated JavaScript.

## Icons, Brand, And Legal Copy

- Preserve the visual appearance of both icons. `media/icon.png` must remain
  visually unchanged. `media/launcher-mark.svg` may only receive lossless
  optimizations whose rendered output is pixel-identical.
- Do not regenerate or replace either icon casually. If optimizing an asset,
  compare before/after rendering and report both file sizes.
- Keep the toolbar SVG within the size budget enforced by metadata tests.
- Do not add official Google or Antigravity logos, screenshots, artwork, or other
  brand assets without written permission from the rights holder.
- Keep the project clearly described as unofficial and not affiliated with,
  endorsed by, sponsored by, or approved by Google.
- Retain relevant trademark attribution in `README.md` and `TRADEMARKS.md`.

## Dependencies And GitHub Workflows

- Prefer the smallest dependency surface and avoid runtime dependencies when a
  platform or Node API is sufficient.
- Keep `package.json` and `package-lock.json` synchronized.
- GitHub Actions must remain pinned to full commit SHAs and use least-privilege
  permissions, bounded timeouts, and deterministic `npm ci` installs.
- CI must continue validating Windows, Ubuntu, and macOS. Linux Extension Host
  tests require `xvfb-run`.

## Release Process

Do not bump versions, create tags, push, publish releases, or modify live GitHub
settings unless the user explicitly authorizes those actions.

For an authorized release:

1. Choose a new immutable semantic version. Never move an already published tag.
2. Synchronize the version in `package.json`, `package-lock.json`, `CITATION.cff`,
   the README release line, issue-form placeholder, and metadata tests.
3. Move completed notes from `[Unreleased]` into the new `CHANGELOG.md` section.
4. Run `npm ci`, `npm run audit`, and `npm run check`.
5. Build the explicitly named VSIX and record its size and SHA-256.
6. Commit only intended files, create an annotated `vX.Y.Z` tag, and push only
   when authorized.
7. Create the GitHub Release with the VSIX attached, then verify the remote asset
   digest and all CI/CodeQL checks.

Visual Studio Marketplace and Open VSX publication is performed by the repository
owner. Do not attempt or claim those publications unless the owner explicitly
delegates them. Read-only verification of the public versions and checksums is
allowed when relevant.

## Git And Handoff

- Inspect `git status` before editing and preserve unrelated user changes.
- Never stage, rewrite, or discard files outside the requested scope.
- Do not use destructive Git commands or force-push unless explicitly requested.
- Do not commit generated VSIX, `out/`, test-host downloads, or dependency folders.
- Report separately what was edited, validated, committed, pushed, released, and
  publicly verified. Do not describe a local or pending state as published.
- A task is complete only when the requested behavior and documentation are
  aligned, relevant checks pass, and remaining external blockers are stated
  plainly.
