#!/usr/bin/env python3
"""ONE image to review a whole build: first / middle / last frame of every beat.

    sheet.py <project> <rendered.mp4> [-o out/sheet.jpg] [--cols 6] [--mid-only]

Reads BEATS off src/plan.ts, pulls the exact frames out of the render with one ffmpeg
call, and tiles them with the beat name and frame number. Review THIS, not 26 stills.
The last frame of each beat is where exits break; the first is where a white flash
shows; the middle is the settled composition.
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("mp4")
    ap.add_argument("-o", "--out", default=None)
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--mid-only", action="store_true")
    ap.add_argument("--w", type=int, default=270, help="tile width px")
    a = ap.parse_args()

    plan = open(os.path.join(a.project, "src", "plan.ts")).read()
    total = int(re.search(r"REEL_FRAMES = (\d+)", plan).group(1))
    beats = [(n, int(s), total if e == "REEL_FRAMES" else int(e)) for n, s, e in re.findall(r"\[\s*(\w+),\s*(\d+),\s*(\d+|REEL_FRAMES)\s*\]", plan)]
    frames = []
    for n, s, e in beats:
        if a.mid_only:
            frames.append((n, (s + e) // 2))
        else:
            frames += [(n, s + 3), (n, (s + e) // 2), (n, e - 1)]
    frames = [(n, min(max(f, 0), total - 1)) for n, f in frames]

    out = a.out or os.path.join(a.project, "out", "sheet.jpg")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = tempfile.mkdtemp()
    sel = "+".join(f"eq(n\\,{f})" for _, f in frames)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.mp4, "-vf", f"select='{sel}',scale={a.w}:-1", "-vsync", "0", os.path.join(tmp, "f%04d.png")], check=True)
    pngs = sorted(os.listdir(tmp))
    ordered = sorted(frames, key=lambda x: x[1])
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "pillow"], check=True)
        from PIL import Image, ImageDraw
    tiles = [Image.open(os.path.join(tmp, p)).convert("RGB") for p in pngs]
    tw_, th_ = tiles[0].size
    cols = a.cols
    rows = (len(tiles) + cols - 1) // cols
    pad = 4
    sheet = Image.new("RGB", (cols * (tw_ + pad) + pad, rows * (th_ + pad) + pad), (51, 51, 51))
    d = ImageDraw.Draw(sheet)
    for i, (img, (n, f)) in enumerate(zip(tiles, ordered)):
        x = pad + (i % cols) * (tw_ + pad)
        y = pad + (i // cols) * (th_ + pad)
        sheet.paste(img, (x, y))
        d.rectangle([x, y, x + tw_, y + 26], fill=(0, 0, 0))
        d.text((x + 6, y + 6), f"{n} {f}", fill=(255, 255, 255))
    sheet.save(out, quality=88)
    print(f"{len(tiles)} frames from {len(beats)} beats -> {out}")


if __name__ == "__main__":
    main()
