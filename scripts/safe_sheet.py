#!/usr/bin/env python3
"""Safe-zone review sheet: one frame per 0.5s with the short-form safe box drawn on top.

    python3 safe_sheet.py <video.mp4> [-o out/safe-sheet.jpg] [--step 0.5]

Safe box (Tyler, 2026-09-25): x 120-960, y 240-1540 on 1080x1920. It's centred, with padding on both sides.
Hatched in red = platform UI (top bar, bottom caption/CTA stack, right action rail).
The caption pill band 1150-1320 is outlined in cyan.
"""
import argparse, glob, os, subprocess, tempfile
from PIL import Image, ImageDraw

SAFE = (120, 240, 960, 1540)
RAIL = (880, 720, 1080, 1920)
BAND = (0, 1150, 1080, 1320)

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("-o", default=None)
ap.add_argument("--step", type=float, default=0.5)
a = ap.parse_args()
out = a.o or os.path.join(os.path.dirname(a.video), "safe-sheet.jpg")

with tempfile.TemporaryDirectory() as d:
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", a.video, "-vf", f"fps={1/a.step}", os.path.join(d, "%04d.png")], check=True)
    files = sorted(glob.glob(os.path.join(d, "*.png")))
    W, H = 270, 480
    cols = 8
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * W, rows * H), "black")
    for i, f in enumerate(files):
        im = Image.open(f).convert("RGBA")
        ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(ov)
        # platform UI zones outside the safe box
        for box in [(0, 0, 1080, SAFE[1]), (0, SAFE[3], 1080, 1920), (0, 0, SAFE[0], 1920), (SAFE[2], 0, 1080, 1920), RAIL]:
            dr.rectangle(box, fill=(255, 0, 0, 55))
        dr.rectangle(SAFE, outline=(255, 230, 0, 255), width=6)
        dr.rectangle(BAND, outline=(0, 220, 255, 255), width=4)
        im = Image.alpha_composite(im, ov).convert("RGB").resize((W, H))
        ImageDraw.Draw(im).text((6, 6), f"{i * a.step:.1f}s", fill=(255, 0, 0))
        sheet.paste(im, ((i % cols) * W, (i // cols) * H))
    sheet.save(out, quality=85)
    print(out, sheet.size, len(files), "frames")
