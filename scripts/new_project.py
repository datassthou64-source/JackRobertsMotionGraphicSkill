#!/usr/bin/env python3
"""Scaffold a Jack Remotion build from the skill's starter.

    new_project.py <slug> --vo /path/to/vo.(mp3|wav|m4a|mp4) [--transcribe] [--dest DIR]
    new_project.py <slug> --seconds 30          # silent master, no VO yet

Creates  <dest>/<slug>/
  dest = --dest, else config.local.json "projects_dir", else $REMOTION_PROJECTS_DIR,
         else ./remotion-projects under the current directory
  - copies starter/ (kit, devices, Reel, plan, demo beats, bundled SFX + logos + mascots)
  - symlinks node_modules from one shared install (config "node_modules", else
    $REMOTION_NODE_MODULES, else ~/.cache/jack-remotion/deps/node_modules — created with
    `npm install` on the first run, reused by every build after)
  - converts the VO to public/audio/vo.mp3 (or writes silence) and prints its length
  - optionally runs transcribe.py so src/transcript.json is the real VO

Nothing here is a timing decision. plan.ts is still hand-edited afterwards.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
STARTER = os.path.join(SKILL, "starter")
DEPS = os.path.expanduser("~/.cache/jack-remotion/deps")


def config():
    """config.local.json next to SKILL.md (gitignored) — per-machine paths."""
    p = os.path.join(SKILL, "config.local.json")
    return json.load(open(p)) if os.path.exists(p) else {}


def default_dest():
    return config().get("projects_dir") or os.environ.get("REMOTION_PROJECTS_DIR") or os.path.join(os.getcwd(), "remotion-projects")


def shared_node_modules():
    nm = config().get("node_modules") or os.environ.get("REMOTION_NODE_MODULES")
    if nm:
        return nm
    nm = os.path.join(DEPS, "node_modules")
    if not os.path.isdir(os.path.join(nm, "remotion")):
        print(f"first run: installing Remotion once into {DEPS} (~1 min)")
        os.makedirs(DEPS, exist_ok=True)
        shutil.copy(os.path.join(STARTER, "package.json"), os.path.join(DEPS, "package.json"))
        subprocess.run(["npm", "install", "--no-audit", "--no-fund", "--loglevel=error"], cwd=DEPS, check=True)
    return nm


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw).stdout


def probe_seconds(path):
    out = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path])
    return float(json.loads(out)["format"]["duration"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--vo", help="voiceover file (any ffmpeg-readable format)")
    ap.add_argument("--seconds", type=float, default=30, help="length of the silent placeholder when there is no --vo")
    ap.add_argument("--dest", default=None)
    ap.add_argument("--transcribe", action="store_true", help="run transcribe.py after copying the VO")
    ap.add_argument("--node-modules", default=None)
    a = ap.parse_args()
    a.dest = a.dest or default_dest()
    a.node_modules = a.node_modules or shared_node_modules()
    if a.transcribe and not a.vo:
        sys.exit("--transcribe needs --vo")

    dst = os.path.join(a.dest, a.slug)
    if os.path.exists(dst):
        sys.exit(f"refusing to overwrite {dst}")
    shutil.copytree(STARTER, dst, ignore=shutil.ignore_patterns("node_modules", "out"))

    if os.path.isdir(a.node_modules):
        os.symlink(a.node_modules, os.path.join(dst, "node_modules"))
        print(f"node_modules -> {a.node_modules}")
    else:
        print("no shared node_modules found; run `npm install` in the project", file=sys.stderr)

    vo_out = os.path.join(dst, "public", "audio", "vo.mp3")
    src = ["-i", a.vo, "-vn"] if a.vo else ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(a.seconds)]
    sh(["ffmpeg", "-loglevel", "error", "-y", *src, "-ac", "1", "-ar", "44100", "-b:a", "192k", vo_out])
    secs = probe_seconds(vo_out)
    print(f"VO: {secs:.2f}s = {round(secs * 30)} frames @30fps  -> {vo_out}")

    # package name = slug so Studio shows which build is open
    pkg = os.path.join(dst, "package.json")
    with open(pkg) as f:
        p = json.load(f)
    p["name"] = a.slug
    with open(pkg, "w") as f:
        json.dump(p, f, indent=2)
        f.write("\n")

    # drop the demo transcript so nobody ships placeholder captions by accident
    os.remove(os.path.join(dst, "src", "transcript.json"))
    with open(os.path.join(dst, "src", "transcript.json"), "w") as f:
        f.write("[]\n")

    if a.transcribe:
        subprocess.run([sys.executable, os.path.join(HERE, "transcribe.py"), vo_out, "-o", os.path.join(dst, "src", "transcript.json")], check=True)

    with open(os.path.join(dst, "BRIEF.md"), "w") as f:
        f.write(f"# {a.slug}\n\nVO: {a.vo or 'silent placeholder'}\nLength: {secs:.2f}s ({round(secs*30)} frames)\n\n## Beats\n\n(id · spoken words · start frame · device · sourced asset · why it fits)\n\n## CTA cut point\n\n## Sources\n")

    print(f"\nproject: {dst}")
    print("next:   python3 scripts/transcribe.py (if not done) -> write plan.tsv -> plan_beats.py -> build beats -> npx tsc --noEmit -> stills -> render")


if __name__ == "__main__":
    main()
