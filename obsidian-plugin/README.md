# Obsidian Plugin: Copy Redirect Link

Copy shareable HTTPS redirect links directly from Obsidian with a hotkey.

## Installation

1. **Download the plugin folder:**
   - [Download copy-redirect-link folder](https://github.com/mitre/obsidianlinks/tree/master/obsidian-plugin/copy-redirect-link)
   - Click "Code" → "Download ZIP" from the repo, then extract the `obsidian-plugin/copy-redirect-link` folder

2. **Copy to your vault:**
   - Find your vault's `.obsidian/plugins/` folder
   - If you can't see `.obsidian`, enable "Show hidden files" in your file explorer
   - Copy the `copy-redirect-link` folder into `.obsidian/plugins/`

3. **Enable the plugin:**
   - Restart Obsidian
   - Go to Settings → Community plugins
   - Scroll down and toggle ON "Copy Redirect Link"

4. **Set a hotkey:**
   - Go to Settings → Hotkeys
   - Search for "Copy HTTPS redirect"
   - Click the + button and assign your preferred hotkey (e.g., `Cmd+Shift+L`)

## Usage

1. Open any note in Obsidian
2. Press your hotkey
3. The HTTPS redirect link is now in your clipboard
4. Paste it into Google Tasks, GitHub, Slack, etc.

## Two Commands

- **Copy HTTPS redirect link** - Standard format (most common)
- **Copy HTTPS redirect link (Advanced URI)** - For Advanced URI plugin users

You can assign hotkeys to both or just the one you need.

## What Links Look Like

Standard:
```
https://lockmeister.github.io/obsidianlinks/open?vault=MyVault&file=My%20Note
```

Advanced URI:
```
https://lockmeister.github.io/obsidianlinks/adv-uri?vault=MyVault&filepath=My%20Note
```

## Customization

If you're using a custom domain instead of GitHub Pages, edit `main.js` and change:

```javascript
const REDIRECT_BASE = "https://lockmeister.github.io/obsidianlinks";
```

to your domain:

```javascript
const REDIRECT_BASE = "https://your-domain.com";
```
