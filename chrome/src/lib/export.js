/*
 * chat-to-markdown — document assembly + copy/download actions.
 * Two export modes: Markdown (buildDocument) and API-format YAML
 * (buildYaml: a `messages:` array of {role, content} entries, tool calls
 * surfaced as role: tool messages).
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
    turns.forEach(function (t, i) {
      parts.push('## ' + (t.role === 'assistant' ? 'Assistant' : 'User'));
      parts.push(C2M.domToMarkdown(t.element));
      if (i < turns.length - 1) parts.push('* * *');
    });
    return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function formatBytes(n) {
    n = Number(n) || 0;
    return n >= 1024 ? (n / 1024).toFixed(1) + ' kB' : n + ' bytes';
  }

  function yamlBlockLines(text, indent) {
    const pad = new Array(indent + 1).join(' ');
    return String(text).split('\n').map(function (l) {
      return l ? pad + l : '';
    }).join('\n');
  }

  // turns: [{role, element, tools?: [{name, status, bytes}]}]
  function buildYaml(meta, turns) {
    const out = [];
    out.push('title: ' + yamlEscape(meta.title || ''));
    out.push('source: ' + (meta.source || ''));
    out.push('url: ' + (meta.url || ''));
    out.push('exported: ' + (meta.date || new Date().toISOString().slice(0, 10)));
    out.push('messages:');
    if (!turns.length) return out.join('\n') + '  []\n';
    turns.forEach(function (t) {
      out.push('  - role: ' + t.role);
      const body = C2M.domToMarkdown(t.element);
      if (body) {
        out.push('    content: |-');
        out.push(yamlBlockLines(body, 6));
      } else {
        out.push('    content: ""');
      }
      (t.tools || []).forEach(function (tool) {
        out.push('  - role: tool');
        out.push('    name: ' + yamlEscape(tool.name || 'tool'));
        out.push('    content: ' + yamlEscape(
          'tool-call-response: ' + (tool.status || 'ok') +
          ' response ' + formatBytes(tool.bytes || 0)
        ));
      });
    });
    return out.join('\n') + '\n';
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
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
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
    buildYaml: buildYaml,
    formatBytes: formatBytes,
    copyText: copyText,
    downloadText: downloadText
  };
})();
