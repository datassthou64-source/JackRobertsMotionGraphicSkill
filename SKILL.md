---
name: jack-remotion-motion
description: Build a full-length Jack Roberts-style short-form (1080×1920) motion-graphics video in Remotion from a voiceover — transcribe the VO, cut it into one-idea beats, source real logos / screens / footage, compose each beat from the premium device library (21st.dev / Refero-derived patterns already ported), and render a clean 1080×1920 master with SFX in the approved trial-reel look. Use whenever the user hands over a VO or script and asks for Remotion motion graphics, "the trial-reel style for the whole video", a full-length build, or a revision to one. Trigger on "Remotion", "motion graphics for this audio", "build the video from this VO", "trial reel style full video". Not for HyperFrames builds.
---

# Jack Roberts — Remotion motion graphics

One VO in, one clean 1080×1920 @ 30fps MP4 out: real product UI and real marks on a cool white
ground, one idea per cut, no baked captions, quiet SFX under the voice, ending right before
the facecam CTA. The look is the approved trial-reel intro carried through the whole video;
Template suitability is
fully described in `references/template-selection.md`; no demo viewing is required.

## Token economy — read this first

The user runs this repeatedly. The skill is built so a run spends tokens on the *beats*, not on
re-deriving the system:

- **Read only at the point of use** (table below). Never read the HyperFrames package, the
  reference project's source, or `remotion/` — everything they taught is already in
  `starter/` and `references/`.
- **Scripts do the boilerplate**: scaffold, transcribe, plan→stubs, gates, render, one-image
  review. Don't hand-write what they emit; don't render per-beat stills when `render.sh`
  makes the sheet.
- **Select from text**: `references/template-selection.md` maps all 26 approved templates (16 auditions + 10 reel templates, `starter/src/devices/reel-templates/`)
  to script meaning, suitable sections, required assets and poor fits. Do not open previews,
  galleries, old projects or component source to choose a template. Read only the selected
  implementation when coding. Preserve final rendered-video QA.
- **Compose, don't draw**: every beat is 10–25 lines placing devices from
  `starter/src/devices/`. Port a new device only when the catalogue has nothing — and when
  you do, keep an unapproved candidate separate until the user approves reuse. Auditions are
  currently closed; real footage/screens with approved framing are the fallback.
- **Review once**: `out/sheet.jpg` (first/mid/last frame of every beat) is the review. Open a
  single still only to diagnose a specific defect the sheet showed.
- **Report short**: paths, durations, CTA cut, sources — not a beat-by-beat narration.

## Read at the point of use

| When | Read |
|---|---|
| Starting any build or revision | `references/workflow.md` (the 8 steps + commands) |
| Planning beats / choosing what goes on screen | `references/template-selection.md` (complete suitability map; no preview/source required). `references/template-library.json` holds approval/exclusion status. |
| A visual question — size, colour, motion, ground, editor caption-safe band | `references/design-system.md` |
| A logo, screenshot, clip, still or SFX is needed | `references/asset-sourcing.md` |
| Auto-generating and placing SFX from finished Remotion animation | `references/sfx-workflow.md` + `scripts/remotion_sfx.py` |
| No approved template fits | Use relevant real footage/screens with approved framing. Read `references/premium-ui-sourcing.md` only when new sourcing is requested. |
| A beige Clawd-on-terminal beat with the scale-settle cut (the "orange scene") | `references/orange-scene-template.md` + `starter/src/devices/orange-scene.tsx` |
| Every beat transition (hard cut + speed ramp, built into `<Beat ramp>`); a custom ramp on scene elements | `references/transition-speed-ramp.md` → `transitionSpeedRamp()` / `transitionSpeedRampStyle()` from `starter/src/kit.tsx` |
| Claude / Anthropic is spoken, or any Clawd on screen (laptop / football / walk / gym / flag / confetti) | `references/mascots.md` → `<Mascot kind f h />` from `starter/src/mascots/` |
| Implementing the selected template | `references/devices.md` for kit APIs; the chosen implementation path in `template-library.json`. Do not scan other templates. |

## Laws that override everything

1. **One idea, one visual, one cut.** ~2.2s per beat; 18–110 frames; split rather than shrink.
2. **Real marks, real screens, real footage** for every named entity. Drawn devices only for
   what doesn't exist yet. Never recolour or redraw a brand. For any chat box, verify the current
   Claude, ChatGPT or Codex UI online for this build, capture it, and record URL/date/variant;
   never invent generic chat UI or assume an old bundled screenshot is still current.
3. **Second-person takeaway drives the visual**: show the viewer *doing* it (cursor, typing,
   install line), not a report about it. Sustain a meaningful action sequence through the beat
   (interaction, transformation, transition or handoff). Static zoom in/out alone is not enough.
   Match input to the device: phones use touch/gestures, never a mouse cursor.
