# Chat to Markdown — v{{version}}

Export LLM chat conversations as clean Markdown or API-format YAML, right
from the page: a floating **MD ▾** button opens a preview panel with
Copy / Save / Refresh and MD / YAML mode tabs.

**Supported:** ChatGPT, Claude (incl. share pages), Open WebUI,
Le Chat (chat.mistral.ai), use.ai (Grok-powered), plus experimental support
for grok.com and chat.groq.com.

## Install (developer mode — no store account needed)

**Option A — release zip (recommended)**

1. Download `chat-to-markdown-v<version>.zip` from this release's assets.
2. Unzip it — you get a folder containing `manifest.json`.
3. Open `chrome://extensions` (Chrome/Brave/Arc) or `edge://extensions` (Edge).
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the unzipped folder.
6. Open a supported chat, press **MD ▾** (bottom-right), export.

**Option B — from a source checkout**

```sh
git clone https://github.com/the-robot-lives/chat-to-markdown
```

Then the same `chrome://extensions` → Developer mode → **Load unpacked**,
selecting the repo's `chrome/` directory. After pulling updates, hit ↻ on the
extension card and refresh the chat tab.

## Notes

- Everything runs locally: no accounts, no telemetry, no servers
  (see [PRIVACY.md](PRIVACY.md) in the repo).
- After updating, reload the extension card and refresh chat tabs — content
  scripts only re-inject on page load.
