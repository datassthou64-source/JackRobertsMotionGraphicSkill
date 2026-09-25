#!/usr/bin/env python3
"""
Find the usable seconds in downloaded footage, cut them, and register the clip.

Two modes.

  SCAN — where are the good bits?
      python3 broll_pick.py -d <project> --scan <videoId> [--min-shot 1.2]
    Splits the download into shots, scores each one on motion, sharpness and
    how centred its subject is, and prints the best candidates with in/out
    timecodes and a contact sheet you can actually look at. Scan before you cut;
    the first thirty seconds of a product film is almost never the shot.

  CUT — take one and register it.
      python3 broll_pick.py -d <project> --clip <videoId> --in 12.4 --out 16.0 \
          --name primary --note "hero shot, slow orbit"
    Cuts to public/broll/<name>.mp4 at the project's own fps and frame size,
    re-encoded so it seeks cleanly, and appends the entry (with the source URL
    and in/out) to src/broll.json for the composition to reference by name.
"""
import argparse
import io
import json
import subprocess
import sys
from pathlib import Path

import numpy as np


def probe_fps_size(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
         "stream=width,height,r_frame_rate,duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return round(int(num) / int(den)), int(s["width"]), int(s["height"]), float(s.get("duration", 0))


def scan(path, min_shot, top):
    fps, w, h, dur = probe_fps_size(path)
    gw, gh = 64, 36
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"fps=6,scale={gw}:{gh}",
         "-pix_fmt", "gray", "-f", "rawvideo", "-"],
        capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.uint8).reshape(-1, gh, gw).astype(float)
    if len(a) < 4:
        return []
    diff = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
    cuts = [0] + [i + 1 for i, v in enumerate(diff) if v > 20] + [len(a)]

    shots = []
    for s, e in zip(cuts, cuts[1:]):
        if (e - s) / 6.0 < min_shot:
            continue
        seg = a[s:e]
        motion = float(np.abs(np.diff(seg, axis=0)).mean()) if len(seg) > 1 else 0.0
        # sharpness proxy: spatial gradient energy, so a soft or dark shot loses
        detail = float(np.abs(np.diff(seg, axis=2)).mean())
        # centre weight: is the interesting stuff in the middle third
        centre = float(seg[:, :, gw // 3: 2 * gw // 3].std())
        brightness = float(seg.mean())
        score = detail * 1.6 + centre * 1.2 + min(motion, 12) * 0.8 - abs(brightness - 118) * 0.05
        shots.append({
            "in": round(s / 6.0, 2), "out": round(e / 6.0, 2),
            "len": round((e - s) / 6.0, 2), "score": round(score, 1),
            "motion": round(motion, 1), "detail": round(detail, 1),
            "brightness": round(brightness),
        })
    shots.sort(key=lambda x: -x["score"])
    return shots[:top]


def sample_ground(path):
    """Mean colour of a clip's outer 8px.

    A 16:9 clip dropped into a nearly-square graphic half or a 9:16 beat has to
    letterbox onto SOMETHING. Letterboxing onto the clip's own edge colour makes
    the plate read as one surface instead of a video pasted on a card — and for
    a brand film shot on white, the bars simply disappear.
    """
    try:
        import numpy as np
        from PIL import Image
    except ImportError:
        return None
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf", "select=eq(n\\,3)",
         "-vsync", "0", "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True).stdout
    if not raw:
        return None
    a = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB")).astype(int)
    edge = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3),
                           a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    return "#%02x%02x%02x" % tuple(edge.mean(axis=0).round().astype(int))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-d", "--dir", required=True)
    ap.add_argument("--scan", help="video id in broll-raw/ to analyse")
    ap.add_argument("--min-shot", type=float, default=1.2)
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--sheet", help="write a contact sheet of the top shots here")
    ap.add_argument("--clip", help="video id in broll-raw/ to cut from")
    ap.add_argument("--in", dest="tin", type=float)
    ap.add_argument("--out", dest="tout", type=float)
    ap.add_argument("--name")
    ap.add_argument("--note", default="")
    ap.add_argument("--crop", help="w:h:x:y applied before scaling")
    args = ap.parse_args()

    project = Path(args.dir).expanduser().resolve()
    raw = project / "broll-raw"

    if args.scan:
        path = next((q for q in sorted(raw.glob(f"{args.scan}.*"))
                     if q.suffix.lower() in {".mp4", ".mkv", ".webm", ".mov"}), None)
        if path is None:
            print(f"no download named {args.scan} in {raw}", file=sys.stderr)
            return 1
        shots = scan(path, args.min_shot, args.top)
        print(f"{path.name}: {len(shots)} candidate shot(s), best first\n")
        for s in shots:
            print(f"  --in {s['in']:<7} --out {s['out']:<7} ({s['len']}s)  "
                  f"score {s['score']:<6} motion {s['motion']:<5} detail {s['detail']:<5} "
                  f"bright {s['brightness']}")
        if args.sheet:
            mids = [(s["in"] + s["out"]) / 2 for s in shots]
            sel = "+".join(f"between(t,{m-0.02},{m+0.02})" for m in mids)
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-vf",
                            f"select='{sel}',scale=320:-1,tile={min(5,len(mids))}x"
                            f"{max(1,(len(mids)+4)//5)}",
                            "-frames:v", "1", args.sheet], check=False)
            print(f"\ncontact sheet: {args.sheet} — LOOK at it before cutting")
        return 0

    if not (args.clip and args.name and args.tin is not None and args.tout is not None):
        print("cut mode needs --clip --name --in --out", file=sys.stderr)
        return 1

    # a download leaves both <id>.mp4 and <id>.info.json next to each other and
    # glob order is not guaranteed — pick the video, never the sidecar
    path = next((q for q in sorted(raw.glob(f"{args.clip}.*"))
                 if q.suffix.lower() in {".mp4", ".mkv", ".webm", ".mov"}), None)
    if path is None:
        print(f"no download named {args.clip} in {raw}", file=sys.stderr)
        return 1

    report = json.load(open(project / "src" / "source.json"))
    fps = report["spec"]["fps"]
    w, h = report["spec"]["width"], report["spec"]["height"]

    outdir = project / "public" / "broll"
    outdir.mkdir(parents=True, exist_ok=True)
    dest = outdir / f"{args.name}.mp4"

    vf = []
    if args.crop:
        vf.append(f"crop={args.crop}")
    # the graphic half is the target, so match the frame width and let the
    # composition crop the height
    vf += [f"fps={fps}", f"scale={w}:-2"]

    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", str(args.tin), "-to", str(args.tout),
         "-i", str(path), "-vf", ",".join(vf), "-an",
         "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
         "-g", "1", str(dest)],
        check=True)

    frames = round((args.tout - args.tin) * fps)
    info = raw / f"{args.clip}.info.json"
    meta = json.load(open(info)) if info.exists() else {}

    reg_path = project / "src" / "broll.json"
    reg = json.load(open(reg_path)) if reg_path.exists() else []
    reg = [c for c in reg if c["id"] != args.name]
    reg.append({
        "id": args.name,
        "file": f"broll/{dest.name}",
        "durationInFrames": frames,
        "source": {
            "channel": meta.get("channel") or meta.get("uploader") or "unknown",
            "url": meta.get("webpage_url") or f"https://www.youtube.com/watch?v={args.clip}",
            "inPoint": args.tin,
            "outPoint": args.tout,
        },
        "note": args.note,
        "ground": sample_ground(dest),
    })
    json.dump(reg, open(reg_path, "w"), indent=2)

    print(f"cut {dest}  {frames} frames @ {fps}fps")
    print(f"registered as '{args.name}' in src/broll.json "
          f"(source: {reg[-1]['source']['channel']})")
    print(f"use it:  args: {{clipId: '{args.name}'}}  in src/variants.ts")
    print(f"ground:  {reg[-1]['ground']}  (the colour it letterboxes onto)")
    print("NOW SHEET THE CUT, not the scan — see references/broll.md, "
          "'the timecodes drift'")
    return 0


if __name__ == "__main__":
    sys.exit(main())
