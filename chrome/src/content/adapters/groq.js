/*
 * Site adapter: Groq (chat.groq.com). EXPERIMENTAL — the saved-page snapshot
 * provided at authoring time carried only the app shell (messages are
 * JS-rendered; zero message markup recoverable), so selectors are generic
 * candidates. Re-verify with a live probe or a conversation-open capture.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  C2M.adapters = C2M.adapters || [];
  C2M.adapters.push(C2M.genericAdapter.makeAdapter({
    id: 'groq',
    label: 'Groq',
    hosts: ['chat.groq.com', 'groq.com'],
    pairs: [
      ['[data-testid="user-message"]', '[data-testid="assistant-message"]'],
      ['[class*="user-message"]', '[class*="assistant-message"]'],
      ['[class*="message-user"]', '[class*="message-assistant"]'],
      ['[class*="query"]', '[class*="response"]']
    ],
    titleStrip: /\s*[-–|]\s*Groq\s*$/i
  }));
})();
