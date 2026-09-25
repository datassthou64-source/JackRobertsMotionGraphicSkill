#!/usr/bin/env python3
"""GIF / screen-capture mascot → keyed, matte-free PNG sprite sequence.

    key_gif.py <in.gif> <out_dir> [--bg R,G,B] [--shadow-rows N]

1. finds the Claude composer's top edge (first row that is ≥80% UI grey across the middle) and
   crops above it;
2. `--shadow-rows N`: the composer casts a soft shadow up over the last N rows of the feet —
   those pixels read as near-black, so the last clean row is copied down over them (legs are
   vertical bars, so this is the true silhouette);
3. keys the background by flood-filling near-black from the frame border (enclosed black — the
   eyes — survives);
4. removes colour matting on the edge: pixel = a·F + (1−a)·B → alpha a, colour F (nearest
   interior colour), bright greys (a laptop line) exempt;
5. crops every frame to the union bbox and writes fNN.png.
"""
import argparse, os, sys, numpy as np
from collections import deque
from PIL import Image, ImageSequence
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument('gif'); ap.add_argument('out')
ap.add_argument('--bg', default=None, help='background RGB, default = frame corner')
ap.add_argument('--shadow-rows', type=int, default=0)
ap.add_argument('--dark', type=int, default=45, help='max channel value that counts as background')
ap.add_argument('--soft', action='store_true', help='keep soft alpha edges (default: hard — pixel art has no half pixels)')
a = ap.parse_args()

src = Image.open(a.gif)
frames = [np.array(f.convert('RGBA')) for f in ImageSequence.Iterator(src)]
dur = [f.info.get('duration', 100) for f in ImageSequence.Iterator(Image.open(a.gif))]
fps = 1000 / (sum(dur) / len(dur))
H, W = frames[0].shape[:2]
B = np.array([int(x) for x in a.bg.split(',')], float) if a.bg else frames[0][0, 0, :3].astype(float)
band = frames[0][:, int(W * .2):int(W * .8), :3].max(axis=2)
ct = int(np.where((band > 35).mean(axis=1) > 0.8)[0].min())
print(f'{len(frames)} frames {W}x{H}  bg {B.astype(int).tolist()}  composer top row {ct}')

def key(fr):
    im = fr[:ct].copy()
    if a.shadow_rows:
        # extend only where the row above the band is foreground, and never over a grey
        # pixel that is still readable (the laptop base sits inside the band)
        ref = im[ct - a.shadow_rows - 1]
        fg_above = ref[..., :3].max(axis=1) >= a.dark
        for y in range(ct - a.shadow_rows, ct):
            row = im[y]; mx = row[..., :3].max(axis=1); sat = mx - row[..., :3].min(axis=1)
            grey_ok = (sat < 30) & (mx > 60)
            im[y] = np.where((fg_above & ~grey_ok)[:, None], ref, row)
    rgb = im[..., :3].astype(int)
    # background = near-black AND neutral. Dark red (44,5,0) is orange under the artist's
    # shadow — foreground, or the arm/body joints get notched.
    reddish = (rgb[..., 0] > rgb[..., 1] + 20) & (rgb[..., 0] > 35)
    dark = (rgb.max(axis=2) < a.dark) & ~reddish
    h, w = dark.shape; seen = np.zeros_like(dark); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if dark[y, x] and not seen[y, x]: seen[y, x] = 1; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if dark[y, x] and not seen[y, x]: seen[y, x] = 1; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and dark[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; q.append((ny, nx))
    al = ~seen
    # matte removal
    interior = ndimage.binary_erosion(al, iterations=2)
    ring1 = al & ~ndimage.binary_erosion(al, iterations=1)
    edge = al & ~interior
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    edge &= ~((sat < 30) & (rgb.max(axis=2) > 110))              # bright grey: the laptop line
    edge &= ~(~ring1 & (sat < 15) & (rgb.max(axis=2) < 30))      # neutral black 2px in: ball panels, not a blend
    _, idx = ndimage.distance_transform_edt(~interior, return_indices=True)
    F = rgb[idx[0], idx[1]].astype(float)
    d = F - B; alpha = np.clip(((rgb - B) * d).sum(axis=2) / ((d * d).sum(axis=2) + 1e-6), 0, 1)
    out = im.astype(float)
    out[..., 3] = np.where(al, 255, 0)
    out[..., :3][edge] = F[edge]
    out[..., 3][edge] = alpha[edge] * 255
    out[..., 3][edge & (out[..., 3] < 64)] = 0
    if not a.soft:
        out[..., 3] = np.where(out[..., 3] >= 128, 255, 0)
    return out.astype(np.uint8)

keyed = [key(f) for f in frames]
ys, xs = np.where(np.any([k[..., 3] > 0 for k in keyed], axis=0))
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
os.makedirs(a.out, exist_ok=True)
for i, k in enumerate(keyed):
    Image.fromarray(k[y0:y1 + 1, x0:x1 + 1], 'RGBA').save(os.path.join(a.out, f'f{i:02d}.png'))
print(f'wrote {len(keyed)} × {x1 - x0 + 1}x{y1 - y0 + 1} → {a.out}   SPRITES entry: frames: {len(keyed)}, fps: {fps:.2f}, w: {x1 - x0 + 1}, h: {y1 - y0 + 1}')
