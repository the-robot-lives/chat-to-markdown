# AGENT-README

> Orientation for AI coding agents working in this repo. Human docs: README.md.

## Type

other/chrome-extension

## Purpose

Manifest V3 Chrome extension that extracts LLM chat conversations on supported chat sites (ChatGPT, Claude, Gemini, z.ai, Open WebUI, use.ai, Le Chat, …) and converts them to clean Markdown or YAML for one-click copy/download — parsing fully local, no accounts, no telemetry.

## Stack

Vanilla JS content scripts (shadow DOM floating button + preview panel), zero dependencies, no build step; zero-dep node test suite under `test/` (mini-DOM + fixtures).

## Dev mode

```bash
# chrome://extensions (or edge://extensions) → Developer mode → Load unpacked → select chrome/
# after edits: reload the extension card, then refresh the chat tab
node --test               # converter test suite (auto-discovers test/*.test.js)
```

## Ports / URLs

- none (library/CLI)

## Tests

```bash
node --test
```

## Gotchas

- Content scripts inject on page load — after reloading the extension you must refresh the chat tab or the MD button will not appear.
- New site adapter: create `chrome/src/content/adapters/<site>.js` implementing `isCurrentSite()` / `getConversation()` → `{title, turns}`, then add it to `manifest.json` `content_scripts.js` and `matches`.
- Adapters speak in DOM elements; `chrome/src/lib/markdown.js` (site-agnostic DOM → MD converter) never sees site specifics.
- Every push to the `release` branch publishes a versioned zip with patch auto-bump (PUBLISHING.md).
