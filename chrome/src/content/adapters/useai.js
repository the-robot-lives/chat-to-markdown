/*
 * Site adapter: use.ai. EXPERIMENTAL — DOM probe blocked at authoring time
 * (share links redirect to the app; JS extraction denied); generic
 * candidate-pair engine until a verified selector set lands.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push(C2M.genericAdapter.makeAdapter({
    id: 'useai',
    label: 'Use AI',
    hosts: ['use.ai'],
    pairs: [
      ['[data-testid="user-message"]', '[data-testid="assistant-message"]'],
      ['[class*="user-message"]', '[class*="assistant-message"]'],
      ['[class*="message-user"]', '[class*="message-assistant"]'],
      ['[class*="chat-user"]', '[class*="chat-assistant"]']
    ]
  }));
})();
