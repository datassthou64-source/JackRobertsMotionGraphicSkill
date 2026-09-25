#!/usr/bin/env python3
"""Scaffold a code-motion project.

    new_project.py <slug> [--vo vo.mp3] [--transcribe] [--seconds 30] [--dir <projects_dir>]

Creates <projects_dir>/<slug>/ with runtime.js + kit.js (copied, so the project is
self-contained), a starter index.html, plan.json, SOURCES.md, bundled fonts + dry SFX.
projects_dir: --dir, else "projects_dir" in the skill's config.local.json, else
./code-motion-projects. --transcribe writes words.json (faster-whisper, local) and prints
every word's start frame plus the CTA cut.
"""
import argparse, json, shutil, subprocess, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("slug")
ap.add_argument("--vo")
ap.add_argument("--transcribe", action="store_true")
ap.add_argument("--seconds", type=float, default=30)
ap.add_argument("--dir")
a = ap.parse_args()

cfg = SKILL / "config.local.json"
base = Path(a.dir) if a.dir else Path(json.loads(cfg.read_text()).get("projects_dir", "code-motion-projects")) if cfg.exists() else Path("code-motion-projects")
P = (base / a.slug).resolve()
if P.exists() and any(P.iterdir()):
    sys.exit(f"{P} exists and is not empty")
for d in ["assets/logos", "assets/brand", "assets/media", "assets/fonts", "assets/sfx", "out"]:
    (P / d).mkdir(parents=True, exist_ok=True)
for f in ["runtime.js", "kit.js"]:
    shutil.copy(SKILL / "engine" / f, P / f)
for f in (SKILL / "assets" / "fonts").glob("*.woff2"):
    shutil.copy(f, P / "assets/fonts" / f.name)
for f in (SKILL / "assets" / "sfx").glob("*.mp3"):
    shutil.copy(f, P / "assets/sfx" / f.name)
shutil.copy(SKILL / "assets" / "starter.html", P / "index.html")

end = round(a.seconds * 30)
vo = None
if a.vo:
    src = Path(a.vo).expanduser().resolve()
    vo = f"assets/vo{src.suffix}"
    shutil.copy(src, P / vo)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                               capture_output=True, text=True).stdout.strip() or a.seconds)
    end = round(dur * 30)
(P / "plan.json").write_text(json.dumps({"vo": vo, "vo_gain": 1.0, "end": end, "sfx": []}, indent=1))
(P / "SOURCES.md").write_text("file | URL | owner/licence | what was changed\n")
print("project →", P)

if a.transcribe and vo:
    cands = [SKILL.parent / "jack-remotion-motion/scripts/transcribe.py", SKILL.parent / "scripts/transcribe.py",
             Path.home() / ".claude/client-skills/jack-remotion-motion/scripts/transcribe.py",
             Path.home() / ".claude/skills/jack-remotion-motion/scripts/transcribe.py"]
    t = next((c for c in cands if c.exists()), None)
    if not t:
        sys.exit("transcribe.py (jack-remotion-motion) not found — transcribe the VO yourself into words.json [{text,start,end}]")
    subprocess.run([sys.executable, str(t), str(P / vo), "-o", str(P / "words.json")], check=True)
    print("\nSet plan.json \"end\" to the start frame of the CTA word (\"Comment\") printed above.")
