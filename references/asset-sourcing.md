# Asset sourcing — logos, screens, footage, stills, sound

Every named entity in the VO earns a real asset on screen. This file is the where-from for each
kind, in priority order, and the file naming that keeps `SOURCES.md` honest. Sourcing runs
BEFORE beats are written — the beat plan lists which asset each beat needs.

Project folders: `public/logos/` (SVG/PNG marks) · `public/caps/` (screenshots, PNG) ·
`public/clips/` (footage, MP4 30fps) · `public/stills/` (generated images, PNG) ·
`public/sfx/` · `public/audio/vo.mp3`.

## Logos — `public/logos/<brand>.svg`

1. **Bundled** (`assets/logos/` in this skill; copy, don't re-fetch): Claude (color + mono),
   Anthropic, OpenAI, ChatGPT (SVG + raster tile), GitHub, 21st, Refero, Higgsfield,
   ByteDance, Clawd (Claude Code mascot — `clawd-canonical.svg`).
2. **svgl via 21st**: `scripts/fetch_logo.sh <project> "<brand>" [name] [--wordmark]` — free,
   unmetered, 500+ software marks. Prints candidates; verify the pick is the current mark.
3. **The brand's own site**: press/brand page, `/favicon.svg`, `apple-touch-icon.png`, or the
   GitHub org avatar (`https://github.com/<org>.png` — 460px, fine for a 250px tile).
4. **Never**: redraw, recolour, use an icon as a stand-in for a brand, or ship a mark you
   could not verify.

`AppIcon` on white with `pad 0.2` is the default. If the brand runs its mark on a coloured
tile (Higgsfield lime, ChatGPT black), pass `bg` with that colour and `pad 0.1`.

## Screenshots — `public/caps/<name>.png`

Use the Chrome tools (`mcp__claude-in-chrome__*`): open the real product page, resize the
window to the aspect you need (a 16:10 desktop → `Win w=900 h=640`; a composer → crop),
screenshot at 2× if possible. Then:

- crop to the object (`ffmpeg -i in.png -vf crop=W:H:X:Y out.png` or PIL);
- paint over only what the beat changes (a placeholder, a model chip) with a white box at
  the same coordinates — see the reference build's `CodexComposer` for the technique;
- record the URL + capture date in `SOURCES.md`.

A page you cannot access (paywalled, logged-in state you don't have) is drawn with the
devices library, not faked with someone else's screenshot.

## Footage — `public/clips/<name>.mp4`

The subject's own film beats anything built. Pipeline lives in
`~/.claude/skills/jack-remotion-motion/scripts/` (reuse, don't rewrite):

```bash
B=~/.claude/skills/jack-remotion-motion/scripts
python3 $B/broll_fetch.py -d <project> --search "<topic>" --channel "https://www.youtube.com/@<Brand>" -n 12 --list-only
python3 $B/broll_fetch.py -d <project> --url "https://www.youtube.com/watch?v=..."
python3 $B/broll_pick.py  -d <project> --scan <videoId> --top 24 --sheet out/broll.png
python3 $B/broll_pick.py  -d <project> --clip <videoId> --in 83.5 --out 86.0 --name astra-reveal --note "..."
```

Rules from that skill that still bite here: scope the search to the brand's channel; pick the
1.5–3s that *is* the topic, not the one that features it; `--scan` timecodes drift — verify
the cut's first AND last frame; re-encode with `-g 1` so Remotion seeks cleanly (broll_pick
does). A supplied social video is reference material, not automatically usable footage:
crop/reframe it before use so the selected pixels contain no burned-in captions, presenter,
channel chrome, or unrelated talking head. No 3D camera tilts.
Move the cut clip from `public/broll/` to `public/clips/` and use `Footage clip="<name>"`.

For a page/app that has no film, **record it**: Chrome tools → scroll/click the real thing →
screen-record with QuickTime (`⌘⇧5`), trim with ffmpeg, 30fps, `-g 1`.

## Stills — `public/stills/<name>.png`

Generated images / gallery beats: use the product's own output where it exists (its
showcase page, its X/Twitter posts). Otherwise a real, licence-clean photo (Unsplash) — never
an obviously-AI stock render for a beat about "beautiful". Square-ish 600–900px is enough.

## Fonts

The kit uses the system stack (SF Pro / Helvetica) so nothing is bundled and renders are
deterministic on this Mac. A mocked website's serif is Georgia. If a beat needs the brand's
own face (a Refero-style headline), load it with `@remotion/google-fonts` in that beat only.

## Sound — `public/sfx/`

For each video, generate a compact palette of roughly 4–8 distinct cues with ElevenLabs,
then reuse them at every matching cut/reveal. Do not spend one generation per cue instance.
Use concrete prompts that specify source, motion, material, envelope, and duration, with
`no music, no voice, no long reverb tail` unless the beat needs otherwise.

```bash
M=$ELEVENLABS_SFX_SCRIPT   # optional: your own ElevenLabs text-to-sound wrapper
$M --prompt "dry soft MacBook Force Touch trackpad click, compact haptic mechanical tactility, immediate short decay, premium and understated, strictly non-tonal, no bell, no ding, no chime, no ping, no glass, no typing, no music, no voice, no reverb, 0.5 seconds" \
  --duration 0.5 --output public/sfx/macbook-trackpad-click.mp3
```

The wrapper uses ElevenLabs `eleven_text_to_sound_v2`, peak-normalizes each result to
-1 dBFS, and writes a `.source.json` sidecar. Record that provenance in `SOURCES.md`.
Run a prompt with `--dry-run` when checking request shape. Sound generation needs
`$ELEVENLABS_API_KEY` or a project `.env` (CLI OAuth alone does not work in v1.3.2). If the
CLI is unauthenticated, out of credits, or the generated result is poor, use only the safe
non-tonal fallbacks copied by `new_project.py`: `click` · `click-soft` · `whoosh` ·
`whoosh-short`. The other legacy files may still be present for old projects but are not
approved defaults. Never fall back to impacts, pings, chimes, sparkles, notifications,
glitches, or novelty sounds; silence is better.
Gains and density remain governed by `design-system.md`; never raise timeline gain just
because the generated source is normalized.

## SOURCES.md

One line per asset: `file | URL | owner/licence | what was changed`. `fetch_logo.sh` appends
its own lines. The user ships to a client; an asset without a line is an asset that gets cut.
