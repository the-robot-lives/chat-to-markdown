#!/usr/bin/env sh
# Build the store/install zip locally:  scripts/package.sh [output.zip]
# The archive has manifest.json at its root (store + Load-unpacked format).
set -eu
cd "$(dirname "$0")/.."
V=$(python3 -c "import json;print(json.load(open('chrome/manifest.json'))['version'])")
OUT="${1:-chat-to-markdown-v$V.zip}"
rm -f "$OUT"
(cd chrome && zip -qr "../$OUT" . -x '.*')
echo "wrote $OUT (manifest v$V)"
