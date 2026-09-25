#!/usr/bin/env python3
"""Mux VO + SFX cues onto the silent render.  mix.py <project> <silent.mp4> <final.mp4>
plan.json: {"vo": "assets/vo.wav", "vo_gain": 1.0, "end": <frames>,
            "sfx": [{"f": 0, "file": "assets/sfx/click.mp3", "gain": 0.03}, ...]}
Paths are relative to the project. SFX gains are linear (0.02–0.05 is the house range).
"""
import json, subprocess, sys
from pathlib import Path

proj, silent, final = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
plan = json.loads((proj / "plan.json").read_text())
dur = plan["end"] / 30
ins, chains, labels = ["-i", silent], [], []
if plan.get("vo"):
    ins += ["-i", str(proj / plan["vo"])]
    chains.append(f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{dur},volume={plan.get('vo_gain', 1.0)}[vo]")
    labels.append("[vo]")
for c in plan.get("sfx", []):
    idx = len(ins) // 2
    ins += ["-i", str(proj / c["file"])]
    ms = round(c["f"] / 30 * 1000)
    chains.append(f"[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={c['gain']},adelay={ms}|{ms}[s{idx}]")
    labels.append(f"[s{idx}]")
if not labels:
    subprocess.run(["cp", silent, final], check=True); sys.exit()
# normalize=0 keeps authored gains; the VO is the loudness reference
fc = ";".join(chains) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{dur}[a]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-t", f"{dur}", final], check=True)
print("mixed", len(labels), "audio tracks →", final)
