# Publishing runbook — chat-to-markdown

Two channels: **GitHub Releases** (developer-mode zip, fully automated) and
the **stores** (Chrome Web Store / Edge Add-ons, manual upload per version).

## Versioning

`chrome/manifest.json` `version` is the single source of truth.

- **Patch** — automatic: every push to the `release` branch whose manifest
  version is <= the latest `v*` tag bumps the patch field, commits it back,
  and releases that.
- **Minor / major** — hand-edit the manifest version (`0.4.0` → `0.5.0`) and
  push to `release`; the pipeline releases it as-is.

## GitHub Releases (automated)

```sh
git checkout release && git merge develop   # or cherry-pick / push directly
git push origin release                     # pipeline does the rest
```

The workflow (`.github/workflows/release.yml`) bumps if needed, zips
`chrome/` to `chat-to-markdown-v<ver>.zip`, and publishes a release with
install notes (`.github/RELEASE_BODY.md`).

Local packaging check: `scripts/package.sh`.

## Chrome Web Store

1. One-time: developer registration at <https://chromewebstore.google.com>
   ($5, Google account).
2. `scripts/package.sh` → upload the zip in the Developer dashboard → New item.
3. Listing: category Productivity → Tools; screenshots 1280x800 (capture the
   preview panel on a real conversation); promo tile 440x280.
4. Privacy tab: single purpose = "Export the chat conversation you are viewing
   to Markdown/YAML locally"; justify `clipboardWrite` ("copies the generated
   Markdown to the clipboard"); data usage = does not collect any user data;
   privacy policy URL = <https://github.com/the-robot-lives/chat-to-markdown/blob/main/PRIVACY.md>.
5. Submit. No remotely-hosted code is used anywhere (hard requirement — we
   comply by construction).

## Edge Add-ons

Same zip at <https://partner.microsoft.com/extensions> (free registration,
separate review, separate listing).

## Release checklist

- [ ] `node --test` green
- [ ] version bumped in `chrome/manifest.json` (patch is optional — pipeline covers it)
- [ ] README supported-sites table current
- [ ] `scripts/package.sh` → unzip the result → Load unpacked still works
