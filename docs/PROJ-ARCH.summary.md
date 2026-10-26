# Project Architecture — Summary

- **What:** MV3 Chrome content-script-only extension exporting the visible
  LLM conversation to Markdown or API-format YAML. No build step, no deps, no
  background worker, no storage, no network access.
- **Module glue:** plain IIFEs on the shared `window.ChatToMarkdown` (`C2M`)
  global; manifest fixes load order (libs → adapter infra → per-site adapters
  → registry → UI).
- **Layers:** site adapters (`isCurrentSite` / `getConversation` /
  optional `prepareTurn`) → tool-call summarizer (clones only) →
  `markdown.js` DOM→MD converter (site-agnostic, minimal DOM surface) →
  `export.js` (MD + YAML assembly, slug filenames, copy/download) →
  `main.js` shadow-DOM preview panel (MD/YAML tabs, order toggle, refresh).
- **Detection:** hostname-suffix match for known sites; pure DOM-signature
  for the Open WebUI family (any instance); candidate selector pairs for
  experimental sites; 1.5 s retry loop until an SPA mounts a conversation.
- **Isolation:** shadow DOM both ways; host on `document.documentElement`
  survives SPA re-renders; content script in the isolated world.
- **Release:** push to `release` branch ⇒ Actions auto-bumps patch (when
  needed), zips `chrome/`, publishes a GitHub Release. Stores are manual.
- **Tests:** 22 zero-dep `node --test` tests over a hand-rolled mini-DOM.

Diagrams and rationale: `docs/PROJ-ARCH.md`.
