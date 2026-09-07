/*
 * Site adapter: Gemini (gemini.google.com/app).
 * Selectors verified against a live conversation 2026-09-07:
 *   user      — <user-query> custom element; export body is its
 *               <user-query-content> child.
 *   assistant — <model-response> custom element; export body is its
 *               <message-content> child (skips the response-container
 *               header chrome).
 *   title     — document.title minus " - Google Gemini".
 * Thinking/tool accordions inside model-response fall through the shared
 * tool-call heuristics; refine here as more part types are observed.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  const HOSTS = ['gemini.google.com'];

  function isCurrentSite() {
    const h = location.hostname;
    return HOSTS.some(function (x) { return h === x || h.endsWith('.' + x); });
  }

  function getTurns() {
    const out = [];
    document.querySelectorAll('user-query').forEach(function (el) {
      out.push({ role: 'user', element: el.querySelector('user-query-content') || el });
    });
    document.querySelectorAll('model-response').forEach(function (el) {
      out.push({ role: 'assistant', element: el.querySelector('message-content') || el });
    });
    out.sort(function (a, b) {
      const pos = a.element.compareDocumentPosition(b.element);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return out;
  }

  function getTitle() {
    return (document.title || '')
      .replace(/\s*[-–]\s*Google Gemini\s*$/i, '')
      .trim() || 'Gemini conversation';
  }

  function getConversation() {
    const turns = getTurns();
    if (!turns.length) return null;
    return { title: getTitle(), turns: turns };
  }

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({
    id: 'gemini',
    label: 'Gemini',
    isCurrentSite: isCurrentSite,
    getConversation: getConversation,
    prepareTurn: function (el) { return C2M.toolCalls.prepareTurn(el); }
  });
})();
