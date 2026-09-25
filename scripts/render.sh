#!/usr/bin/env bash
# The whole delivery loop in one call — gates, render, sheet, verification. Saves a dozen
# tool round-trips per build.
#   render.sh <project> [comp=Reel] [outname]
# Produces one clean out/<outname>.mp4, out/sheet.jpg, and prints duration / dimensions /
# audio streams. Captions are added downstream and are never rendered here.
set -euo pipefail
proj="$1"; comp="${2:-Reel}"; name="${3:-$(basename "$proj")}"
here="$(cd "$(dirname "$0")" && pwd)"
cd "$proj"
python3 "$here/check_build.py" . || { echo "gates failed — fix before rendering"; exit 1; }
mkdir -p out
npx remotion render "$comp" "out/$name.mp4" --log=error
python3 "$here/sheet.py" . "out/$name.mp4" -o out/sheet.jpg
ffprobe -v error -show_entries stream=codec_type,width,height,duration -of compact "out/$name.mp4" | sed 's/^/  /'
echo "review out/sheet.jpg (one image), then deliver out/$name.mp4"
