# Animation-driven SFX workflow

Run this after the Remotion beats are visually final. The animation—not the narration—is
the placement authority. The result is a standalone MP3 stem with no Jack voice.

## 1. Audit visible events

Read `src/plan.ts` for absolute beat starts and inspect every used component in
`src/beats/`. For each meaningful visible action, calculate:

`absolute frame = beat start + local animation frame`

Cue hard subject cuts, object arrivals, clicks/presses, count-up landings, completed routes,
and success/error states. Do not cue passive opacity, continuous drift, decorative grain,
or every typed character. One sound may cover a clustered action.

### First 10 seconds — priority pass

Spend the most sound-design attention on frames 0–299. Identify the opening promise and
the next two or three decisive visual reveals. Use a light premium riser before a reveal and
a dry tactile click/haptic on its exact landing frame. A riser starts early enough for its crest—not
its beginning—to meet the reveal. Keep the layer airy, short, and editorial: no sub-heavy
trailer boom, braam, explosive slam, or long cinematic tail.

The opening ten seconds should normally contain at least one restrained riser and two dry
MacBook-style haptic/click landings where the animation earns them. Do not fill every gap;
contrast is what makes the sound feel premium. After 10 seconds, reserve risers and landing
cues for genuine story pivots, the main payoff, and the final system resolution.

## 2. Author the manifest

Create `sfx-manifest.json` in the project. **Default (Tyler, 2026-09-24): bundled local cues.**
The ElevenLabs wrapper this workflow was built on is gone from the machine and no key is set,
so a palette item names a bundled file instead of a prompt. Only the dry, non-tonal four are
allowed: `click-soft.mp3` (the default landing), `click.mp3`, `whoosh-short.mp3` (the default
opening lift / subject cut), `whoosh.mp3`.

```json
{
  "palette": [
    {"name": "jack-click",  "file": "click-soft.mp3"},
    {"name": "jack-whoosh", "file": "whoosh-short.mp3"}
  ],
  "events": [
    {"name": "jack-whoosh", "frame": 12, "gain": 0.03},
    {"name": "jack-click",  "frame": 63, "gain": 0.028}
  ]
}
```

Name palette items by role (`…click…`, `…haptic…`, `…whoosh…`, `…riser…`) — `check_build.py`
reads the names to confirm the opening 10s has a lift and two tactile landings.

**Optional — ElevenLabs** (only once the wrapper and a key exist again): a palette item with
`"prompt"`, `"duration"` and `"influence"` instead of `"file"`, e.g.
`{"name": "jack-transition", "prompt": "short premium UI transition whoosh, airy left-to-right sweep, tight decay, no music, no voice, no long reverb tail", "duration": 0.6, "influence": 0.55}`.
The prompt guidance below applies to those items.

The prompt describes source/action, material, envelope, duration, and negatives. Use a
palette role that matches the visual: MacBook trackpad click, compact haptic press, light
riser, soft interface swipe, restrained physical shutter, or an exceptional story-specific
sound. The default aesthetic is Apple product-film sound: dry, precise, tactile, minimal,
and non-tonal. Every landing prompt must explicitly exclude `bell`, `ding`, `chime`, `ping`,
`glass`, `sparkle`, and `notification`. Risers must say `light`, `restrained`, and `premium`,
and exclude heavy bass, trailer booms, braams, explosions, and long reverb.

### Default Jack landing

With the bundled cues (the default), the landing is `click-soft.mp3`. On the ElevenLabs route,
generate and reuse a dry **MacBook Force Touch trackpad click** for important UI, logo, and
product landings. Do not use the legacy `assets/sfx/premium-light-hit.mp3`; its glassy,
crystalline profile reads as a repeated ding when reused. Existing projects may still carry
that file in `public/sfx/`, but its presence is not approval to place it.

Use this ElevenLabs prompt:

> dry soft MacBook Force Touch trackpad click, compact haptic mechanical tactility,
> immediate short decay, premium and understated, strictly non-tonal, no bell, no ding,
> no chime, no ping, no glass, no typing, no music, no voice, no reverb

Use a timeline gain around 0.026–0.032. Generate another landing family only when the visual
material specifically calls for it; do not add variety for its own sake. If the stem reads
as repeated `ding ding ding`, regenerate the landing cue with stronger non-tonal exclusions;
lowering the volume is not an adequate fix.

## 3. Generate, place, and render

```bash
python3 ~/.claude/skills/jack-remotion-motion/scripts/remotion_sfx.py \
  /absolute/project/path \
  --manifest /absolute/project/path/sfx-manifest.json \
  --output /absolute/project/path/project-name-sfx.mp3
```

This copies the bundled cues (or generates missing ElevenLabs assets) into `public/sfx/`, writes the `SFX` table in
`src/plan.ts`, typechecks, renders `SfxOnly` with the MP3 codec, and verifies an audio-only
file whose duration matches `REEL_FRAMES`. Pass `--force` only when intentionally replacing
an already generated palette.

## Gate

- First cue within five seconds.
- Frames 0–299 contain at least one lift (a whoosh with local cues, or a restrained generated
  riser) and two dry non-tonal haptic/click landings on meaningful reveals.
- Every riser/whoosh starts before its target and crests on the target hit.
- Landing prompts name a physical Apple-like source and explicitly exclude bell, ding,
  chime, ping, glass, sparkle, and notification qualities.
- No generic `premium hit`, tonal confirmation, novelty sound, or cinematic/bass-heavy cue.
- Every hard subject cut and meaningful authored landing has a cue.
- No cue exists only because a narration word occurs.
- Cues use actual animation frames and gains 0.02–0.06.
- MP3 has no video stream and no voice source.
- Generated (ElevenLabs) assets keep their `.source.json` sidecars beside them.
