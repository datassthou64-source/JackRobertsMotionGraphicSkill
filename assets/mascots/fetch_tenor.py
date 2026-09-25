#!/usr/bin/env python3
"""Tenor GIF page → transparent PNG sprite sequence for the Clawd mascot library.

    fetch_tenor.py <tenor page url> <out_dir>

Pulls the page's `gif_transparent` rendition (498px, 1-bit alpha, flat colours — no keying
needed), crops every frame to the union bbox, writes fNN.png, keeps the GIF's own per-frame
timing and prints the `SPRITES` entry to paste into starter/src/mascots/index.tsx.
Keeps the source GIF next to the frames as source.gif.
"""
import os, re, sys, urllib.request
import numpy as np
from PIL import Image, ImageSequence

url, out = sys.argv[1], sys.argv[2]
UA = {'User-Agent': 'Mozilla/5.0'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA)).read()
page = get(urllib.parse.quote(url, safe=':/?=&%')).decode('utf-8', 'replace')
gid = re.search(r'-(\d{8,})(?:$|[/?#])', url)
m = re.search(r'"gif_transparent":\{"url":"([^"]+)"', page)
if not m: sys.exit('no gif_transparent rendition on that page (sticker-less GIF — key it with key_gif.py instead)')
src = m.group(1).encode().decode('unicode_escape')
os.makedirs(out, exist_ok=True)
gif = os.path.join(out, 'source.gif')
open(gif, 'wb').write(get(src))

im = Image.open(gif)
frames = [np.array(f.convert('RGBA')) for f in ImageSequence.Iterator(im)]
durs = [f.info.get('duration', 100) or 100 for f in ImageSequence.Iterator(Image.open(gif))]
ys, xs = np.where(np.any([f[..., 3] > 0 for f in frames], axis=0))
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
for i, f in enumerate(frames):
    Image.fromarray(f[y0:y1, x0:x1], 'RGBA').save(os.path.join(out, f'f{i:02d}.png'))
kind = os.path.basename(os.path.normpath(out))
print(f'{src}\n{len(frames)} frames, {x1 - x0}x{y1 - y0}, {sum(durs)} ms loop')
print(f"  {kind}: {{frames: {len(frames)}, fps: 30, w: {x1 - x0}, h: {y1 - y0}, dir: 'mascots/{kind}', durs: {durs}}},")
