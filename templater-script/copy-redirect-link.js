/**
 * Templater script to copy HTTPS redirect link for current Obsidian note
 *
 * Setup:
 * 1. Copy this file to your vault (e.g., Scripts/copy-redirect-link.js)
 * 2. In Templater settings → User Script Functions → set script folder path
 * 3. Bind a hotkey: Settings → Hotkeys → search "Templater: copy-redirect-link"
 *
 * Usage:
 * - Press your hotkey while viewing any note
 * - HTTPS redirect link is copied to clipboard
 */

async function copyRedirectLink(tp) {
    // Configuration - update this to your GitHub Pages URL
    const REDIRECT_BASE = "https://lockmeister.github.io/obsidianlinks";

    // Get current file and vault
    const file = tp.file.find_tfile(tp.file.path(true));
    if (!file) {
        new Notice("No active file found");
        return "";
    }

    const vault = app.vault.getName();
    const filePath = file.path.replace(/\.md$/, ''); // Remove .md extension

    // Build obsidian:// URL (standard format)
    const obsidianUrl = `obsidian://open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(filePath)}`;

    // Convert to HTTPS redirect URL
    const httpsUrl = `${REDIRECT_BASE}/open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(filePath)}`;

    // Copy to clipboard
    await navigator.clipboard.writeText(httpsUrl);

    new Notice("✓ Redirect link copied!");

    // Return empty string so it doesn't insert anything into the note
    return "";
}

module.exports = copyRedirectLink;
