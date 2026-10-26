# Threat Model — Summary

- **System:** local, content-script-only MV3 extension. No server, no
  storage, no accounts, no network API usage (verified against source
  2026-10-27); sole permission `clipboardWrite`.
- **Crown jewels:** user conversation content; integrity of clipboard/download
  output; inertness on unmatched pages.
- **Trust boundaries:** page DOM ↔ content script (isolated world);
  content script ↔ user-clicked sinks (panel, clipboard, download);
  CI (`contents: write` on `release`) ↔ repository.
- **Register (7):** 3 mitigated (inert-without-match T-001; export escaping +
  slugified filenames + text-only rendering T-003; isolated world, no
  listeners/externally_connectable/chrome.* T-004) · 1 open (T-006,
  `actions/checkout@v4` tag-pinned with `contents: write`) · 2 accepted
  (craftable Open WebUI signature T-002; 1.5 s poll T-005) · 1 n/a
  (repudiation T-007). All Low/Info severity.
- **Posture:** fail-closed — selector drift hides the button, never widens
  access. Realistic failure mode is export fidelity, not exfiltration.

Details and diagram: `docs/THREAT-MODEL.md`.
