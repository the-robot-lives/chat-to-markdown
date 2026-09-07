/*
 * Site adapter: Open WebUI (self-hosted; webui.noizu.com).
 * Open-source UI with stable markers: message containers [id^="message-"]
 * (content child [id$="-content"]), role wrappers .chat-user / .chat-assistant.
 * For other self-hosted instances, add the domain to manifest.json matches —
 * detection also keys off the DOM, not just the hostname.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  function isCurrentSite() {
    const h = location.hostname;
    if (h === 'noizu.com' || h.endsWith('.noizu.com')) return true;
    return !!document.querySelector('[id^="message-"] .chat-assistant');
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
