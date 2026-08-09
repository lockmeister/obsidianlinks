const {
  Plugin, Notice, Modal, Setting, MarkdownRenderer, Component, TFile, TFolder, requestUrl,
} = require('obsidian');
const crypto = require('crypto');
const http = require('http');
const os = require('os');
const { shell } = require('electron');

const REDIRECT_BASE = 'https://lockmeister.github.io/obsidianlinks';
const PUBLIC_ORIGIN = 'https://share.lockystoys.com';
const API_ORIGIN = 'https://share-api.lockystoys.com';
const SECRET_ID = 'locky-share-obsidian-token';
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'avif']);
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml', avif: 'image/avif' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function listenHighPort(server) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const port = 49152 + crypto.randomInt(65535 - 49152);
    try {
      await new Promise((resolve, reject) => {
        const failed = (error) => { server.off('listening', ready); reject(error); };
        const ready = () => { server.off('error', failed); resolve(); };
        server.once('error', failed); server.once('listening', ready); server.listen(port, '127.0.0.1');
      });
      return port;
    } catch (error) {
      if (error.code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error('Could not reserve a local connection port');
}

class LockyShareModal extends Modal {
  constructor(plugin, files) {
    super(plugin.app);
    this.plugin = plugin;
    this.files = files;
    this.titleValue = files.length === 1 ? files[0].basename : `${files.length} Obsidian notes`;
    this.recipientValue = plugin.settings.recentRecipients || '';
  }

  onOpen() {
    this.setTitle(this.plugin.publicationFor(this.files) ? 'Update Locky Share page' : 'Share via Locky Share');
    this.contentEl.createEl('p', { text: this.files.length === 1 ? this.files[0].path : `${this.files.length} notes will be published as one private page.` });
    const list = this.contentEl.createEl('div', { cls: 'locky-note-list' });
    this.files.slice(0, 30).forEach((file) => list.createEl('div', { text: file.path }));
    if (this.files.length > 30) list.createEl('div', { text: `…and ${this.files.length - 30} more` });
    new Setting(this.contentEl).setName('Page title').addText((text) => text.setValue(this.titleValue).onChange((value) => { this.titleValue = value; }));
    new Setting(this.contentEl).setName('Recipient emails').setDesc('Comma-separated. Only these people can open the page.').addText((text) => {
      text.setPlaceholder('friend@example.com').setValue(this.recipientValue).onChange((value) => { this.recipientValue = value; });
      text.inputEl.style.width = '100%';
    });
    const existing = this.plugin.publicationFor(this.files);
    if (existing) this.contentEl.createEl('p', { text: `This updates the existing link: ${existing.url}`, cls: 'setting-item-description' });
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText(existing ? 'Update shared copy' : 'Publish private page').setCta().onClick(async () => {
        button.setDisabled(true);
        try {
          const result = await this.plugin.publish(this.files, this.titleValue, this.recipientValue);
          await navigator.clipboard.writeText(result.url);
          this.close();
          new Notice(`${result.created ? 'Shared' : 'Updated'} and copied link`);
        } catch (error) {
          new Notice(`Locky Share: ${error.message || error}`);
          button.setDisabled(false);
        }
      }))
      .addButton((button) => button.setButtonText('Cancel').onClick(() => this.close()));
  }

  onClose() { this.contentEl.empty(); }
}

