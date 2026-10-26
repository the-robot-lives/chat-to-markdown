# Project Layout — Summary

Small MV3 Chrome extension, no build step, no dependencies. `chrome/` ships
as-is; tests run on Node's built-in runner.

```
chat-to-markdown/
├── chrome/
│   ├── manifest.json                # version = release source of truth; only permission: clipboardWrite
│   ├── icons/                       # 16/48/128 px icons
│   └── src/
│       ├── lib/                     # markdown.js (DOM→MD), export.js (MD/YAML assembly, copy/download)
│       └── content/
│           ├── main.js              # floating button + preview panel (shadow DOM)
│           └── adapters/            # index.js registry, generic.js pair engine, tool-calls.js summarizer,
│                                    #   + chatgpt/claude/gemini/openwebui/mistral/useai (live),
│                                    #   + grok/groq (experimental)
├── test/                            # mini-dom.js + markdown/export suites — node --test
├── scripts/package.sh               # local zip builder
├── .github/workflows/release.yml    # release pipeline (push to `release`)
├── release.yaml                     # pipeline config (auto_bump: patch)
├── PUBLISHING.md / PRIVACY.md / LICENSE / README.md
```

Load order (manifest): lib → tool-calls/generic → per-site adapters → index → main;
all modules share the `window.ChatToMarkdown` global.
