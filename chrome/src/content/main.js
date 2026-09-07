/*
 * Floating export button (shadow DOM so site styles can't touch it, and it
 * can't touch site styles). Attached to <html> so SPA re-renders inside body
 * don't remove it.
 */
(function () {
  const C2M = window.ChatToMarkdown;
  if (!C2M || !C2M.getActiveAdapter) return;
  const adapter = C2M.getActiveAdapter();
  if (!adapter) return;
  if (document.getElementById('chat-to-markdown-host')) return;

  const host = document.createElement('div');
  host.id = 'chat-to-markdown-host';
  host.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      .c2m-wrap { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
      .c2m-menu { display:none; flex-direction:column; background:#1f2430; border:1px solid #3a4150;
                  border-radius:10px; overflow:hidden; box-shadow:0 6px 24px rgba(0,0,0,.35); }
      .c2m-menu.open { display:flex; }
      .c2m-item { background:none; border:0; color:#e8eaed; padding:8px 14px; font:13px system-ui,sans-serif;
                  text-align:left; cursor:pointer; white-space:nowrap; }
      .c2m-item:hover { background:#2c3342; }
      .c2m-btn { background:#1f2430; color:#e8eaed; border:1px solid #3a4150; border-radius:999px;
                 padding:7px 14px; font:600 12px system-ui,sans-serif; cursor:pointer;
                 box-shadow:0 4px 16px rgba(0,0,0,.3); }
      .c2m-btn:hover { background:#2c3342; }
      .c2m-toast { position:fixed; right:20px; bottom:64px; background:#1f2430; color:#e8eaed;
                   border:1px solid #3a4150; padding:8px 12px; border-radius:8px;
                   font:13px system-ui,sans-serif; opacity:0; transition:opacity .2s; pointer-events:none; }
      .c2m-toast.show { opacity:1; }
    </style>
    <div class="c2m-wrap">
      <div class="c2m-menu" data-role="menu">
        <button class="c2m-item" data-action="copy">Copy Markdown</button>
        <button class="c2m-item" data-action="download">Download .md</button>
      </div>
      <button class="c2m-btn" data-role="toggle" title="Export this conversation as Markdown">MD ▾</button>
    </div>
    <div class="c2m-toast" data-role="toast"></div>`;
  document.documentElement.appendChild(host);

  const qs = function (sel) { return shadow.querySelector(sel); };
  const menu = qs('[data-role="menu"]');
  const toast = qs('[data-role="toast"]');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  qs('[data-role="toggle"]').addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('open');
  });
  document.addEventListener('click', function () { menu.classList.remove('open'); });

  function currentDoc() {
    const conv = adapter.getConversation();
    if (!conv || !conv.turns.length) {
      showToast('No conversation found');
      return null;
    }
    const meta = {
      title: conv.title,
      source: location.hostname,
      url: location.href,
      date: new Date().toISOString().slice(0, 10)
    };
    return {
      filename: C2M.export.buildFilename(conv.title),
      md: C2M.export.buildDocument(meta, conv.turns)
    };
  }

  menu.addEventListener('click', async function (e) {
    const action = e.target && e.target.getAttribute && e.target.getAttribute('data-action');
    if (!action) return;
    menu.classList.remove('open');
    const doc = currentDoc();
    if (!doc) return;
    if (action === 'copy') {
      const ok = await C2M.export.copyText(doc.md);
      showToast(ok ? 'Copied as Markdown' : 'Copy failed');
    }
    if (action === 'download') {
      C2M.export.downloadText(doc.filename, doc.md);
      showToast('Downloaded ' + doc.filename);
    }
  });
})();
