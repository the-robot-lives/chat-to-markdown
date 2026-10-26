# Project Layout

chat-to-markdown is a deliberately small repository: a Manifest V3 Chrome
extension with **no build step and no dependencies**. `chrome/` is shipped
exactly as authored (the release artifact is a plain `zip` of that directory)
and the test suite runs on Node's built-in runner with a hand-rolled mini-DOM.

```
chat-to-markdown/
├── chrome/                          # Extension bundle — shipped as-is, zipped at archive root
│   ├── manifest.json                # MV3 manifest: version (release source of truth), permissions, content-script load order
│   ├── icons/                       # Toolbar/store icons (16 / 48 / 128 px PNG)
│   └── src/
│       ├── lib/                     # Site-agnostic libraries — loaded before every adapter
│       │   ├── markdown.js          # DOM → Markdown converter (blocks, inline, tables, KaTeX math)
│       │   └── export.js            # Document assembly (MD + YAML modes), filename slugging, copy/download
│       └── content/
│           ├── main.js              # Floating "MD ▾" button + preview panel (shadow DOM), mode/order toggles
│           └── adapters/            # One file per supported site + shared registry
│               ├── index.js         # Registry — C2M.getActiveAdapter() picks the first matching adapter
│               ├── generic.js       # makeAdapter() engine — candidate {user, assistant} selector pairs for unverified sites
│               ├── tool-calls.js    # Shared tool-call summarizer (collapsible chips → summary lines / role:tool entries)
│               ├── chatgpt.js       # ChatGPT (chatgpt.com, chat.openai.com) — live-verified
│               ├── claude.js        # Claude (claude.ai) — live-verified
│               ├── gemini.js        # Gemini (gemini.google.com) — live-verified
│               ├── openwebui.js     # Open WebUI family, any instance incl. z.ai — DOM-signature detection, no hostname needed
│               ├── mistral.js       # Le Chat (chat.mistral.ai, mistral.ai) — live-verified
│               ├── useai.js         # use.ai (Grok-powered front end; distinct from grok.com) — live-verified
│               ├── grok.js          # Grok (grok.com) — EXPERIMENTAL, candidate pairs only
│               └── groq.js          # Groq (chat.groq.com, groq.com) — EXPERIMENTAL, candidate pairs only
├── test/                            # Zero-dependency node:test suite — `node --test`
│   ├── mini-dom.js                  # Minimal DOM stand-in implementing exactly the converter's touched surface
│   ├── markdown.test.js             # Converter tests (inline, blocks, tables, math)
│   └── export.test.js               # Document/YAML assembly + filename tests
├── scripts/
│   └── package.sh                   # Local packaging: zips chrome/ to chat-to-markdown-v<version>.zip
├── .github/
│   ├── workflows/release.yml        # Release pipeline — runs on every push to the `release` branch
│   └── RELEASE_BODY.md              # Install notes attached to every GitHub release
├── release.yaml                     # Release pipeline config: version file, branch, auto_bump policy, artifact name
├── PUBLISHING.md                    # Publishing runbook: GitHub Releases (automated) + Chrome/Edge stores (manual)
├── PRIVACY.md                       # Privacy policy — local-only processing, no collection
├── LICENSE                          # MIT
└── README.md                        # Project entry point — features, supported sites, install
```

## Notes

- **Load order matters.** `manifest.json` `content_scripts.js` lists the libs
  first (`markdown.js`, `export.js`), then shared adapter infrastructure
  (`tool-calls.js`, `generic.js`), then one file per site, then the registry
  (`index.js`) and UI (`main.js`). All modules communicate through the shared
  `window.ChatToMarkdown` (`C2M`) global — there are no imports.
- **No required configuration.** There is no `.envrc`, `.env.example`, or
  build config; the repo is loaded unpacked directly from `chrome/`.
- **README drift (checked 2026-10-27, post-#3):** README now lists Cerebras
  Inference Chat / LMArena under Roadmap (accurate — no such adapter files in
  tree). One residual mismatch: the Experimental line still claims `x.com`
  for Grok, but `grok.js` matches `grok.com` only (per its own header and
  `hosts`). The generic-engine adapters present are `grok.js` and `groq.js`.
