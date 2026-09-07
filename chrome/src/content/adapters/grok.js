/*
 * Site adapter: Grok (grok.com). EXPERIMENTAL — no live probe at authoring
 * time; generic candidate-pair engine. x.com/i/grok is not matched yet
 * (would require the full x.com content script); add later if wanted.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push(C2M.genericAdapter.makeAdapter({
    id: 'grok',
    label: 'Grok',
    hosts: ['grok.com'],
    pairs: [
      ['[data-testid="user-message"]', '[data-testid="assistant-message"]'],
      ['[class*="message-bubble"][class*="user"]', '[class*="message-bubble"][class*="assistant"]'],
      ['[class*="user-message"]', '[class*="assistant-message"]']
    ],
    titleStrip: /\s*[-–|]\s*Grok\s*$/i
  }));
})();
