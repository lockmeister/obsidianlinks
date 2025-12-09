# Obsidian Link Redirector

Make your Obsidian notes clickable in any app. Many applications (Google Tasks, GitHub, Slack, etc.) only make `https://` links clickable and ignore Obsidian's `obsidian://` protocol links. This tool converts Obsidian links to HTTPS links that redirect back to the `obsidian://` protocol, allowing you to create clickable links to your local notes in any app. Links are private and local - they only work on your machine.

**Live tool:** https://lockmeister.github.io/obsidianlinks

## Features

- **Obsidian plugin** - Press a hotkey to instantly copy HTTPS redirect links
- **Web converter** - Paste `obsidian://` links to get shareable HTTPS versions
- **Link builder** - Create links from scratch without leaving your browser
- **PWA support** - Install as a web app for quick access
- **Privacy-focused** - All links are local to your machine, no data transmitted

## Quick Start

### Option 1: Plugin (Recommended)

1. Copy `obsidian-plugin/copy-redirect-link/` to your vault's `.obsidian/plugins/` directory
2. Restart Obsidian and enable the plugin
3. Set a hotkey in Settings → Hotkeys → "Copy HTTPS redirect link"
4. Press your hotkey in any note to copy the link

### Option 2: Web Tool

Visit https://lockmeister.github.io/obsidianlinks and paste your `obsidian://` link to convert it.

## How It Works

1. You generate a link like: `https://lockmeister.github.io/obsidianlinks/open?vault=MyVault&file=My%20Note`
2. Click the link from Google Tasks, GitHub, etc.
3. Browser redirects to `obsidian://open?vault=MyVault&file=My%20Note`
4. Obsidian opens your note

## Technical Details

- Static site hosted on GitHub Pages
- Client-side JavaScript (no server-side processing)
- Supports both standard Obsidian URLs and Advanced URI format
- PWA manifest for offline use

## License

MIT
