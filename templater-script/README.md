# Obsidian Templater Scripts

Copy HTTPS redirect links directly from Obsidian with a hotkey.

## Prerequisites

- [Templater plugin](https://github.com/SilentVoid13/Templater) installed in Obsidian

## Installation

1. **Copy scripts to your vault**
   - Create a folder in your vault (e.g., `Scripts/`)
   - Copy `copy-redirect-link.js` (standard format) to that folder
   - Copy `copy-redirect-link-adv.js` (Advanced URI format) to that folder

2. **Configure Templater**
   - Open Settings → Templater → User Script Functions
   - Set "Script files folder location" to your Scripts folder
   - Enable "Enable User Scripts"

3. **Bind hotkeys**
   - Open Settings → Hotkeys
   - Search for "Templater: copy-redirect-link"
   - Assign your preferred hotkey (e.g., `Cmd+Shift+L`)
   - Search for "Templater: copy-redirect-link-adv"
   - Assign a different hotkey (e.g., `Cmd+Shift+A`)

## Usage

### Standard Format
1. Open any note in Obsidian
2. Press your hotkey (e.g., `Cmd+Shift+L`)
3. The HTTPS redirect link is now in your clipboard
4. Paste into Google Tasks, GitHub, Slack, etc.

**Example output:**
```
https://lockmeister.github.io/obsidianlinks/open?vault=MyVault&file=My%20Note
```

### Advanced URI Format
1. Open any note in Obsidian
2. Press your hotkey (e.g., `Cmd+Shift+A`)
3. The HTTPS redirect link (Advanced URI) is now in your clipboard

**Example output:**
```
https://lockmeister.github.io/obsidianlinks/adv-uri?vault=MyVault&filepath=My%20Note
```

## Customization

If you're using a custom domain instead of GitHub Pages, edit the scripts and change:

```javascript
const REDIRECT_BASE = "https://lockmeister.github.io/obsidianlinks";
```

to your custom domain:

```javascript
const REDIRECT_BASE = "https://your-domain.com";
```

## Troubleshooting

**"No active file found"**
- Make sure you have a note open when triggering the command

**Hotkey doesn't work**
- Verify Templater is enabled
- Check that User Scripts are enabled in Templater settings
- Verify the script folder path is correct

**Script doesn't appear in hotkeys**
- Templater needs to be reloaded after adding new scripts
- Try closing and reopening Obsidian
- Check that the script file names match exactly

## Zero Maintenance

These scripts have no dependencies beyond Templater and require no updates. They'll continue working indefinitely.
