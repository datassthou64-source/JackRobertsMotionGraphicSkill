# Clawd mascot library — every Claude mascot animation, one component

**Rule (Tyler, 2026-09-26): whenever Claude is mentioned, Clawd is on screen — as much as
possible.** Every beat whose words say Claude / Claude Code / Anthropic casts a `<Mascot>`,
including frame 0 of a hook. Pick the action that matches the line (laptop = building /
coding, gym = working hard / power, flag = finished / shipped, confetti = win / free / launch,
football = playing / easy, walk = arriving / moving on). `transcribe.py` flags the words and
`check_build.py` fails a Claude beat without one; opt out only with `// no-clawd: <reason>`
inside the beat. Keep Clawd beside or standing on the real product screen — it accompanies
the real UI, it does not replace it. The detective Clawd is retired (Tyler, 2026-09-25).

```tsx
import {Mascot} from './mascots';           // starter/src/mascots/index.tsx — ships in every project
<Mascot kind="laptop" f={f} h={240} />      // f = the beat's own frame, h = rendered height px
```

Six kinds. Sprites and vectors all loop, all frame-driven, all pass `check_build.py`.

| kind | what it does | engine | source | notes |
|---|---|---|---|---|
| `laptop` | blinks, pulls out a laptop, turns 3/4 and types (1.48–3.1s), puts it away (3.65s loop, GIF's own per-frame timing) | sprite | Tenor transparent GIF `…claw'd-crab-laptop-gif-14833619646318452398` via `fetch_tenor.py` | 449×303; typing only → `f={f + 45}`. The old cleverhack capture (`source-clawd-laptop.gif`) is retired — low-res, GIF-dithered (Tyler, 2026-09-25) |
| `football` | kicks / juggles a football (4.51s loop) | sprite | Tenor transparent GIF `…claw'd-crab-football-gif-17523955505938523920` via `fetch_tenor.py` | 447×302 — the frame reserves room for the ball, so the figure reads ~25% smaller than `laptop` at the same `h` |
| `walk` | leans, looks, crouches, walks `walk` units, leaps (≈12s loop) | gsap-svg | Codrops "Reverse-engineering Claude AI's mascot animations" (ayotomcs.me/claude-mascot) | the only one that uses `@remotion/gsap`; `speed` unsupported (hook forbids `timeScale`) |
| `gym` | dumbbell curl sequence, 48 frames, 1.5s hold at the top (7.1s loop) | set-svg | Codrops | |
| `flag` | body sway + chequered flag wave (0.07s/frame, intro then loop) | set-svg | Codrops | |
| `confetti` | stomps, two confetti bursts offset by 0.125s / 0.75s (1s loop) | set-svg | Codrops | the burst extends ~24% of `h` above the figure — `FEET.confetti = 0.76` |

`FEET[kind]` = where the feet sit as a fraction of `h` from the top; use it to stand a mascot on a
surface: `top = surfaceY - h * FEET[kind]`. `<OrangeScene mascot="gym" />` does exactly that.

## Adding a Clawd GIF from Tenor (first choice)

```bash
python3 ~/.claude/skills/jack-remotion-motion/assets/mascots/fetch_tenor.py '<tenor page url>' starter/public/mascots/<kind>
```
Takes the page's `gif_transparent` rendition (498px, real alpha, flat colours — nothing to key),
crops to the union bbox, keeps the GIF's per-frame timing as `durs`, and prints the `SPRITES`
line. Add `<kind>` to `MascotKind`, the `Mascot` switch and `FEET`. Move `source.gif` out of
`public/` into `assets/mascots/`. The art is not on an integer pixel grid, so do not downsample
it to "native" — render the 498px frames at whatever `h` (no `pixelated`).

## Keying a GIF / screen capture into a sprite (the black-fringe fix)

Last resort, for a capture with no transparent rendition. A capture keeps its source's dither and
low resolution; the first laptop kind was keyed this way and the user rejected it (2026-09-25).

```bash
python3 ~/.claude/skills/jack-remotion-motion/assets/mascots/key_gif.py in.gif public/mascots/<kind> --shadow-rows 3
```
prints the `SPRITES` entry to paste. Two traps it handles, both found on 2026-09-20:

- **dark rim** — capture edges are anti-aliased against the app's near-black UI, so a plain key
  keeps a black border. Fix = colour-matte removal (AE's *Remove Color Matting*): for every
  edge pixel solve `pixel = a·F + (1−a)·B` (B = source bg, F = nearest interior colour) → alpha
  `a`, colour `F`. Bright greys (the laptop line) are exempt.
- **chewed feet** — the Claude composer casts a soft shadow up over the last rows of the feet
  (3 rows in `clawd.gif`), so those pixels read near-black and the key
  notches the legs. `--shadow-rows N` copies the last clean row down through the band — legs
  are vertical bars, so that is the real silhouette. Check the raw rows above the composer
  before keying a new capture.
- **notched joints** — the artist shades where the arm meets the body with dark red
  `(44,5,0)`; it touches the outside, so a brightness-only key floods it. Background is
  near-black AND neutral; reddish-dark is foreground. (Tyler, 2026-09-20: "missing pixel".)

The eyes survive because the key is a flood fill from the frame border, and enclosed black
never gets reached. Render `pixelated` afterwards; the edges are hard again.

**AE alternative**: render the mascot as ProRes 4444 with alpha, drop it at
`public/mascots/<kind>.mov`, add `mov: 'mascots/<kind>.mov'` to its `SPRITES` entry — the
library then plays the MOV (OffthreadVideo `transparent`) instead of the PNGs.

## Engines


- **sprite** — `public/mascots/<kind>/fNN.png`, one PNG per frame, `SPRITES[kind]` holds frames/fps/size
  (or `durs`, per-frame ms, for GIF timing).
  Add a new sprite by dropping keyed PNGs in a folder and one line in `SPRITES`.
- **set-svg** — the pixel-art SVG tree + a recorded list of timed `display` / `x` / `attr` sets
  (`clawd-data.ts`, generated). The evaluator replays every set with `pos ≤ t` — GSAP `.set()`
  semantics without GSAP. Add a new one by re-running the generator (below) or hand-writing ops.
- **gsap-svg** — `useGsapTimeline` from `@remotion/gsap` (paused timeline seeked to the frame).
  Rules the hook enforces: no `.call()`, no callbacks, no `timeScale`, no `play/seek`, element
  targets only. Swap `.call(fn)` for positioned `.set()`s when porting.

## Regenerating / adding from the Codrops demo

`clawd-data.ts` came from executing the demo's Next.js chunk in Node with a fake React + GSAP
that records the SVG tree and every timeline op (`assets/mascots/gen.js`). If ayotomcs ships
more mascots, re-run it against the new chunk; the walk timeline is hand-ported in `index.tsx`
because it is real tweens, not frame swaps.

## Where

```
starter/src/mascots/index.tsx      Mascot · Sprite · ClawdWalk · SPRITES · FEET
starter/src/mascots/clawd-data.ts  generated SVG trees + set-timelines (gym, flag, confetti, walk body)
starter/src/MascotSheet.tsx        reusable review sheet; registered as the `MascotSheet` composition in every new project
starter/public/mascots/<kind>/     sprite PNGs (also in assets/mascots/ with the source GIFs + gen.js)
remotion-projects/orange-scene-template-20260920/   MascotSheet comp = one-image review of every kind
```

For a future build, open or render `MascotSheet` first when choosing a Clawd action. Once a
kind is chosen, use `<Mascot>` directly in the scene; the sheet is a catalogue, not footage.
