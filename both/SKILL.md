---
name: jack-motion-both
description: One voiceover in, two caption-free 1080×1920 motion-graphics videos out — a Remotion build (jack-remotion-motion) and a code-motion build (jack-code-motion) of the same VO, from one shared transcript and one storyboard. Asks for the audio file first if none was given, transcribes it automatically (local faster-whisper, no key), scaffolds both projects, then builds and renders both. Use when the user asks for "both versions", "Remotion and code-motion", "both engines", "two versions of the motion graphics", or runs this skill with or without an audio file.
---

# Both engines from one VO

Output: two MP4s of the same voiceover, **neither with captions**, both ending right before the
spoken CTA.

```
remotion-projects/<slug>/out/<slug>-remotion.mp4
code-motion-projects/<slug>/out/<slug>-code-motion.mp4
```

## 1. Get the audio — ask first

If the user didn't give a voiceover path, **ask for it before anything else**, in one line:
"Drop the voiceover file (mp3 / wav / m4a / mp4) and I'll build both versions." Don't scaffold,
guess, or build a silent master while you wait. If they give a script but no audio, ask for the audio.

## 2. Scaffold + transcribe (one command)

```bash
S=~/.claude/skills/jack-remotion-motion/scripts     # Tyler's machine: ~/.claude/client-skills/…
python3 $S/both.py "<vo file>" [--slug <topic-yyyymmdd>]
```

This transcribes once and writes the transcript into both projects: `src/transcript.json` for
Remotion and `words.json` for code-motion. It also sets the shared CTA cut in both — before "Comment", or before the question that leads into it ("Want to use it? Comment…" cuts before "Want") — (Remotion
`BRIEF.md`, code-motion `plan.json` `end`) and prints both project paths. Run with no argument in a
terminal and it prompts for the file.

## 3. One storyboard, two treatments

Write the beat list **once** in the Remotion `BRIEF.md`: frames, words, the one idea per beat.
Both builds use the same cut points, so the two versions line up and can be compared directly.
Source every logo, screen and clip once and copy it into both projects. Each engine then
visualises the beats its own way:

- **Remotion**: follow the `jack-remotion-motion` SKILL.md from `references/workflow.md` step 3. Use the templates and
  devices from the catalogue, in the Trial look.
- **code-motion**: follow the `jack-code-motion` SKILL.md (repo: `code-motion/`) from its
  workflow step 2 (brand language). Write free-form beats in the product's own visual language.
  Don't copy the Remotion layouts across.

Build Remotion first, then code-motion. Each engine keeps its own laws, gates and review sheet.

## 4. No captions — in either build

- Remotion: render only the clean `Reel` composition through `render.sh`. Leave
  `src/transcript.json` as timing data only, never render a captioned composition, and don't
  burn in text that repeats the script.
- code-motion: `words.json` is for timing only. No caption layer, no subtitle track.

Both still follow the shared rules: hard cut plus speed ramp on every beat, Clawd whenever Claude
is mentioned, the safe zone, ≤ ~3 words on screen per beat, the caption band y 1180–1295 kept
empty, and dry SFX.

## 5. Render + report

```bash
bash ~/.claude/skills/jack-remotion-motion/scripts/render.sh <remotion proj> Reel <slug>-remotion
bash ~/.claude/skills/jack-code-motion/scripts/render.sh <code-motion proj> <slug>-code-motion
```

Look at each `out/sheet.jpg` once, fix what it shows, then report briefly: both MP4 paths, their
durations, the CTA cut in seconds (the same for both), and each project's `SOURCES.md`.
