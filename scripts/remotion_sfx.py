#!/usr/bin/env python3
"""Build a Remotion SFX palette, write its event timeline, and render an MP3 stem.

Usage:
  remotion_sfx.py PROJECT --manifest sfx-manifest.json [--output stem.mp3] [--force]

Each palette item is EITHER a bundled local cue (`"file": "click-soft.mp3"` - the default,
The user 2026-09-24) OR an ElevenLabs prompt (`"prompt": ..., "duration": ...`). Prompt items
need the ElevenLabs wrapper, which is not installed on this machine as of 2026-09-24; an
already-generated asset in public/sfx/ is reused without it.

The manifest is authored after inspecting the finished animation code. Local event frames
are converted to absolute frames before writing it; this script intentionally does not guess
semantic sound events from arbitrary TSX.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path


# optional ElevenLabs wrapper for "prompt" items; bundled "file" cues need nothing
GENERATOR = Path(os.environ.get('ELEVENLABS_SFX_SCRIPT', os.path.expanduser('~/.codex/skills/media-use/audio/scripts/elevenlabs-sfx.sh')))
LOCAL_SFX = Path(__file__).resolve().parent.parent / 'assets' / 'sfx'
# Only the dry, non-tonal cues. chime / ping / sparkle / notification / premium-light-hit /
# impact-bass are banned by the skill's sound law.
LOCAL_ALLOWED = {'click.mp3', 'click-soft.mp3', 'whoosh.mp3', 'whoosh-short.mp3'}


def fail(message: str) -> None:
    raise SystemExit(message)


def run(command: list[str], cwd: Path) -> None:
    subprocess.run(command, cwd=cwd, check=True)


def load_manifest(path: Path) -> tuple[list[dict], list[dict]]:
    data = json.loads(path.read_text())
    palette = data.get('palette')
    events = data.get('events')
    if not isinstance(palette, list) or not palette:
        fail('manifest.palette must be a non-empty array')
    if not isinstance(events, list) or not events:
        fail('manifest.events must be a non-empty array')

    names: set[str] = set()
    for item in palette:
        name = item.get('name', '')
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', name):
            fail(f'invalid palette name: {name!r}')
        if bool(item.get('prompt')) == bool(item.get('file')):
            fail(f'palette item {name!r} needs exactly one of "file" (local cue) or "prompt"')
        if item.get('file'):
            if item['file'] not in LOCAL_ALLOWED:
                fail(f'palette item {name!r}: local cue must be one of {sorted(LOCAL_ALLOWED)}')
        else:
            duration = float(item.get('duration', 0))
            if not 0.5 <= duration <= 30:
                fail(f'palette item {name!r} duration must be 0.5–30 seconds')
        names.add(name)

    last_frame = -1
    for event in events:
        name = event.get('name', '')
        frame = event.get('frame')
        gain = float(event.get('gain', 0))
        if name not in names:
            fail(f'event references unknown palette item: {name!r}')
        if not isinstance(frame, int) or frame < last_frame:
            fail('event frames must be non-negative integers in ascending order')
        if not 0.02 <= gain <= 0.06:
            fail(f'{name}@{frame}: gain {gain} outside 0.02–0.06')
        last_frame = frame
    return palette, events


def write_timeline(project: Path, events: list[dict]) -> None:
    plan_path = project / 'src' / 'plan.ts'
    source = plan_path.read_text()
    total_match = re.search(r'REEL_FRAMES\s*=\s*(\d+)', source)
    if not total_match:
        fail('src/plan.ts has no numeric REEL_FRAMES')
    total = int(total_match.group(1))
    if any(event['frame'] >= total for event in events):
        fail(f'an SFX event is at or after REEL_FRAMES ({total})')

    rows = '\n'.join(
        f"  ['{event['name']}', {event['frame']}, {float(event['gain']):.3f}],"
        for event in events
    )
    block = f"export const SFX: [string, number, number][] = [\n{rows}\n];"
    updated, count = re.subn(
        r"export const SFX: \[string, number, number\]\[\] = \[.*?\n\];",
        block,
        source,
        count=1,
        flags=re.S,
    )
    if count != 1:
        fail('could not replace the SFX table in src/plan.ts')
    temporary = plan_path.with_suffix('.ts.tmp')
    temporary.write_text(updated)
    os.replace(temporary, plan_path)


def verify_output(output: Path, expected_seconds: float) -> None:
    result = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,sample_rate,channels',
         '-show_entries', 'format=duration', '-of', 'json', str(output)],
        text=True,
        capture_output=True,
        check=True,
    )
    info = json.loads(result.stdout)
    streams = info.get('streams', [])
    if not streams or any(stream.get('codec_type') != 'audio' for stream in streams):
        fail('rendered stem is not audio-only')
    duration = float(info['format']['duration'])
    if abs(duration - expected_seconds) > 0.15:
        fail(f'rendered duration {duration:.3f}s does not match {expected_seconds:.3f}s')
    print(json.dumps(info, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('project')
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--output')
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()

    project = Path(args.project).expanduser().resolve()
    manifest_path = Path(args.manifest).expanduser().resolve()
    if not (project / 'src' / 'plan.ts').exists():
        fail(f'not a Jack Remotion project: {project}')
    palette, events = load_manifest(manifest_path)

    sfx_dir = project / 'public' / 'sfx'
    sfx_dir.mkdir(parents=True, exist_ok=True)
    for item in palette:
        destination = sfx_dir / f"{item['name']}.mp3"
        if destination.exists() and not args.force:
            print(f'reuse {destination}')
            continue
        if item.get('file'):
            source = LOCAL_SFX / item['file']
            if not source.exists():
                fail(f'bundled cue missing: {source}')
            destination.write_bytes(source.read_bytes())
            print(f'local {item["file"]} -> {destination}')
            continue
        if not GENERATOR.exists():
            fail(f'{item["name"]!r} needs ElevenLabs but the wrapper is missing ({GENERATOR}). '
                 'Use a local cue ("file": "click-soft.mp3") instead.')
        command = [
            str(GENERATOR), '--prompt', item['prompt'], '--duration', str(item['duration']),
            '--influence', str(item.get('influence', 0.55)), '--output', str(destination),
        ]
        if item.get('loop'):
            command.append('--loop')
        run(command, project)

    write_timeline(project, events)
    run(['npx', 'tsc', '--noEmit'], project)

    plan = (project / 'src' / 'plan.ts').read_text()
    total = int(re.search(r'REEL_FRAMES\s*=\s*(\d+)', plan).group(1))
    output = Path(args.output).expanduser().resolve() if args.output else project / f'{project.name}-sfx.mp3'
    output.parent.mkdir(parents=True, exist_ok=True)
    run(['npx', 'remotion', 'render', 'SfxOnly', str(output), '--codec=mp3', '--log=error'], project)
    verify_output(output, total / 30)
    print(f'SFX stem: {output}')


if __name__ == '__main__':
    main()
