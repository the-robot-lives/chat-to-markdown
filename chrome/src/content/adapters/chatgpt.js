/*
 * Site adapter: ChatGPT (chatgpt.com, chat.openai.com).
 *
 * Adapter contract: isCurrentSite() -> bool,
 * getConversation() -> {title, turns: [{role: 'user'|'assistant', element}]} | null,
 * optional prepareTurn(el) -> {element, elementClean, tools} used in place of
 * the live element (works on clones; must not mutate the page):
 *   element      — tool blocks replaced by two summary lines (markdown mode)
 *   elementClean — tool blocks removed entirely (yaml mode)
 *   tools        — [{name, status, bytes}] in document order
 *
 * Selectors are defensive fallbacks — ChatGPT's DOM changes often; prefer
 * data-* attributes and degrade to structural guesses.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  const HOSTS = ['chatgpt.com', 'chat.openai.com'];

  function isCurrentSite() {
    const h = location.hostname;
    return HOSTS.some(function (x) { return h === x || h.endsWith('.' + x); });
  }

  function getTitle() {
    const el = document.querySelector('[data-testid="conversation-title-button"]');
    if (el && el.textContent.trim()) return el.textContent.trim();
    return (document.title || '')
      .replace(/\s*[-–]\s*ChatGPT\s*$/i, '')
      .trim() || 'ChatGPT conversation';
  }

  function getTurns() {
    const out = [];
    const turnEls = document.querySelectorAll('[data-testid^="conversation-turn"]');
    turnEls.forEach(function (turnEl) {
      const roleEl = turnEl.querySelector('[data-message-author-role]');
      let role = roleEl ? roleEl.getAttribute('data-message-author-role') : null;
      const bodyEl = roleEl
        ? (roleEl.querySelector('.markdown') || roleEl)
        : (turnEl.querySelector('.markdown') || turnEl);
      if (!role) role = bodyEl.querySelector('.markdown') ? 'assistant' : 'user';
      if (role !== 'assistant' && role !== 'user') return;
      out.push({ role: role, element: bodyEl });
    });
    return out;
  }

  function getConversation() {
    const turns = getTurns();
    if (!turns.length) return null;
    return { title: getTitle(), turns: turns };
  }

  // ------------------------------------------------------- tool calls
  // ChatGPT renders tool invocations (web search, browsing, code runs, image
  // gens) as collapsible chips — <details><summary>Searched 5 sites</summary>
  // …</details> and similar.

  function isToolCallElement(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === 'DETAILS' && el.querySelector('summary')) return true;
    return /tool[-_ ]?call/i.test(el.getAttribute('class') || '');
  }

  function summarizeToolCall(el) {
    const summary = el.querySelector('summary');
    let name = ((summary && summary.textContent) || el.getAttribute('aria-label') || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
    if (!name) name = 'tool call';
    const code = (summary && summary.textContent.match(/\b([1-5]\d{2})\b/));
    return {
      name: name,
      // ChatGPT's UI doesn't expose HTTP status; print one only if shown.
      status: code ? code[1] : 'ok',
      bytes: (el.textContent || '').length
    };
  }

  function collectToolCalls(root, transform) {
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
    collectToolCalls(withLines, function (node) {
      const s = summarizeToolCall(node);
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
    collectToolCalls(clean, function (node) {
      node.parentNode.removeChild(node);
    });
    return { element: withLines, elementClean: clean, tools: tools };
  }

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({
    id: 'chatgpt',
    label: 'ChatGPT',
    isCurrentSite: isCurrentSite,
    getConversation: getConversation,
    prepareTurn: prepareTurn
  });
})();
