/*
 * Generic adapter engine for sites without live-verified selectors.
 * Tries a list of {user, assistant} selector pairs until one matches; when
 * nothing matches the adapter reports null and the button simply never
 * appears (graceful no-op). Experimental adapters = candidate pairs only.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  function makeAdapter(opts) {
    // opts: {id, label, hosts, pairs: [[userSel, asstSel]], titleStrip?, titleTestid?}
    function isCurrentSite() {
      const h = location.hostname;
      return opts.hosts.some(function (x) { return h === x || h.endsWith('.' + x); });
    }

    function pick() {
      for (const pair of opts.pairs) {
        const users = document.querySelectorAll(pair[0]);
        const assts = document.querySelectorAll(pair[1]);
        if (users.length || assts.length) return { users: users, assts: assts };
      }
      return null;
    }

    function getTitle() {
      if (opts.titleTestid) {
        const el = document.querySelector(opts.titleTestid);
        if (el && el.textContent.trim()) return el.textContent.trim();
      }
      let t = document.title || '';
      if (opts.titleStrip) t = t.replace(opts.titleStrip, '');
      return t.trim() || 'conversation';
    }

    function getTurns() {
      const found = pick();
      if (!found) return [];
      const out = [];
      found.users.forEach(function (el) { out.push({ role: 'user', element: el }); });
      found.assts.forEach(function (el) { out.push({ role: 'assistant', element: el }); });
      out.sort(function (a, b) {
        const pos = a.element.compareDocumentPosition(b.element);
        return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      return out;
    }

    function getConversation() {
      const turns = getTurns();
      if (!turns.length) return null;
      return { title: getTitle(), turns: turns };
    }

    return {
      id: opts.id,
      label: opts.label,
      isCurrentSite: isCurrentSite,
      getConversation: getConversation,
      prepareTurn: function (el) { return C2M.toolCalls.prepareTurn(el); }
    };
  }

  C2M.genericAdapter = { makeAdapter: makeAdapter };
})();
