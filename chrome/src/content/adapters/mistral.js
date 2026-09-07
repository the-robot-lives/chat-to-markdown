/*
 * Site adapter: Le Chat / Mistral (chat.mistral.ai).
 * Selectors verified against a live conversation 2026-09-07:
 *   rows       — [class*="group/message"] (CSS-modules class; DOM renders
 *                each row twice — a zero-size measurement clone must be
 *                skipped via getBoundingClientRect).
 *   assistant  — row contains [data-testid="text-message-part"]; the part
 *                element is the export body.
 *   user       — rows without a text-message-part (plain text in the row).
 * Caveat: a non-text-only assistant turn (e.g. bare image gen) would
 * classify as user until more part types are observed.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  const HOSTS = ['chat.mistral.ai', 'mistral.ai'];

  function isCurrentSite() {
    const h = location.hostname;
    return HOSTS.some(function (x) { return h === x || h.endsWith('.' + x); });
  }

  function getTurns() {
    const out = [];
    document.querySelectorAll('[class*="group/message"]').forEach(function (row) {
      const rect = row.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return; // hidden clone
      const part = row.querySelector('[data-testid="text-message-part"]');
      if (part) out.push({ role: 'assistant', element: part });
      else out.push({ role: 'user', element: row });
    });
    return out;
  }

  function getTitle() {
    return (document.title || '')
      .replace(/\s*[-–|]\s*(Le Chat|Mistral AI|Mistral)\s*$/i, '')
      .trim() || 'Le Chat conversation';
  }

  function getConversation() {
    const turns = getTurns();
    if (!turns.length) return null;
    return { title: getTitle(), turns: turns };
  }

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({
    id: 'mistral',
    label: 'Le Chat',
    isCurrentSite: isCurrentSite,
    getConversation: getConversation,
    prepareTurn: function (el) { return C2M.toolCalls.prepareTurn(el); }
  });
})();
