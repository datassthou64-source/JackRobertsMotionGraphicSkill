# Trial — the Jack Roberts Remotion design system

The look of the approved trial-reel intros (Script-3 V3, SPLIT V5, S7 — Sept 2026), carried
through a whole video. It replaced Ember's warm paper for Remotion work on 2026-09-17. Where
this file and `assets/reference/higgsfield-astra-contact-sheet.jpg` disagree, the sheet wins.

**In one line: real product UI on a cool white radial ground, one big soft object per cut,
and nothing that isn't part of the visual apparatus.**

## Tokens (all in `starter/src/kit.tsx` — import, never retype)

| Token | Value | Use |
|---|---|---|
| ground | `radial-gradient(85% 75% at 50% 42%, #fff 0%, #f6f7f7 55%, #e9eaea 100%)` | every light beat (`<Ground/>`, inside `<Beat/>`) |
| dots | 44px grid of 2px `rgba(31,35,40,.16)`, masked to the centre | `<Beat dots>` — beats with a connection or a floating object; ≤ 1 in 3 |
| dark ground | `#1a1f27 → #0b0e13` radial | `<Beat dark>` — only when the artwork is dark (terminal, dashboard) or to break a run of same-device beats. ≤ 20% of beats |
| `C.ink` | `#141413` | primary text, hero numbers |
| `C.sub` | `#59636e` | secondary labels |
| `C.muted` | `#8a8a8a` | lightest ink on light ground, ≥ 26px only |
| `C.line` | `#e3e5e8` | the 2px hairline on every card |
| `C.coral` | `#d97757` | house accent: beams, sparkles, active states. One accent per beat |
| `C.green / red / blue / amber` | `#1f883d / #D22A18 / #0969da / #f6a218` | meaning only — connected, failed, selected, warning |
| card shadow | `0 40px 80px -30px rgba(31,35,40,.24), 0 4px 10px rgba(31,35,40,.06)` | every card, window, footage frame |
| radii | card 34 · window 28 · footage 30 · cap 22 · app icon 23% of size · pill 999 | |
| `UI` | SF Pro / Helvetica stack | everything except code |
| `MONO` | SF Mono / Menlo | terminals, paths, commands |
| `SERIF` | Georgia | ONLY inside a mocked website's own type |

Remotion exports have **no baked captions**. Keep the downstream editor's caption-safe band
clear so the user can add his own caption track later.

## Frame

1080 × 1920 @ 30fps. Facecam is NOT composited here — the composition is delivered full-frame,
The user cuts to facecam for the CTA.

| Zone | y | |
|---|---|---|
| hero | 320 – 1000, optical centre ≈ **640** (`HERO_Y`) | one object, 50–90% of frame width |
| secondary | 900 – 1150 | a name pill, a step row, a stat under the hero |
| **editor caption-safe band** | **1180 – 1295** | nothing settled sits here. Entrances may cross it |
| below | 1300+ | empty. A second row of a device may reach 1400 if the beat is a stack |

Side margin 60px for settled content. Big is right: the ChatGPT tile in the reference is 250px
in a pair and 420px alone; a browser window is 900–980 wide.

## The law: one idea, one visual

Each cut carries one idea expressed as one object. Not an object plus a heading. Not a list.
Three things = three cuts or one device that is *about* three-ness (a stack, a step row, a
fan). Test: phone, sound off, one second — can you name what you're looking at? The reference
build runs **26 beats in 57.6s** (mean 2.2s, range 1.3–3.0s).

Budget: ~11 beats for 25s, ~15 for 35s, ~20 for 45s, ~26 for 60s. Under 18 frames a beat
cannot land; over 110 it is two ideas.

## Object language

- **Real marks, always.** The brand's own SVG in `public/logos/`, official colours, never
  recoloured, never redrawn. A missing logo is a sourcing task, not a drawing task.
- **Real UI, framed.** A product's own screenshot inside `Win` (macOS chrome, 3 traffic
  lights, URL pill) or `Cap` (bare rounded frame). Paint over only what the beat needs to say
  (a placeholder, a model name) — the reference paints over the Codex composer's text and
  chips and leaves everything else as the screenshot.
- **Real footage, framed.** Sourced clips inside `Footage` with radius 30–40, never full-bleed,
  never with the source's own captions in shot.
