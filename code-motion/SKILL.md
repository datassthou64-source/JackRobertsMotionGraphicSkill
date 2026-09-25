---
name: jack-code-motion
description: Build a Jack Roberts short-form (1080×1920 @ 30fps) motion-graphics video as raw browser code — no Remotion, no HyperFrames. Every beat is free-form HTML/SVG/canvas/WebGL written for that one idea, branded from the product's own site via Firecrawl, rendered frame-exact by headless Chrome + ffmpeg with the VO and dry SFX. Use when Tyler asks for "code motion", "the code-motion way", "without Remotion / HyperFrames", "more creative / more freedom" motion graphics, "like Jack's Opus design video", or points at a code-motion project to revise. Remotion (`jack-remotion-motion`) stays the default for "Remotion" asks; HyperFrames only when named.
---

# Jack Roberts — code-motion

One VO in, one 1080×1920 @ 30fps MP4 out. Each beat is a hand-written piece of web code for
that one idea — no template library, no framework contract — so a beat can be a halftone
portrait resolving into a photo, a reel wall bursting out of a logo, or a timeline being
bladed. It is the method from Jack's own video: the model writes the graphic as code, and
Firecrawl pulls the brand so the graphic speaks the product's own visual language.

The approved reference build is `examples/jev-20260926/index.html` (Jev / TypeSafe AI, 19 beats,
35.8s — Tyler: "this is great", 2026-09-26). Read it before writing a new build: it is the
quality bar and the idiom.

## The one contract

**Every frame is a pure function of its frame number.** `runtime.js` gives:

```js
CM.scene({ id, start, end,            // global frames; hard cut in at start, out at end
  ramp: { scale:[1.3,1] },            // the hard-cut speed ramp: x / y / scale / rot (2D only)
  build(cam, s) { … return state },   // create DOM / SVG / canvas once
  render(f, state) { … } })           // set everything from local frame f
```

Helpers: `tw(f, start, dur, ease)` → 0..1 · `E.settle` (power4.out, arrivals) · `E.inOut`
(travel) · `E.accel` (exits) · `lerp` · `clamp` · `rng(seed)` · `h(tag, attrs, …kids)` ·
`canvas(parent)`. `kit.js` adds `place`, `cursor` + `press`, `halftone`, `halftoneImage`,
`typed`, `fmtK`, `preload(urls)`. CSS/WAAPI animations inside a scene are auto-seeked, but
prefer driving everything from `f` in `render()` so timing is readable.

Inside that contract anything goes: canvas pixel effects, SVG path drawing, generated
textures, real video frames, charts, physics you precompute. That freedom is the point —
don't rebuild a template library.

## Workflow

```bash
S=~/.claude/skills/jack-code-motion/scripts          # Tyler's machine: ~/.claude/client-skills/jack-code-motion/scripts
python3 $S/new_project.py <topic-yyyymmdd> --vo <vo file> --transcribe   # → projects dir, words.json, CTA frame
python3 ~/.claude/skills/jack-remotion-motion/scripts/fetch_brand.py <proj>/assets <product site>
node $S/../engine/render.mjs <proj> --sheet --guides    # contact sheet in ~4s — iterate on this
node $S/../engine/render.mjs <proj> --stills 120,340    # diagnose single frames
bash $S/render.sh <proj> <name>                          # gates → full render with VO+SFX → sheet
```

Projects land in `./code-motion-projects/<slug>/` unless `config.local.json` sets `projects_dir`.
A 36s reel renders in ~13s on 6 workers.

1. **Words.** `words.json` from `--transcribe` (or an existing transcript). Beat start = the
   first illustrated word's start × 30. The last beat ends at the frame of "Comment" — the CTA
   is Tyler's facecam; set `plan.json` `end` to it and report the cut in seconds.
