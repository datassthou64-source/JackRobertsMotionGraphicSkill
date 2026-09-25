#!/usr/bin/env bash
# gates → full render (VO + SFX from plan.json) → out/sheet.jpg
#   render.sh <project> [name]      → <project>/out/<name>.mp4
set -euo pipefail
S="$(cd "$(dirname "$0")/.." && pwd)"; P="$(cd "$1" && pwd)"; NAME="${2:-$(basename "$P")}"
[ -d "$S/engine/node_modules/puppeteer-core" ] || (cd "$S/engine" && npm install --silent)
python3 "$S/scripts/check.py" "$P"
node "$S/engine/render.mjs" "$P" --out "$NAME.mp4"
node "$S/engine/render.mjs" "$P" --sheet --guides
rm -f "$P/out/.segs.txt"
echo "review: $P/out/sheet.jpg (first/mid/last frame of every beat, safe zone dashed, caption band red)"
