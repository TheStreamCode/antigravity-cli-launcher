# Contributing

Thank you for considering a contribution to Antigravity CLI Launcher.

## Development Setup

Prerequisites:

- Node.js 22 or newer
- npm
- Git

```bash
npm ci
npm run check
npm run audit
```

Use `npm run test:unit` for the fast unit and metadata suite, and `npm run test:integration` for the VS Code Extension Host smoke test. `npm run check` compiles the extension, runs both suites, and inspects the VSIX file list.

To debug interactively, open the repository in VS Code and press `F5`. The **Run Extension** configuration starts an Extension Development Host with the `npm: watch` build task; **Extension Tests** runs the smoke test in the same host.

## Project Rules

- Keep the extension independent and clearly unofficial.
- Do not add official Google or Antigravity logos, icons, artwork, screenshots, or brand assets without written permission from the rights holder.
- Keep user-facing wording clear that the project is not affiliated with, endorsed by, sponsored by, or approved by Google.
- Do not add telemetry, analytics, or personal data collection without explicit documentation and a reviewed privacy rationale.
- Keep helper logic in testable modules when possible.
- Add or update tests for behavior changes.
- Keep `@types/vscode` pinned to the minimum version declared in `engines.vscode` so newer APIs are not used accidentally.
- Keep GitHub Actions pinned to full commit SHAs and grant only the permissions each workflow needs.

## Pull Requests

Before opening a pull request, run:

```bash
npm run check
```

Include a concise description, user-visible behavior changes, and relevant verification output.

Do not commit generated `out/`, `.vscode-test/`, `node_modules/`, or `.vsix` artifacts.