2. **Brand language first.** `fetch_brand.py` (Firecrawl, `$FIRECRAWL_API_KEY`) → colours, fonts,
   logo, og-image. Then capture the site once with headless Chrome
   (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1440,2400 --virtual-time-budget=9000 --screenshot=<abs.png> <url>`)
   and look at it: its textures, window chrome, type, corner radii become the build's vocabulary
   (Jev: pink halftone clouds, retro-OS windows with black title bars, mono labels, square corners).
   Write them as CSS tokens + 2–3 helpers at the top of `index.html`.
3. **Real assets for every named entity** — svgl / Firecrawl logos, yt-dlp footage and
   thumbnails (`i.ytimg.com/vi/<id>/oar2.jpg` = the 1080×1920 Shorts frame), real numbers.
   Extract logos from the brand's own files (alpha from ink, never recolour). Log each in `SOURCES.md`.
4. **Storyboard in text**, one line per beat: frames · words · the one object · the action.
   ~1.9–2.2s a beat (18–110 frames). Rotate grounds (paper / brand-colour texture / dark ≤ 20%).
   Then write the beats — each a fresh idea; `references/patterns.md` lists the proven moves.
5. **Sheet → fix → sheet.** Look at `out/sheet.jpg` once per pass (the second frame of a beat
   can be the previous beat's last frame when beats overlap by one — not a bug).
6. **SFX after visuals lock**: `plan.json` cues on visible events — `whoosh-short` on cuts
   (0.022), `click`/`click-soft` on landings, presses, locks (0.024–0.03), `whoosh` for a burst
   or big move. 0.35–0.9 cues/s, first cue at frame 0. Bundled dry cues only.
7. `render.sh` → deliver `out/<name>.mp4` + `SOURCES.md`. Report: path, duration, CTA cut, sources.

## Laws (shared with the Remotion engine — Tyler's, not optional)

1. **Hard cut + speed ramp on every beat; no fades, crossfades, wipes or opacity handoffs.**
   The runtime builds it; vary `ramp` per beat.
2. **One idea, one visual, one action.** Something must *happen* — typing, a cursor drag, a
   blade cut, a count-up, a sort. A static zoom is not a beat.
3. **Flat 2D.** No perspective / rotateX/Y / translateZ / tilted cards (Tyler hates 3D). 2D
   rotate ≤ 8° in ramps only. Settle, never bounce.
4. **Safe zone**: UI, text, logos inside x 120–960, y 240–1540; hero near y≈640 and ≥ 50% of
   width; **y 1180–1295 stays empty** (Tyler's caption track). Only backgrounds bleed.
   `--guides` draws both on the sheet.
5. **≤ ~3 words of on-screen text per beat**, inside the apparatus (a tag, a field, a window
   title) — never a caption of the script, no headers, footers, step tabs or wordmarks.
6. **No captions** baked in. **Claude said → Clawd on screen** (see `jack-remotion-motion`
   `references/mascots.md`; Tenor GIF originals via its `fetch_tenor.py`).
7. **Real marks, never redrawn or recoloured.** A logo sits on the ground by itself — no white
   tile behind it on a busy wall (Tyler, 2026-09-26); use a soft drop-shadow for separation.
8. **Show the thing, don't illustrate it.** When a beat is about editing/cutting/structure, build
   the real tool metaphor (an edit timeline with filmstrip + waveform, bladed) rather than
   chopping a thumbnail (Tyler, 2026-09-26).
9. Determinism: `check.py` fails on `Math.random`, wall-clock time, timers/rAF, CSS
   `transition`, overshoot easings, and any 3D.

## Files

```
engine/runtime.js  frame clock, scenes, hard cuts, speed ramp + entry blur      (copied into each project)
engine/kit.js      cursor/press, halftone, halftoneImage, typed, preload, place  (copied into each project)
engine/render.mjs  headless Chrome → PNG frames → ffmpeg; --sheet --guides --stills --meta; one browser per worker
engine/mix.py      VO + SFX cues from plan.json (linear gains, no normalisation)
scripts/new_project.py · check.py · render.sh
assets/starter.html · fonts/ (OFL stand-ins) · sfx/ (click, click-soft, whoosh, whoosh-short)
references/patterns.md   the proven beat moves, with where each lives in the example
examples/jev-20260926/   the approved build (index.html + plan.json; assets not shipped)
```

Engine setup is automatic (`render.sh` runs `npm install` in `engine/` once: puppeteer-core,
driving the installed Google Chrome). Needs Node 18+, Python 3, ffmpeg, Chrome.
