/*
 * Adapter registry — picks the adapter for the current site.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  C2M.getActiveAdapter = function () {
    return (C2M.adapters || []).find(function (a) {
      return a.isCurrentSite && a.isCurrentSite();
    }) || null;
  };
})();
