#!/usr/bin/env python3
"""One VO → two builds: a Remotion project and a code-motion project, both caption-free.

    both.py [audio] [--slug <topic-yyyymmdd>]

No audio argument → asks for the file (drag it into the terminal and press Enter).
Transcribes ONCE (faster-whisper, local, no key), then scaffolds:

  <remotion projects_dir>/<slug>/     src/transcript.json + public/audio/vo.mp3
  <code-motion projects_dir>/<slug>/  words.json + assets/vo.* + plan.json "end" = CTA cut

and writes the shared cut point into both BRIEF.md / plan.json. Everything after this —
beats, assets, render — follows each engine's own SKILL.md.
"""
import argparse
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
FPS = 30


def code_motion_skill():
    """Repo layout: <skill>/code-motion. Installed layout: a sibling jack-code-motion skill."""
    for c in [SKILL / "code-motion", SKILL.parent / "jack-code-motion",
              Path.home() / ".claude/skills/jack-code-motion",
              Path.home() / ".claude/client-skills/jack-code-motion"]:
        if (c / "scripts" / "new_project.py").exists():
            return c
    sys.exit("code-motion skill not found (expected <skill>/code-motion or ~/.claude/skills/jack-code-motion)")


def ask_audio():
    if not sys.stdin.isatty():
        sys.exit("no audio given — run: both.py /path/to/vo.mp3")
    p = input("Voiceover file (drag it here, then Enter): ").strip()
    return p.strip("'\"").replace("\\ ", " ")


def slug_from(audio):
    stem = re.sub(r"[^a-z0-9]+", "-", Path(audio).stem.lower()).strip("-") or "vo"
    return f"{stem[:40]}-{datetime.date.today():%Y%m%d}"


def run(cmd):
    subprocess.run([str(c) for c in cmd], check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio", nargs="?")
    ap.add_argument("--slug")
    ap.add_argument("--cta", default="comment", help="first word of the facecam CTA sentence")
    a = ap.parse_args()

    audio = Path(os.path.expanduser(a.audio or ask_audio())).resolve()
    if not audio.is_file():
        sys.exit(f"not a file: {audio}")
    slug = a.slug or slug_from(audio)
    cm = code_motion_skill()

    # 1. Remotion project (converts the VO to public/audio/vo.mp3)
    run([sys.executable, HERE / "new_project.py", slug, "--vo", audio])
    rem = json.loads((SKILL / "config.local.json").read_text()).get("projects_dir") if (SKILL / "config.local.json").exists() else None
    rem = Path(rem or os.environ.get("REMOTION_PROJECTS_DIR") or Path.cwd() / "remotion-projects") / slug

    # 2. Transcribe once
    transcript = rem / "src" / "transcript.json"
    run([sys.executable, HERE / "transcribe.py", rem / "public" / "audio" / "vo.mp3", "-o", transcript, "--cta", a.cta])
    words = json.loads(transcript.read_text())

    # 3. code-motion project, reusing the same transcript
    out = subprocess.run([sys.executable, cm / "scripts" / "new_project.py", slug, "--vo", audio],
                         check=True, text=True, capture_output=True).stdout
    print(out, end="")
    cmp = Path(re.search(r"project →\s*(.+)", out).group(1).strip())
    shutil.copy(transcript, cmp / "words.json")

    # 4. Shared cut point: end on the last pre-CTA word, ~4 frames of air
    cta = next((w for w in words if w["text"].lower().strip(".,!?:;'\"") == a.cta.lower()), None)
    vo_frames = round(words[-1]["end"] * FPS) if words else None
    cut = round(cta["start"] * FPS) - 4 if cta else None
    plan = json.loads((cmp / "plan.json").read_text())
    if cut:
        plan["end"] = cut
        (cmp / "plan.json").write_text(json.dumps(plan, indent=1))
    note = (f"CTA '{cta['text']}' at {cta['start']:.2f}s → both compositions end at frame {cut} ({cut / FPS:.2f}s)."
            if cta else f"No '{a.cta}' found — no CTA cut set; end at the VO length ({vo_frames} frames) or find it by hand.")
    brief = rem / "BRIEF.md"
    brief.write_text(brief.read_text().replace("## CTA cut point\n", f"## CTA cut point\n\n{note}\n"))

    print("\n" + "=" * 64)
    print(f"slug        {slug}")
    print(f"remotion    {rem}")
    print(f"code-motion {cmp}")
    print(f"words       {len(words)}  ·  {note}")
    print("captions    none in either build (the editor adds them)")
    print("next        storyboard once, then build each engine per its SKILL.md")


if __name__ == "__main__":
    main()
