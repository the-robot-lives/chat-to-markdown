/*
 * Shared tool-call summarization for adapters.
 *
 * Collapsible tool chips (<details><summary>…</summary>, class*="tool-call")
 * become two summary lines in markdown mode:
 *   tool-call made to <name>
 *   tool-call-response: <status> response <size>
 * and are stripped entirely in yaml mode (their data travels as role: tool
 * messages instead).
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  function isToolCallElement(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === 'DETAILS' && el.querySelector('summary')) return true;
    return /tool[-_ ]?call/i.test(el.getAttribute('class') || '');
  }

  function summarize(el) {
    const summary = el.querySelector('summary');
    let name = ((summary && summary.textContent) || el.getAttribute('aria-label') || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
    if (!name) name = 'tool call';
    const code = (summary && summary.textContent.match(/\b([1-5]\d{2})\b/));
    return {
      name: name,
      // Most UIs don't expose HTTP status; print one only if shown.
      status: code ? code[1] : 'ok',
      bytes: (el.textContent || '').length
    };
  }

  function collect(root, transform) {
    const marked = new Set();
    root.querySelectorAll('*').forEach(function (node) {
      if (marked.has(node)) return;
      if (!isToolCallElement(node)) return;
      node.querySelectorAll('*').forEach(function (d) { marked.add(d); });
      if (!node.parentNode) return; // already removed with an outer tool call
      transform(node);
    });
  }

  function prepareTurn(el) {
    const withLines = el.cloneNode(true);
    const tools = [];
    collect(withLines, function (node) {
      const s = summarize(node);
      tools.push(s);
      const p1 = document.createElement('p');
      p1.textContent = 'tool-call made to ' + s.name;
      const p2 = document.createElement('p');
      p2.textContent = 'tool-call-response: ' + s.status + ' response ' +
        C2M.export.formatBytes(s.bytes);
      node.parentNode.insertBefore(p1, node);
      node.parentNode.replaceChild(p2, node);
    });
    const clean = el.cloneNode(true);
    collect(clean, function (node) {
      node.parentNode.removeChild(node);
    });
    return { element: withLines, elementClean: clean, tools: tools };
  }

  C2M.toolCalls = {
    isToolCallElement: isToolCallElement,
    summarize: summarize,
    prepareTurn: prepareTurn
  };
})();
