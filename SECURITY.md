# Security Policy

## Supported Versions

Security fixes are provided for the latest published release. Upgrade to the latest Marketplace, Open VSX, or GitHub release before reporting a problem that may already be resolved.

## Reporting Vulnerabilities

Please do not report security vulnerabilities through public GitHub issues. Use [GitHub private vulnerability reporting](https://github.com/TheStreamCode/antigravity-cli-launcher/security/advisories/new) whenever possible so maintainers can discuss and remediate the report confidentially.

If GitHub private reporting is unavailable, send the report to `info@mikesoft.it` with enough detail to reproduce the issue. Avoid including secrets, tokens, private repository contents, or personal data unless strictly necessary.

Include the affected extension version, editor version, operating system, reproduction steps, impact, and any suggested mitigation. The maintainer will coordinate disclosure after a fix or mitigation is available.

## Security Model

Antigravity CLI Launcher does not collect telemetry, analytics, or personal data.

The extension can launch a user-configured command in the VS Code integrated terminal. Treat `antigravityCliLauncher.cliCommand` as trusted local configuration. The extension does not execute that command outside the integrated terminal.

When `agy` is missing, the extension can open the official Google installation guide in the external browser. It does not download or execute installer content, create installer files, modify PATH or shell profiles, or change the configured command after installation. Users remain responsible for reviewing and following the official instructions.

Antigravity CLI is a separate third-party product with its own authentication, network behavior, and security model.
