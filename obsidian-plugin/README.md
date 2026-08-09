# Obsidian Plugin: Universal Links and Locky Share

One desktop plugin with two separate jobs:

1. Copy HTTPS redirect links that open a note in the owner's local Obsidian vault.
2. Publish portable, private copies of one or more notes through Locky Share.

## Installation

Copy `copy-redirect-link/` into the vault's `.obsidian/plugins/` directory, enable **Copy Redirect Link**, then reload Obsidian.

## Universal redirect links

Commands:

- **Copy HTTPS redirect link**
- **Copy HTTPS redirect link (Advanced URI)**

The existing `Cmd+Shift+L` hotkey can remain assigned to either command. These links redirect to the local `obsidian://` protocol; they do not expose note content.

## Private Locky Share pages

- Open a note and run **Share current note via Locky Share…**.
- Or select one or more notes/folders in the file explorer, right-click, and select **Share … via Locky Share…**.
- Enter recipient emails and publish.
- Multiple notes become one navigable page with one URL.
- Embedded images are copied into the rendered page.
- Re-sharing the same note or exact note selection updates the existing URL and replaces its recipient list.

The first publish on each computer opens a browser approval page. The resulting credential can only create and update Obsidian publications; it cannot read ordinary shares, files, or Wormholes. It is stored through Obsidian's encrypted SecretStorage and is never written into the vault or plugin data.

Published pages are manual snapshots. Later note edits remain private until **Update shared copy** is selected. Use **Disconnect Locky Share publishing on this computer** to revoke the local scoped credential.

## Security

- Always review selected note paths and recipient emails in the confirmation dialog.
- Publishing is private by default and requires at least one recipient email.
- Scripts, forms, iframes, objects, and inline event handlers are removed from rendered notes.
- Internal links only remain clickable when the target note is included in the same publication.
