# chat-to-markdown

**Repo:** https://github.com/the-robot-lives/chat-to-markdown

> Browser extension that turns LLM chat conversations into clean, portable Markdown — copy or download in one click.

**Status:** v0.6.1 — MD + YAML preview panel with message-order toggle, tool-call summaries · **License:** MIT

## Why

Chats with LLMs are where real work happens, but every vendor locks the transcript inside its own web UI. chat-to-markdown extracts the conversation — turns, code blocks, tables, math — and converts it to standard Markdown you can copy to the clipboard or save as a `.md` file. Parsing happens locally in the page; no account, no telemetry.

## What

A Manifest V3 Chrome extension (content-script only, no build step, no dependencies). A floating **MD ▾** button appears on supported chat sites and opens a preview panel with **MD** / **YAML** tabs plus Copy, Save, and Refresh.

**Live-verified adapters:** ChatGPT, Claude, Gemini (`gemini.google.com`), z.ai, Open WebUI (any self-hosted instance — pure DOM detection, covers Open WebUI-derived sites), use.ai (a Grok-powered front-end, distinct from xAI's grok.com), Le Chat (`chat.mistral.ai`).

**Experimental** (selectors unverified — the button simply won't appear until a matching pair hits): Grok (`grok.com`, `x.com`), Groq (`chat.groq.com`). Also in-tree: Cerebras Inference Chat, LMArena.

**Roadmap (under consideration):** DeepSeek · Qwen · Kimi · Microsoft Copilot · Meta AI · HuggingChat · Perplexity · Poe · OpenRouter Chat · Character.AI · GLM · MiniMax. Site adapters are small and isolated; PRs adding a new adapter are welcome.

## Features

- **Preview panel** — export opens in a panel with **MD** / **YAML** mode tabs, plus Copy, Save, and Refresh; nothing leaves the page until you act
- **Message order** — the ⇅ toggle flips the export between chronological (oldest first) and newest-first
- **Markdown mode** — front-matter header, `#` title, `## User` / `## Assistant` turns separated by `* * *`, faithful code blocks / tables / lists / math
- **YAML mode** — the full thread as an API-format payload: a `messages:` list of `role:` / `content:` block-scalar entries; tool invocations become `role: tool` messages
- **Tool calls, summarized** — collapsible tool chips (searches, browsing, code runs) export as `tool-call made to …` / `tool-call-response: …` lines instead of their collapsed payload
- **One-click copy / download** of the current conversation

## Getting Started

Install from a [Releases](https://github.com/the-robot-lives/chat-to-markdown/releases) zip (recommended) or from source: unzip/clone, then `chrome://extensions` (or `edge://extensions`) → Developer mode → **Load unpacked** → select `chrome/`. After installing or updating, reload the extension card and refresh the chat tab — content scripts inject on page load.

```bash
node --test               # converter test suite (auto-discovers test/*.test.js)
```

No build step, no dependencies; tests are zero-dep node tests (mini-DOM + fixtures). Every push to the `release` branch publishes a versioned zip with patch auto-bumping ([PUBLISHING.md](PUBLISHING.md)).

## How It Works

- `chrome/src/content/main.js` injects a floating MD button (shadow DOM) on matched sites.
- `chrome/src/content/adapters/index.js` picks the site adapter; each adapter (`chatgpt.js`, …) implements `isCurrentSite()` and `getConversation()` → `{title, turns: [{role, element}]}`. Adapters speak in DOM elements; the converter never sees site specifics.
- `chrome/src/lib/markdown.js` is a site-agnostic DOM → Markdown converter; `export.js` handles front-matter, filename, copy/download.

**Adding a platform:** create `chrome/src/content/adapters/<site>.js` pushing an adapter object onto `C2M.adapters` with the contract above; add its filename to `manifest.json` `content_scripts.js` and the match pattern to `matches`.

## Repo Layout

```
chrome/
├── manifest.json             # MV3, content-script only (no build step)
└── src/
    ├── lib/                  # markdown.js (DOM → MD), export.js (front-matter, copy/download)
    └── content/
        ├── adapters/         # one file per site + index.js registry
        └── main.js           # floating MD button (shadow DOM)
test/                         # zero-dep node tests (mini-DOM + fixtures)
```
