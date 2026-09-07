/*
 * Site adapter: ChatGPT (chatgpt.com, chat.openai.com).
 *
 * Adapter contract: isCurrentSite() -> bool,
 * getConversation() -> {title, turns: [{role: 'user'|'assistant', element}]} | null.
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

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({ id: 'chatgpt', label: 'ChatGPT', isCurrentSite: isCurrentSite, getConversation: getConversation });
})();
