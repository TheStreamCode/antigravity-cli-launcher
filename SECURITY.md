# Security Policy

## Reporting Vulnerabilities

Please do not report security vulnerabilities through public GitHub issues.

Send vulnerability reports to `info@mikesoft.it` with enough detail to reproduce the issue. Avoid including secrets, tokens, private repository contents, or personal data unless strictly necessary.

## Security Model

Antigravity CLI Launcher does not collect telemetry, analytics, or personal data.

The extension can launch a user-configured command in the VS Code integrated terminal. Treat `antigravityCliLauncher.cliCommand` as trusted local configuration. The extension does not execute that command outside the integrated terminal.

When `agy` is missing, the extension can open the official Google installation guide in the external browser. It does not download or execute installer content, create installer files, modify PATH or shell profiles, or change the configured command after installation. Users remain responsible for reviewing and following the official instructions.

Antigravity CLI is a separate third-party product with its own authentication, network behavior, and security model.
