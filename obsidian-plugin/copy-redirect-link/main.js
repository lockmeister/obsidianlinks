const { Plugin, Notice } = require('obsidian');

module.exports = class CopyRedirectLinkPlugin extends Plugin {
    async onload() {
        // Configuration - update this to your GitHub Pages URL
        const REDIRECT_BASE = "https://lockmeister.github.io/obsidianlinks";

        // Add command for standard format
        this.addCommand({
            id: 'copy-redirect-link',
            name: 'Copy HTTPS redirect link',
            callback: () => {
                const file = this.app.workspace.getActiveFile();
                if (!file) {
                    new Notice('No active file');
                    return;
                }

                const vault = this.app.vault.getName();
                const filePath = file.path.replace(/\.md$/, '');
                const httpsUrl = `${REDIRECT_BASE}/open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(filePath)}`;

                navigator.clipboard.writeText(httpsUrl);
                new Notice('✓ Redirect link copied!');
            }
        });

        // Add command for Advanced URI format (if needed)
        this.addCommand({
            id: 'copy-redirect-link-adv',
            name: 'Copy HTTPS redirect link (Advanced URI)',
            callback: () => {
                const file = this.app.workspace.getActiveFile();
                if (!file) {
                    new Notice('No active file');
                    return;
                }

                const vault = this.app.vault.getName();
                const filePath = file.path.replace(/\.md$/, '');
                const httpsUrl = `${REDIRECT_BASE}/adv-uri?vault=${encodeURIComponent(vault)}&filepath=${encodeURIComponent(filePath)}`;

                navigator.clipboard.writeText(httpsUrl);
                new Notice('✓ Advanced URI redirect link copied!');
            }
        });
    }
};
