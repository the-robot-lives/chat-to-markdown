# chat-to-markdown

> Browser extension that turns LLM chat conversations into clean, portable Markdown — copy or download in one click.

**Status:** v0.1 — ChatGPT adapter implemented (load unpacked to try it); other platforms land adapter-by-adapter · **License:** MIT

## Why

Chats with LLMs are where real work happens, but every vendor locks the transcript
inside its own web UI. chat-to-markdown extracts the conversation — turns, code blocks,
tables, math — and converts it to standard Markdown you can copy to the clipboard or
save as a `.md` file.

## Supported at launch

| Platform | Site |
|----------|------|
| ChatGPT | `chatgpt.com` |
| Claude | `claude.ai` |
| Gemini | `gemini.google.com` |
| Grok | `grok.com`, `x.com` |
| Le Chat (Mistral) | `chat.mistral.ai` |
| Cerebras Inference Chat | `chat.cerebras.ai` |
| LMArena | `lmarena.ai` |
| Open WebUI | self-hosted (generic DOM rules) |

**Shipped:** ChatGPT (v0.1). The rest land adapter-by-adapter — see Development below.

## Under consideration (roadmap)

DeepSeek (`chat.deepseek.com`) · Qwen (`chat.qwen.ai`) · Kimi (`kimi.com`) ·
Microsoft Copilot (`copilot.microsoft.com`) · Meta AI (`meta.ai`) ·
HuggingChat (`huggingface.co/chat`) · Perplexity (`perplexity.ai`) · Poe (`poe.com`) ·
OpenRouter Chat (`openrouter.ai/chat`) · Character.AI (`character.ai`) ·
GLM (`chat.z.ai`) · MiniMax (`chat.minimax.io`)

Site adapters are small and isolated; PRs adding a new adapter are welcome once the
extension core lands.

## Planned features

- **One-click copy / download** of the current conversation as `.md`
- **Front-matter header**: source site, model, conversation title, date, URL
- **Faithful conversion**: fenced code blocks (language-tagged), tables, lists, blockquotes
- **Turn-by-turn speaker labels** (`## User` / `## Assistant`, artifacts kept inline)
- **Batch export** of selected conversations as one file or a zip
- **No account, no telemetry** — parsing happens locally in the page

## Repository layout

```
chrome/
├── manifest.json             # MV3, content-script only (no build step)
└── src/
    ├── lib/
    │   ├── markdown.js       # DOM → Markdown converter (site-agnostic)
    │   └── export.js         # front-matter, filename, copy/download
    └── content/
        ├── adapters/         # one file per site; contract below
        │   ├── chatgpt.js
        │   └── index.js      # registry — picks the adapter for this site
        └── main.js           # floating MD button (shadow DOM)
test/                          # zero-dep node tests (mini-DOM + fixtures)
```

## Development

No build step, no dependencies.

```bash
node --test               # converter test suite (auto-discovers test/*.test.js)
```

To try it live: `chrome://extensions` → enable Developer mode → **Load unpacked** →
select `chrome/`. Open a ChatGPT conversation and use the floating **MD ▾** button
(Copy Markdown / Download .md).

**Adding a platform:** create `chrome/src/content/adapters/<site>.js` that pushes an
adapter object onto `C2M.adapters` with `isCurrentSite()` and `getConversation()` →
`{title, turns: [{role: 'user'|'assistant', element}]}`; add its filename to
`manifest.json` `content_scripts.js` and the match pattern to `matches`. Adapters
speak in DOM elements; the converter never sees site specifics.

## License

[MIT](LICENSE)
