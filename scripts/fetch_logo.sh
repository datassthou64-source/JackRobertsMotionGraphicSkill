#!/usr/bin/env bash
# Pull a real brand mark into public/logos via 21st's logo index (svgl.app — free, unmetered).
#   fetch_logo.sh <project> <query> [outname] [--wordmark]
# Prints the candidates when more than one matches; picks the first. Verify the mark
# against the brand's own site before shipping; a missing result is NOT permission to
# redraw or recolour a logo — fall back to the brand press kit / GitHub org avatar / favicon.
set -euo pipefail
proj="$1"; q="$2"; name="${3:-$(echo "$q" | tr 'A-Z ' 'a-z-')}"; kind="route"
[[ "${4:-}" == "--wordmark" ]] && kind="wordmark"
json=$(21st logo "$q" --limit 5 --json 2>/dev/null)
n=$(echo "$json" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')
[[ "$n" == "0" ]] && { echo "no svgl result for '$q' — try the press kit / GitHub avatar / favicon (see asset-sourcing.md)"; exit 1; }
echo "$json" | python3 -c '
import json,sys
for r in json.load(sys.stdin):
    print("  %5s  %-28s %s" % (r["id"], r["title"], r.get("url","")))'
url=$(echo "$json" | python3 -c "
import json,sys; r=json.load(sys.stdin)[0]; v=r.get('$kind') or r.get('route')
print(v['light'] if isinstance(v, dict) else v)")
mkdir -p "$proj/public/logos"
curl -sSL "$url" -o "$proj/public/logos/$name.svg"
echo "-> public/logos/$name.svg  ($url)"
grep -qi 'currentColor' "$proj/public/logos/$name.svg" && echo "   note: uses currentColor — set color on the <Img> wrapper or it renders black"
echo "$name.svg | $url | svgl.app (MIT index; mark © brand)" >> "$proj/SOURCES.md"
