# Privacy Policy — Chat to Markdown

Chat to Markdown works entirely on your machine.

- **No data collection.** The extension reads the conversation visible in the
  page you are on, converts it to Markdown or YAML locally, and hands the
  result to you (preview, clipboard, or download). Nothing is transmitted to
  any server — ours or anyone else's.
- **No accounts, no analytics, no tracking,** no remote code. All logic ships
  inside the extension bundle.
- **Permissions:**
  - Content scripts on supported chat sites (chatgpt.com, claude.ai,
    chat.mistral.ai, webui.noizu.com, use.ai, grok.com, chat.groq.com) are how
    the extension reads the conversation you are viewing — the site you must
    already be logged into — so it can convert it for you.
  - `clipboardWrite` copies the generated Markdown/YAML to your clipboard when
    you press Copy.

Questions or concerns: open an issue at
<https://github.com/the-robot-lives/chat-to-markdown/issues>.
