# Workflow — VO in, MP4 out

Eight steps. Each has a script or a single file to touch. Don't improvise around them; the
scripts exist so a run never re-derives frame math, boilerplate or QA.

```
scripts/new_project.py   →  scripts/transcribe.py  →  BRIEF.md beat plan  →  sourcing
→  plan.tsv + plan_beats.py  →  write beats  →  check_build.py + stills  →  render.sh
```

## 1. Scaffold

```bash
S=~/.claude/skills/jack-remotion-motion/scripts
python3 $S/new_project.py <slug> --vo "/path/to/vo.mp3" --transcribe
```

`remotion-projects/<slug>/` with node_modules symlinked, VO converted, transcript written,
`BRIEF.md` stub. Slug = `<topic>-<yyyymmdd>` (e.g. `higgsfield-astra-20260917`). The user
iterates in versioned folders — a revision after delivery is a new slug with `-v2`, the
delivered one stays frozen.

## 2. Transcript → the frame column

`transcribe.py` prints every word with its start frame and flags the CTA word. Two decisions
come straight off that printout:

- **`REEL_FRAMES`** = the frame the CTA word starts − 4. The CTA ("comment X and I'll send
  you Y") is a facecam segment the user records — it gets NO animation, and the VO in the
  composition ends there too. Report the cut time in seconds in the handoff.
- **Beat starts** = the start frame of the first word each beat illustrates. Never a
  duration formula, never evenly spaced.

Fix brand spellings in `plan.ts` `FIXES` / `ATOMIC` (Whisper: "Cloud"→"Claude",
"Seathdance"→"Seedance"; names that must share a pill: `['Claude','Code']`).

## 3. Beat plan (BRIEF.md)

One row per beat: `id · spoken words · start frame · device · asset needed · why it fits`.
Split by idea, not by sentence: a sentence with two ideas is two beats; a list of three is
three beats. Cast from `template-selection.md` by meaning, not just a tool-name keyword.
For each beat record the chosen approved template (or real footage), why its action supports
the line, and the real assets needed. This text guide is sufficient: no demo/gallery/code
viewing is required to choose. `template-library.json` records exclusions. Budget by length
(~2.2s/beat); CTA remains facecam.

Two beats in a row on the same device = change the ground (`dots`, `dark`) or the device.

## 4. Source

`asset-sourcing.md`. Do it all at once, before any beat is coded, so the plan can change if
a logo or clip doesn't exist. Write `SOURCES.md` as you go. Copy bundled logos from
`assets/logos/`; only fetch what isn't there. Generate the video's small SFX palette here,
then reuse those files across the cue list instead of making a request per beat.

## 5. plan.tsv → plan.ts + stubs

```
id	start	device	phrase	sfx
01	0	AppIcon	GPT-6 Astra	click-soft
02	38	SiteMock	can now build beautiful websites	whoosh
```

```bash
python3 $S/plan_beats.py <project> --write
```

Rewrites `BEATS` and the initial SFX placeholders in `src/plan.ts`, then appends a stub per
beat to `src/beats/index.tsx`. Delete the five demo beats. Do not treat these beat-start
cues as final; the animation-driven SFX pass happens after the beat code is finished.

## 6. Write beats

Use the selected implementation from `template-library.json`; `devices.md` supplies kit APIs.
Do not reopen audition videos to work out what a template is for. Keep each beat's entrances relative to its own frame 0. Put
`dots` on 1-in-3 beats, `dark` on ≤ 20%. The hero ≥ 50% frame width. Nothing settled in
1180–1295. Every beat opens on a hard cut with a speed ramp — vary `ramp` beat to beat
(scale-down reveal, x/y arrival, small reframe, ≤8° rotate); never a fade. Every beat whose
words say Claude / Anthropic has a Clawd `<Mascot>` on screen (`check_build.py` fails otherwise).

Split a beats file past ~400 lines (`beats/b01-10.tsx`, …) — keeps edits cheap.

## 7. Check

Before the visual gate, run the animation-driven SFX workflow in `sfx-workflow.md`. It
generates the palette, replaces placeholder cue timing with actual visual-event frames, and
renders the standalone `SfxOnly` MP3.

```bash
python3 $S/check_build.py <project>          # tsc + 3D + determinism + timing + SFX gates
npx remotion still Reel out/f120.png --frame=120   # only for a beat you're unsure about
```

Don't render stills for every beat — `render.sh` produces the one-image review.

## 8. Render + review + deliver

```bash
$S/render.sh <project> Reel <outname>
```

Gates → `out/<name>.mp4` (clean, no baked captions) → `out/sheet.jpg`. Read
`sheet.jpg` **once** (first / mid / last frame of every beat). Fix, re-run. Then report:

- project path, the clean MP4, duration, the CTA cut point in seconds;
- which beats carry sourced footage / real screens vs. drawn devices;
- anything in `SOURCES.md` the user should know about (licence, a mark that couldn't be verified);
- a `HANDOFF.md` only if work remains.

Rendering ~60s takes ~40s. `SfxOnly` comp exists if the user wants the cue track alone.

## Revisions

The user's feedback lands per beat ("beat 7 is too small", "no 3D on 12"). Edit that beat only,
re-run `render.sh`. If he changes the *style*, update `design-system.md` and the kit in the
skill, not just the project — the next build must inherit it.
