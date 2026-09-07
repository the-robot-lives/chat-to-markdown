/*
 * Site adapter: Claude (claude.ai, incl. /share/ pages).
 * Selectors verified against a live /share/ page 2026-09-07:
 *   user      — [data-testid="user-message"]
 *   assistant — content node under [class*="msg-assistant-pb"] inside its
 *               message-row; rows carrying neither are aria-only headers
 *               ("You said:" / "Claude responded:") and are skipped.
 * The sr-only header text is additionally stripped converter-side.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  const HOSTS = ['claude.ai'];

  function isCurrentSite() {
    const h = location.hostname;
    return HOSTS.some(function (x) { return h === x || h.endsWith('.' + x); });
  }

  function getTurns() {
    const out = [];
    document.querySelectorAll('[class*="message-row"]').forEach(function (row) {
      const userEl = row.querySelector('[data-testid="user-message"]');
      if (userEl) {
        out.push({ role: 'user', element: userEl });
        return;
      }
      const asstEl = row.querySelector('[class*="msg-assistant-pb"]');
      if (asstEl) {
        out.push({ role: 'assistant', element: asstEl });
      }
    });
    return out;
  }

  function getTitle() {
    const el = document.querySelector('[data-testid="conversation-title"]');
    if (el && el.textContent.trim()) return el.textContent.trim();
    const t = (document.title || '').replace(/\s*[-–|]\s*Claude\s*$/i, '').trim();
    if (t && t.toLowerCase() !== 'claude') return t;
    const firstUser = document.querySelector('[data-testid="user-message"]');
    return firstUser
      ? firstUser.textContent.trim().replace(/\s+/g, ' ').slice(0, 80)
      : 'Claude conversation';
  }

  function getConversation() {
    const turns = getTurns();
    if (!turns.length) return null;
    return { title: getTitle(), turns: turns };
  }

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({
    id: 'claude',
    label: 'Claude',
    isCurrentSite: isCurrentSite,
    getConversation: getConversation,
    prepareTurn: function (el) { return C2M.toolCalls.prepareTurn(el); }
  });
})();
