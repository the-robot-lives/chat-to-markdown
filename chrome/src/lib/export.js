/*
 * chat-to-markdown — document assembly + copy/download actions.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  function yamlEscape(s) {
    return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }

  function buildFrontMatter(meta) {
    const rows = [
      'title: ' + yamlEscape(meta.title || ''),
      'source: ' + (meta.source || ''),
      'url: ' + (meta.url || ''),
      'exported: ' + (meta.date || new Date().toISOString().slice(0, 10))
    ];
    return '---\n' + rows.join('\n') + '\n---';
  }

  function slugify(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '');
  }

  function buildFilename(title, date) {
    const d = date || new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return (slugify(title) || 'chat') + '-' + d.getFullYear() + '-' + mm + '-' + dd + '.md';
  }

  function buildDocument(meta, turns) {
    const parts = [buildFrontMatter(meta)];
    if (meta.title) parts.push('# ' + meta.title);
    for (const t of turns) {
      parts.push('## ' + (t.role === 'assistant' ? 'Assistant' : 'User'));
      parts.push(C2M.domToMarkdown(t.element));
    }
    return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.documentElement.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (e2) {
        return false;
      }
    }
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  C2M.export = {
    buildFrontMatter: buildFrontMatter,
    slugify: slugify,
    buildFilename: buildFilename,
    buildDocument: buildDocument,
    copyText: copyText,
    downloadText: downloadText
  };
})();
