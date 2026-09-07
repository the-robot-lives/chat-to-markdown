/*
 * Site adapter: Le Chat / Mistral (chat.mistral.ai). EXPERIMENTAL — DOM not
 * yet live-verified (automation permission denied at authoring time); uses
 * the generic candidate-pair engine. If the button doesn't appear, the
 * winning fix is a new pair from the real DOM.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push(C2M.genericAdapter.makeAdapter({
    id: 'mistral',
    label: 'Le Chat',
    hosts: ['chat.mistral.ai', 'mistral.ai'],
    pairs: [
      ['[data-testid="user-message"]', '[data-testid="assistant-message"]'],
      ['[class*="user-message"]', '[class*="assistant-message"]'],
      ['[class*="message-user"]', '[class*="message-assistant"]']
    ],
    titleStrip: /\s*[-–|]\s*(Le Chat|Mistral AI|Mistral)\s*$/i
  }));
})();
