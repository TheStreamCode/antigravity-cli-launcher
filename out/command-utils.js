"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_TERMINAL_NAME = exports.FALLBACK_CLI_COMMAND = void 0;
exports.normalizeCliCommand = normalizeCliCommand;
exports.resolveCliCommandSetting = resolveCliCommandSetting;
exports.normalizeTerminalName = normalizeTerminalName;
exports.buildTerminalName = buildTerminalName;
exports.buildExtensionSettingsQuery = buildExtensionSettingsQuery;
exports.extractExecutable = extractExecutable;
exports.shouldPromptToInstallAntigravity = shouldPromptToInstallAntigravity;
exports.resolveTerminalCwd = resolveTerminalCwd;
const FALLBACK_CLI_COMMAND = 'agy';
exports.FALLBACK_CLI_COMMAND = FALLBACK_CLI_COMMAND;
const FALLBACK_TERMINAL_NAME = 'Antigravity';
exports.FALLBACK_TERMINAL_NAME = FALLBACK_TERMINAL_NAME;
const INSTALLABLE_EXECUTABLES = new Set(['agy']);
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getExecutableBaseName(command) {
    const executable = extractExecutable(command);
    const fileName = executable.split(/[\\/]/).pop() ?? executable;
    return fileName.replace(/\.(?:exe|cmd|bat|ps1)$/i, '').toLowerCase();
}
function buildCommandNotFoundPatterns(command) {
    const executableName = getExecutableBaseName(command);
    if (!executableName) {
        return [];
    }
    const escapedName = escapeRegExp(executableName);
    return [
        new RegExp(`(?:^|\\s)${escapedName}:\\s+command not found`, 'i'),
        new RegExp(`(?:^|\\s)${escapedName}:\\s+not found`, 'i'),
        new RegExp(`command not found:\\s*${escapedName}`, 'i'),
        new RegExp(`unknown command:?\\s*${escapedName}`, 'i'),
        new RegExp(`['"]?${escapedName}['"]?.*is not recognized`, 'i'),
        new RegExp(`\\b${escapedName}\\b.*not recognized as a name of a cmdlet`, 'i'),
        new RegExp(`\\b${escapedName}\\b.*cannot find the file`, 'i'),
        new RegExp(`no such file or directory:\\s*${escapedName}(?:\\s|$)`, 'i'),
    ];
}
/** Returns a trimmed CLI command with a safe fallback. */
function normalizeCliCommand(value, fallback = FALLBACK_CLI_COMMAND) {
    return (value ?? fallback).trim();
}
/** Resolves launch command from user-level configuration only, ignoring workspace-controlled values. */
function resolveCliCommandSetting(inspection, fallback = FALLBACK_CLI_COMMAND) {
    const value = inspection?.globalValue !== undefined
        ? inspection.globalValue
        : inspection?.defaultValue ?? fallback;
    return normalizeCliCommand(value, fallback);
}
/** Returns the configured terminal base name without any numeric suffix. */
function normalizeTerminalName(value, fallback = FALLBACK_TERMINAL_NAME) {
    return (value ?? fallback).trim() || fallback;
}
/** Returns the terminal label with the numeric suffix used by the extension. */
function buildTerminalName(value, sequence, fallback = FALLBACK_TERMINAL_NAME) {
    const baseName = normalizeTerminalName(value, fallback);
    const suffix = sequence <= 1 ? '' : ` ${sequence}`;
    return `${baseName}${suffix}`;
}
/** Returns the settings search query for the current extension id. */
function buildExtensionSettingsQuery(extensionId) {
    return `@ext:${extensionId}`;
}
/** Extracts the executable token while preserving quoted Windows paths with spaces. */
function extractExecutable(command) {
    const normalized = command.trim();
    if (!normalized) {
        return '';
    }
    const firstCharacter = normalized[0];
    if (firstCharacter === '"' || firstCharacter === "'") {
        const closingQuoteIndex = normalized.indexOf(firstCharacter, 1);
        if (closingQuoteIndex > 0) {
            return normalized.slice(1, closingQuoteIndex);
        }
    }
    const whitespaceIndex = normalized.search(/\s/);
    return whitespaceIndex === -1 ? normalized : normalized.slice(0, whitespaceIndex);
}
/** Returns whether a missing executable should offer the official Antigravity install flow. */
function shouldPromptToInstallAntigravity(command, exitCode, output) {
    const executableName = getExecutableBaseName(command);
    if (!INSTALLABLE_EXECUTABLES.has(executableName)) {
        return false;
    }
    if (exitCode === 127) {
        return true;
    }
    if (exitCode !== undefined && exitCode !== 1) {
        return false;
    }
    return buildCommandNotFoundPatterns(command).some((pattern) => pattern.test(output));
}
/** Resolves the terminal cwd from the active editor or the first workspace folder. */
function resolveTerminalCwd(activeEditor, workspace) {
    const activeWorkspaceFolder = activeEditor ? workspace.getWorkspaceFolder(activeEditor.document.uri) : undefined;
    return activeWorkspaceFolder?.uri ?? workspace.workspaceFolders?.[0]?.uri;
}
//# sourceMappingURL=command-utils.js.map