module.exports = class CopyRedirectLinkPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({ recentRecipients: '', publications: {} }, await this.loadData());
    this.addCommand({
      id: 'copy-redirect-link', name: 'Copy HTTPS redirect link', callback: () => this.copyRedirect(false),
    });
    this.addCommand({
      id: 'copy-redirect-link-adv', name: 'Copy HTTPS redirect link (Advanced URI)', callback: () => this.copyRedirect(true),
    });
    this.addCommand({
      id: 'share-current-note-locky', name: 'Share current note via Locky Share…',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!(file instanceof TFile) || file.extension !== 'md') return false;
        if (!checking) this.openShare([file]);
        return true;
      },
    });
    this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
      const files = this.collectMarkdown([file]);
      if (files.length) menu.addItem((item) => item.setTitle('Share via Locky Share…').setIcon('share-2').onClick(() => this.openShare(files)));
    }));
    this.registerEvent(this.app.workspace.on('files-menu', (menu, selected) => {
      const files = this.collectMarkdown(selected);
      if (files.length) menu.addItem((item) => item.setTitle(`Share ${files.length} note${files.length === 1 ? '' : 's'} via Locky Share…`).setIcon('share-2').onClick(() => this.openShare(files)));
    }));
  }

  copyRedirect(advanced) {
    const file = this.app.workspace.getActiveFile();
    if (!file) return new Notice('No active file');
    const vault = this.app.vault.getName();
    const filePath = file.path.replace(/\.md$/, '');
    const url = advanced
      ? `${REDIRECT_BASE}/adv-uri?vault=${encodeURIComponent(vault)}&filepath=${encodeURIComponent(filePath)}`
      : `${REDIRECT_BASE}/open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(filePath)}`;
    navigator.clipboard.writeText(url);
    new Notice('Redirect link copied');
  }

  collectMarkdown(items) {
    const output = [];
    const visit = (item) => {
      if (item instanceof TFile && item.extension === 'md') output.push(item);
      else if (item instanceof TFolder) item.children.forEach(visit);
    };
    (items || []).forEach(visit);
    return [...new Map(output.map((file) => [file.path, file])).values()].sort((a, b) => a.path.localeCompare(b.path));
  }

  openShare(files) {
    if (!files.length) return new Notice('Choose at least one Markdown note');
    new LockyShareModal(this, files).open();
  }

  publicationKey(files) {
    const identity = `${this.app.vault.getName()}\n${files.map((file) => file.path).sort().join('\n')}`;
    return crypto.createHash('sha256').update(identity).digest('hex');
  }

  publicationFor(files) { return this.settings.publications[this.publicationKey(files)] || null; }

  async ensureToken() {
    if (!this.app.secretStorage?.isEncryptionAvailable()) throw new Error('Obsidian secure storage is unavailable on this computer');
    const existing = this.app.secretStorage.getSecret(SECRET_ID);
    if (existing?.startsWith('ob_')) return existing;
    const state = crypto.randomBytes(32).toString('base64url');
    let finish;
    const callback = new Promise((resolve, reject) => { finish = { resolve, reject }; });
    const server = http.createServer((request, response) => {
      try {
        const url = new URL(request.url, 'http://127.0.0.1');
        const token = url.searchParams.get('token') || '';
        if (url.searchParams.get('state') !== state || !token.startsWith('ob_')) throw new Error('Connection response did not match');
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Connection': 'close' });
        response.end('<!doctype html><title>Obsidian connected</title><h1>Obsidian connected</h1><p>Return to Obsidian to finish publishing.</p>');
        finish.resolve(token);
      } catch (error) {
        response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', 'Connection': 'close' }); response.end('Connection failed');
        finish.reject(error);
      } finally { server.close(); }
    });
    const port = await listenHighPort(server);
    const callbackUrl = `http://127.0.0.1:${port}/callback`;
    const request = Buffer.from(JSON.stringify({ callback: callbackUrl, state, name: `${os.hostname()} Obsidian` })).toString('base64url');
    const connectUrl = `${PUBLIC_ORIGIN}/obsidian/connect#request=${request}`;
    await shell.openExternal(connectUrl);
    new Notice('Approve the Obsidian connection in your browser');
    const timer = setTimeout(() => { server.close(); finish.reject(new Error('Connection timed out after five minutes')); }, 300000);
    try {
      const token = await callback;
      this.app.secretStorage.setSecret(SECRET_ID, token);
      return token;
    } finally { clearTimeout(timer); }
  }

  async api(method, route, body) {
    const token = await this.ensureToken();
    const response = await requestUrl({
      url: `${API_ORIGIN}${route}`, method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      throw: false,
    });
    if (response.status >= 200 && response.status < 300) return response.json;
    if (response.status === 401) this.app.secretStorage.deleteSecret(SECRET_ID);
    throw new Error(response.json?.error || `service returned ${response.status}`);
  }

  async inlineImageEmbeds(markdown, sourcePath) {
    const pattern = /!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
    let output = '', cursor = 0, match;
    while ((match = pattern.exec(markdown)) !== null) {
      output += markdown.slice(cursor, match.index);
      const target = this.app.metadataCache.getFirstLinkpathDest(match[1], sourcePath);
      if (target instanceof TFile && IMAGE_EXTENSIONS.has(target.extension.toLowerCase())) {
        const bytes = await this.app.vault.readBinary(target);
        const encoded = Buffer.from(bytes).toString('base64');
        const width = /^\d+$/.test(match[2] || '') ? ` style="max-width:${match[2]}px"` : '';
        output += `<img src="data:${MIME[target.extension.toLowerCase()]};base64,${encoded}" alt="${escapeHtml(target.basename)}"${width}>`;
      } else output += match[0];
      cursor = pattern.lastIndex;
    }
    return output + markdown.slice(cursor);
  }

  async renderNote(file, includedPaths) {
    const markdown = await this.inlineImageEmbeds(await this.app.vault.read(file), file.path);
    const component = new Component(); component.load();
    const container = document.createElement('div');
    try { await MarkdownRenderer.render(this.app, markdown, container, file.path, component); }
    finally { component.unload(); }
    container.querySelectorAll('script,iframe,object,embed,form').forEach((element) => element.remove());
    for (const element of container.querySelectorAll('*')) {
      for (const attribute of [...element.attributes]) {
        if (/^on/i.test(attribute.name) || /^(?:javascript|file|app):/i.test(attribute.value.trim())) element.removeAttribute(attribute.name);
      }
    }
    for (const link of container.querySelectorAll('a.internal-link')) {
      const target = this.app.metadataCache.getFirstLinkpathDest(link.dataset.href || link.getAttribute('href') || '', file.path);
      if (target && includedPaths.has(target.path)) link.setAttribute('href', `#note-${crypto.createHash('sha256').update(target.path).digest('hex').slice(0, 12)}`);
      else { link.removeAttribute('href'); link.classList.add('not-included'); link.title = 'This note was not included in the shared copy'; }
    }
    for (const image of container.querySelectorAll('img')) {
      const src = image.getAttribute('src') || '';
      if (src.startsWith('data:')) continue;
      try {
        const response = await fetch(src); const bytes = Buffer.from(await response.arrayBuffer());
        image.setAttribute('src', `data:${response.headers.get('content-type') || 'application/octet-stream'};base64,${bytes.toString('base64')}`);
      } catch { image.remove(); }
    }
    return container.innerHTML;
  }

  async buildHtml(files, title) {
    const included = new Set(files.map((file) => file.path));
    const sections = [];
    for (const file of files) {
      const id = crypto.createHash('sha256').update(file.path).digest('hex').slice(0, 12);
      sections.push(`<article class="note" id="note-${id}"><p class="source-path">${escapeHtml(file.path)}</p><h1>${escapeHtml(file.basename)}</h1>${await this.renderNote(file, included)}</article>`);
    }
    const nav = files.length > 1 ? `<nav><strong>Shared notes</strong>${files.map((file) => `<a href="#note-${crypto.createHash('sha256').update(file.path).digest('hex').slice(0, 12)}">${escapeHtml(file.basename)}</a>`).join('')}</nav>` : '';
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${escapeHtml(title)}</title><style>:root{--paper:#f5f0e4;--ink:#172019;--accent:#a3442b;--line:#c9c0ae;--muted:#5f685f}*{box-sizing:border-box}html{background:var(--paper);scroll-behavior:smooth}body{margin:0;color:var(--ink);font:17px/1.7 "Aptos","Gill Sans",sans-serif}.layout{width:min(1120px,calc(100% - 36px));margin:0 auto;padding:48px 0 90px}nav{position:sticky;top:0;z-index:2;display:flex;gap:16px;align-items:center;overflow:auto;padding:14px 0;background:var(--paper);border-bottom:2px solid var(--ink)}nav a{white-space:nowrap}.note{width:min(820px,100%);margin:0 auto;padding:42px 0 70px;border-bottom:1px solid var(--line)}h1,h2,h3,h4{font-family:"Iowan Old Style","Palatino Linotype",serif;line-height:1.1}h1{font-size:clamp(48px,9vw,84px);letter-spacing:-.05em;margin:0 0 36px;border-bottom:4px solid var(--ink);padding-bottom:18px}h2{font-size:36px;border-top:2px solid var(--ink);padding-top:22px;margin-top:58px}h3{font-size:25px;margin-top:34px}a{color:var(--accent);text-underline-offset:3px}.not-included{color:inherit;text-decoration:underline dotted;cursor:not-allowed}.source-path{color:var(--muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase}img{display:block;max-width:100%;height:auto;margin:26px auto 8px;border:1px solid var(--line)}blockquote,.callout{margin:26px 0;padding:10px 20px;border-left:5px solid var(--accent);background:#ebe3d3}pre{overflow:auto;padding:18px;background:#172019;color:#f5f0e4}code{font-family:"Cascadia Code","IBM Plex Mono",monospace;font-size:.9em}li{margin:.4em 0}.task-list-item{list-style:none}@media(max-width:650px){body{font-size:16px}.layout{padding-top:20px}h2{font-size:30px}}@media(prefers-color-scheme:dark){:root{--paper:#181c1a;--ink:#eee9df;--accent:#e47b5d;--line:#3d4541;--muted:#a8ada8}blockquote,.callout{background:#26241e}pre{background:#090b0a}}</style></head><body><main class="layout">${nav}${sections.join('')}</main></body></html>`;
  }

  async publish(files, title, rawRecipients) {
    const recipients = [...new Set(rawRecipients.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean))];
    if (!recipients.length || recipients.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error('Enter valid recipient emails');
    const publicationKey = this.publicationKey(files);
    const html = await this.buildHtml(files, title.trim());
    const result = await this.api('POST', '/api/obsidian/publish', {
      publicationKey, title: title.trim(), html, recipients, notePaths: files.map((file) => file.path),
    });
    this.settings.recentRecipients = recipients.join(', ');
    this.settings.publications[publicationKey] = { url: result.url, shareId: result.shareId, notePaths: files.map((file) => file.path) };
    await this.saveData(this.settings);
    return result;
  }
};
