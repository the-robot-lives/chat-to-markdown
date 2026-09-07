/*
 * Site adapter: use.ai.
 * Selectors verified against a live conversation 2026-09-07:
 *   user      — [data-testid="message-user"]
 *   assistant — [data-testid="message-assistant"]
 *   content   — [data-testid="message-content"] inside each (falls back to
 *               the message node; action buttons are stripped converter-side).
 * Classes are Tailwind utilities otherwise (chat-message, chat-markdown,
 * group/message) — do not rely on them for turn detection.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  const HOSTS = ['use.ai'];

  function isCurrentSite() {
    const h = location.hostname;
    return HOSTS.some(function (x) { return h === x || h.endsWith('.' + x); });
  }

  function contentOf(messageEl) {
    return messageEl.querySelector('[data-testid="message-content"]') || messageEl;
  }

  function getTurns() {
    const out = [];
    document.querySelectorAll('[data-testid="message-user"]').forEach(function (el) {
      out.push({ role: 'user', element: contentOf(el) });
    });
    document.querySelectorAll('[data-testid="message-assistant"]').forEach(function (el) {
      out.push({ role: 'assistant', element: contentOf(el) });
    });
    out.sort(function (a, b) {
      const pos = a.element.compareDocumentPosition(b.element);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return out;
  }

  function getTitle() {
    return (document.title || '')
      .replace(/\s*[-–|]\s*Use AI\s*$/i, '')
      .trim() || 'Use AI conversation';
  }

  function getConversation() {
    const turns = getTurns();
    if (!turns.length) return null;
    return { title: getTitle(), turns: turns };
  }

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({
    id: 'useai',
    label: 'Use AI',
    isCurrentSite: isCurrentSite,
    getConversation: getConversation,
    prepareTurn: function (el) { return C2M.toolCalls.prepareTurn(el); }
  });
})();
