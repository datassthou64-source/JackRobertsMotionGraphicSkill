# Jack Roberts Motion Graphics — a Claude Code skill for Remotion

Turn a voiceover into a finished **1080×1920 @ 30fps** short-form motion-graphics video in
Remotion, in the style used for Jack Roberts' AI-news Shorts and Reels: real product screens and
real logos on a clean white ground, one idea per cut, **hard cuts with a speed ramp** (no fades),
Claude's **Clawd mascot** on screen whenever Claude is mentioned, and quiet UI sound effects.

The skill includes the full Remotion starter project, 26 approved animated templates, a device
library, the Clawd mascot library, build gates, and a one-image review sheet. Claude reads
`SKILL.md` and runs the whole pipeline.

## Prerequisites

| Need | Version | Install (macOS) | Used for |
|---|---|---|---|
| **Claude Code** | current | https://claude.com/claude-code | runs the skill |
| **Node.js + npm** | 18+ | `brew install node` | Remotion (installed automatically on first run) |
| **Python 3** | 3.9+ | `brew install python` | scaffold, transcription, gates, review sheets |
| **ffmpeg + ffprobe** | any recent | `brew install ffmpeg` | audio conversion, frame grabs, probing |
| **Pillow**, **numpy** | see `requirements.txt` | `python3 -m pip install -r requirements.txt` | review sheets, b-roll picking |
| yt-dlp *(optional)* | any | `brew install yt-dlp` | downloading real product footage |
| Google Chrome *(optional)* | any | — | capturing real product screens |
| ElevenLabs key *(optional)* | — | `ELEVENLABS_SFX_SCRIPT` env var | custom SFX; the bundled cues work without it |

You don't need to install these yourself:

- **Remotion 4.0.518, React 19 and GSAP** install once into `~/.cache/jack-remotion/deps` the first
  time you create a project (about a minute). Every later project symlinks that install.
- **faster-whisper** (for word-level transcripts) builds its own venv in `~/.cache/jack-remotion/wx`
  the first time you transcribe. It runs locally and needs no API key.

Check everything with:

```bash
bash ~/.claude/skills/jack-remotion-motion/scripts/doctor.sh
```

## Install

```bash
git clone https://github.com/datassthou64-source/JackRobertsMotionGraphicSkill.git ~/.claude/skills/jack-remotion-motion
python3 -m pip install -r ~/.claude/skills/jack-remotion-motion/requirements.txt
bash ~/.claude/skills/jack-remotion-motion/scripts/doctor.sh
```

Restart Claude Code and the skill shows up as `jack-remotion-motion`.

## Use it

In Claude Code, from the folder where you want your builds:

> Build Remotion motion graphics for this voiceover: ~/Downloads/vo.mp3

Claude scaffolds `./remotion-projects/<topic-yyyymmdd>/`, transcribes the VO, plans the beats,
picks templates, sources logos and screens, writes the beats, runs the gates, renders
`out/<name>.mp4`, and reviews `out/sheet.jpg`.

To run it by hand:

```bash
S=~/.claude/skills/jack-remotion-motion/scripts
python3 $S/new_project.py my-video-20260926 --vo ~/Downloads/vo.mp3 --transcribe
cd remotion-projects/my-video-20260926
npx remotion studio                     # preview
bash $S/render.sh . Reel my-video       # gates → render → out/sheet.jpg
python3 $S/safe_sheet.py out/my-video.mp4   # short-form safe-zone check
```

With no voiceover yet, run `new_project.py <slug> --seconds 30` for a silent master.

**Optional per-machine paths:** add `config.local.json` next to `SKILL.md` (it's gitignored):

```json
{ "projects_dir": "/path/to/remotion-projects", "node_modules": "/path/to/an/existing/node_modules" }
```

## The house rules (enforced by `scripts/check_build.py`)

1. **One idea, one visual, one cut.** About 2.2s per beat.
2. **Every transition is a hard cut plus a transition speed ramp.** The content is already moving
   on frame 0 and settles with power4-out. There are 14 frames of camera motion blur, and the ramp
   property changes from beat to beat. **No fades, crossfades, wipes or slides.**
3. **Claude said → Clawd on screen.** Every beat whose words mention Claude or Anthropic gets a
   Clawd mascot (laptop, football, walk, gym, flag or confetti).
4. **Real marks, real screens, real footage** for everything that's named.
5. **Flat 2D only:** no 3D, no bounce or overshoot, no randomness, no CSS animation.
6. **Short-form safe zone:** content stays inside x 120–960, y 240–1540, and the caption band at
   y 1180–1295 stays clear. At most about 3 words of on-screen text per beat.
7. **No baked captions and no frame chrome.** The composition ends before the spoken CTA.
8. **Quiet, dry SFX** (clicks and whooshes at gain 0.02–0.05) placed on what's visible.

## What's inside

```
SKILL.md          the skill Claude follows (laws, read-at-point-of-use table)
TEMPLATES.md      catalogue of every template, device, mascot and transition
references/       workflow · template selection · design system · devices · mascots ·
                  transition speed ramp · asset sourcing · SFX workflow · orange scene
starter/          the Remotion project every build copies (kit, devices, 26 templates,
                  mascots, demo beats, logos, SFX)
scripts/          new_project · transcribe · plan_beats · check_build · render · sheet ·
                  safe_sheet · remotion_sfx · fetch_logo · broll_fetch · broll_pick · doctor
assets/           logos, SFX, Clawd mascot sources + tools (fetch_tenor.py, key_gif.py, gen.js)
```

## Licence

The code is MIT (`LICENSE`). Logos, the Clawd mascot, ported components and media keep their
owners' terms; see `THIRD_PARTY.md`.
