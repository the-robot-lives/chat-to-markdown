/*
 * Site adapter: Open WebUI (self-hosted — ANY instance).
 * Detection is DOM-based, not hostname-based: Open WebUI renders message
 * containers as [id^="message-"] (content child [id$="-content"]) with
 * .chat-user / .chat-assistant role wrappers. The extension injects on all
 * http(s) pages but stays inert unless this signature (or another adapter's
 * site) matches. No instance configuration needed.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  function isCurrentSite() {
    // any Open WebUI instance, self-hosted anywhere — pure DOM signature;
    // known Open WebUI-derived public sites are matched explicitly too
    const h = location.hostname;
    if (h === 'chat.z.ai' || h.endsWith('.z.ai')) return true;
    return !!(document.querySelector('[id^="message-"]') &&
              document.querySelector('.chat-assistant, .chat-user'));
  }

  function getTurns() {
    const out = [];
    document.querySelectorAll('[id^="message-"]').forEach(function (container) {
      if (/-content$/.test(container.id)) return;
      const content = container.querySelector('[id$="-content"]') || container;
      if (container.querySelector('.chat-user')) {
        out.push({ role: 'user', element: content });
      } else if (container.querySelector('.chat-assistant')) {
        out.push({ role: 'assistant', element: content });
      }
    });
    return out;
  }

  function getTitle() {
    return (document.title || '')
      .replace(/\s*[·|]\s*Open WebUI\s*$/i, '')
      .trim() || 'Open WebUI conversation';
  }

  function getConversation() {
    const turns = getTurns();
    if (!turns.length) return null;
    return { title: getTitle(), turns: turns };
  }

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push({
    id: 'openwebui',
    label: 'Open WebUI',
    isCurrentSite: isCurrentSite,
    getConversation: getConversation,
    prepareTurn: function (el) { return C2M.toolCalls.prepareTurn(el); }
  });
})();