- **CSS-drawn only for what doesn't exist yet.** A site the AI "built", a payment
  notification, a progress ring. Drawn with the devices library, in the same card language.
- **A cursor is an actor.** Any beat where a tool does something gets `Cursor`/`ClickAt`: it
  travels (`inOut`), presses (6-frame dip), a `Ring` lands.
- **Text lives inside the apparatus.** A filename, a URL, a model name, a number, a menu row.
  Never a caption of the script, never a headline, never a channel wordmark or step tab.

## Motion

| Move | Frames | Curve | Use |
|---|---|---|---|
| **rise** | 9–10 | `settle` (power4.out) | any object arriving: opacity + 40–60px up + 0.96→1 scale (`rise(t)`) |
| **pop** | 8–10 | `settle` | tile, chip, pill, still: opacity + 0.7→1 scale (`pop(t)`) |
| **travel** | 14 | `inOut` | cursor, counters, pushes, a card sliding to a slot |
| **push-in** | whole beat | `inOut` | 1.0 → 1.08 scale on footage or a cap — the cheapest "alive" |
| **beat transition** | hard cut + 36f speed ramp (≤ len−8) + 14f RampBlur | settle | built into `<Beat ramp>` + `Reel.tsx`; **no fades, ever** (Tyler, 2026-09-26); 2-frame overlap in plan.ts, later beat on top |
| **stagger** | 2–3 frames apart, group ≤ 15 frames | `settle` | site blocks, notification rows, cluster stills |
| **type** | 20–24 | `inOut` | `typed()` — a command, a prompt |
| **transition speed ramp** | 36 default | `settle` / power4.out | hard cut at peak velocity, then decelerate to rest; choose scale, x/y, 2D rotation, or a combination to fit the scene (`transitionSpeedRamp`) |

Never: `back`/`elastic`/`bounce`, wiggle, ambient drift, flash, strobing, CSS `transition` /
`@keyframes`, `Math.random`, **any 3D** (`perspective`, `rotateX/Y`, `translateZ`, tilted
cards — Tyler, 2026-09-15: "I hate the 3d look"). `check_build.py` fails the build on these.

Sudden states (an error, a breach) snap — `tw(f, at, 3)` — everything else settles.
When the user says **"transition speed ramp"**, read `transition-speed-ramp.md`; it is the
measured orange-template move, not the ordinary 9-frame `rise()` entrance.

## Sound

Generate the final palette with ElevenLabs after the animation is locked. The sound language
is Apple product-film: dry MacBook trackpad clicks, compact non-tonal haptics, soft interface
swipes, restrained physical shutters, and occasional airy risers. Gains **0.022–0.04**:
click/haptic 0.026–0.032, whoosh 0.026–0.03, riser 0.024–0.028. Table in `plan.ts`.

- cue meaningful authored actions, not every cut;
- use a dry click/haptic when an important logo, number, selection, or connection lands;
- use a whoosh only when an object visibly travels/scales or the subject materially changes;
- use a shutter only for capture, gallery, comparison, or visual-lock actions;
- in the first 10s, one restrained riser may lead into two important tactile landings;
- silence is preferable to a decorative cue. A typical stem is roughly 0.35–0.8 cues/s.

Never use bell, ding, chime, ping, glass, sparkle, notification, coin, arcade, glitch,
cartoon, bass impact, trailer boom, or a generic `premium hit` unless the user explicitly asks
for that exact sound identity. Repeated tonal cues are a failed palette, not a gain problem.

## The three things a build gets wrong

1. **Something drifts into the editor caption-safe band.** Check every beat's *last* frame, not its middle.
2. **A hero is too small.** If it isn't ≥ 50% of the frame width it isn't the hero.
3. **A label replaces a visual.** "Connected" is a pill *after* a beam lands, not instead of it.

## B-roll border update — 2026-09-24

The user approved the source-based Shine Border. `Broll` now uses its moving purple/pink/peach
radial-gradient outline at 5px; keep the blurred backdrop, 936×526 card centered at y=850 and 6% push-in.
The previous blue stroke and breathing blue glow are retired for new builds.

B-roll placement update (2026-09-24): default centre y=850, slightly above the
960px canvas centre. `Broll cy={...}` overrides it. Keep the bottom edge above y=1180.
