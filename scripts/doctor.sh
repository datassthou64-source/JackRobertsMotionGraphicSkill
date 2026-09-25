#!/usr/bin/env bash
# Checks every prerequisite of the skill. Exit 1 if a required one is missing.
#   bash scripts/doctor.sh
ok=0
need() { if command -v "$1" >/dev/null 2>&1; then printf "PASS  %-10s %s\n" "$1" "$($2 2>&1 | head -1)"; else printf "FAIL  %-10s missing — %s\n" "$1" "$3"; ok=1; fi; }
want() { if command -v "$1" >/dev/null 2>&1; then printf "PASS  %-10s %s\n" "$1" "$($2 2>&1 | head -1)"; else printf "WARN  %-10s missing (optional) — %s\n" "$1" "$3"; fi; }

need node    "node -v"          "Node.js 18+ (https://nodejs.org or: brew install node)"
need npm     "npm -v"           "ships with Node.js"
need python3 "python3 --version" "Python 3.9+ (brew install python)"
need ffmpeg  "ffmpeg -version"  "brew install ffmpeg  (apt install ffmpeg on Linux)"
need ffprobe "ffprobe -version" "installed with ffmpeg"
want yt-dlp  "yt-dlp --version" "footage sourcing: brew install yt-dlp"

if command -v node >/dev/null; then
  major=$(node -v | sed 's/v\([0-9]*\).*/\1/'); [ "$major" -ge 18 ] || { echo "FAIL  node       $major < 18"; ok=1; }
fi
if python3 -c "import PIL" 2>/dev/null; then echo "PASS  Pillow"; else echo "FAIL  Pillow     missing — python3 -m pip install -r requirements.txt"; ok=1; fi
if python3 -c "import numpy" 2>/dev/null; then echo "PASS  numpy"; else echo "WARN  numpy      missing (broll_pick.py only) — python3 -m pip install -r requirements.txt"; fi
[ -d ~/.cache/jack-remotion/deps/node_modules/remotion ] && echo "PASS  remotion   installed in ~/.cache/jack-remotion/deps" || echo "INFO  remotion   installs itself on the first new_project.py run"
[ -x ~/.cache/jack-remotion/wx/bin/python ] && echo "PASS  whisper    faster-whisper venv ready" || echo "INFO  whisper    faster-whisper venv builds itself on the first transcribe.py run"
exit $ok