4. **Flat and settled.** `settle` in, `inOut` moves, `accel` out. No 3D of any kind, no
   bounce/overshoot, no drift, no CSS animation, no randomness. `check_build.py` fails on all.
5. **Caption band 1180–1295 stays empty**; hero ≥ 50% of frame width at y≈640.
6. **No frame chrome**: no wordmarks, step tabs, footers, or script captions. Text lives inside
   the apparatus only. Remotion never burns captions; the user's editor adds them downstream.
7. **The composition ends before the CTA sentence.** "Comment X and I'll send you Y" is
   The user's facecam. Report the cut point in seconds.
8. **SFX follow animation, not narration**: after visuals are final, inspect actual local
   animation frames, build the palette, place cues at the visible events, and render the
   `SfxOnly` MP3 stem. **The palette defaults to the bundled dry cues** (`click-soft`,
   `click`, `whoosh-short`, `whoosh` — Tyler, 2026-09-24); ElevenLabs generation is optional
   and only works once its wrapper/key exist again. Jack's default sound language is Apple-like:
   dry MacBook trackpad clicks, compact non-tonal haptics, soft interface swipes, and only
   physically motivated shutters. Never use glass taps, pings, chimes, sparkles, notification
   dings, novelty sounds, or generic cinematic hits unless the user explicitly asks for them.
   Reuse assets across matching events. Give the first 10 seconds a deliberate restrained
   pass; a whoosh (or a generated soft riser) may lead into a major reveal, but its landing is
   a dry haptic/click—not a tonal `premium hit`. Never use trailer booms. First cue < 5s,
   gains 0.02–0.05. A reel with no SFX is a fail.
9. **Light by default**; `dark` beats ≤ 20%, only for dark artwork or to break a run.
10. **Every transition is a hard cut + transition speed ramp** (Tyler, 2026-09-26). Frame 0
    of a beat is the cut, the content is already moving and settles; `RampBlur` blurs the
    first 14 frames. No fade, crossfade, wipe, slide or opacity handoff anywhere — the gate
    fails on them. Vary the ramp's property beat to beat (`<Beat ramp={{x: [-260, 0]}}>`).
11. **Claude said → Clawd on screen.** Every beat whose words mention Claude / Anthropic casts
    a Clawd `<Mascot>` beside or on the real product UI, as often as the script allows —
    hooks included. Gate fails otherwise; opt out only with `// no-clawd: <reason>`.
12. **Short-form safe zone**: UI, text, logos and mascots sit inside x 120–960, y 240–1540,
    centred, devices ≤ 800 wide; only backgrounds bleed. ≤ ~3 words of on-screen text per
    beat. Rotate looks (full-bleed ground / macro / hero type / split / wall / card / dark),
    never the same look twice in a row. Check with `scripts/safe_sheet.py`.
13. **Deliver one clean master only** from `render.sh`, plus `SOURCES.md`. Do not render or
    keep a second captioned version.

## Where things live

```
~/.claude/skills/jack-remotion-motion/
  SKILL.md                 this file
  references/              workflow · devices · design-system · asset-sourcing · premium-ui-sourcing
  starter/                 copy-ready Remotion project (kit, devices, Reel, plan, demo beats, SFX, logos,
                           mascots/ = the Clawd library + sprites, devices/orange-scene.tsx)
  scripts/                 new_project.py · transcribe.py · plan_beats.py · remotion_sfx.py · fetch_logo.sh · fetch_brand.py · check_build.py · sheet.py · safe_sheet.py · render.sh
  config.local.json        this machine's projects_dir + shared node_modules (gitignored)
  assets/logos             bundled marks (Claude, Anthropic, OpenAI, ChatGPT, GitHub, 21st, Refero, Higgsfield, Clawd)
  assets/sfx               legacy/local fallback cues; use only the non-tonal click/whoosh files
  assets/mascots           source GIFs + gen.js behind the Clawd library; assets/orange-scene the measured beat

<projects_dir>/<slug>/    every build (node_modules symlinked; projects_dir from config.local.json)
```

Tooling facts: Remotion 4.0.518 + React 19 + gsap / @remotion/gsap, installed once into
`~/.cache/jack-remotion/deps` by the first `new_project.py` run and symlinked into every build;
`faster-whisper small.en` in `~/.cache/jack-remotion/wx` for transcripts (auto-created, no API
keys); `ffmpeg`/`ffprobe` on PATH; Chrome (or Claude in Chrome) for real-screen captures;
`yt-dlp` for footage. Run `scripts/doctor.sh` if anything is missing — prerequisites are in
`README.md`.

## Start

```bash
S=~/.claude/skills/jack-remotion-motion/scripts
python3 $S/new_project.py <topic-yyyymmdd> --vo "<vo file>" --transcribe
```

Then `references/workflow.md` step 3.
