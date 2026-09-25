#!/usr/bin/env python3
"""Word-level transcript for a Jack VO, in the shape captions.ts expects.

    transcribe.py <audio> [-o src/transcript.json] [--model small.en] [--cta "comment"]

Uses faster-whisper (ctranslate2, installs in seconds — never openai-whisper/torch) in a
persistent venv at ~/.cache/jack-remotion/wx. No API keys exist on this machine.

Output: JSON list of {text, start, end}. Also prints every word with its start FRAME so
the beat plan can be written straight off the console, and flags the CTA sentence
("comment X and I'll send you Y") — the composition must end BEFORE that word.
"""
import argparse
import json
import os
import subprocess
import sys

VENV = os.path.expanduser("~/.cache/jack-remotion/wx")
PY = os.path.join(VENV, "bin", "python")


def ensure_venv():
    if os.path.exists(PY):
        return
    os.makedirs(os.path.dirname(VENV), exist_ok=True)
    subprocess.run([sys.executable, "-m", "venv", VENV], check=True)
    subprocess.run([os.path.join(VENV, "bin", "pip"), "install", "-q", "faster-whisper"], check=True)


WORKER = r'''
import json, sys
from faster_whisper import WhisperModel
path, model_name = sys.argv[1], sys.argv[2]
m = WhisperModel(model_name, device="cpu", compute_type="int8")
segs, info = m.transcribe(path, word_timestamps=True, beam_size=5)
out = []
for s in segs:
    for w in s.words or []:
        out.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
print(json.dumps({"duration": info.duration, "words": out}))
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("-o", "--out", default=None)
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--cta", default="comment", help="first word of the facecam CTA sentence")
    a = ap.parse_args()

    if os.environ.get("VIRTUAL_ENV") is None or not os.path.exists(PY):
        ensure_venv()
    res = subprocess.run([PY, "-c", WORKER, a.audio, a.model], check=True, text=True, capture_output=True)
    data = json.loads(res.stdout.strip().splitlines()[-1])
    words = data["words"]

    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.audio)), "transcript.json")
    with open(out, "w") as f:
        json.dump(words, f, indent=1)

    print(f"{len(words)} words, VO {data['duration']:.2f}s -> {out}\n")
    print(f"{'frame':>6}  {'start':>6}  word")
    cta_at = None
    claude = 0
    for w in words:
        fr = round(w["start"] * 30)
        flag = ""
        if w["text"].lower().strip(".,!?:;'\"") in ("claude", "claude's", "anthropic", "anthropic's", "cloud"):
            claude += 1
            flag = "   <-- Claude: this beat gets a Clawd <Mascot> (fix 'Cloud' in FIXES if Whisper misheard)"
        if cta_at is None and w["text"].lower().strip(".,!?") == a.cta.lower():
            cta_at = fr
            flag = "   <-- CTA starts: end the composition before this frame"
        print(f"{fr:>6}  {w['start']:>6.2f}  {w['text']}{flag}")
    if claude:
        print(f"\n{claude} Claude mention(s): every beat covering one casts a Clawd mascot (references/mascots.md).")
    if cta_at is not None:
        print(f"\nCTA word '{a.cta}' at frame {cta_at}. REEL_FRAMES = {cta_at - 4} is the usual cut (ends on the last pre-CTA word, ~4 frames of air).")
    else:
        print(f"\nno '{a.cta}' found — set REEL_FRAMES to the VO length ({round(data['duration']*30)}) or find the CTA by hand.")


if __name__ == "__main__":
    main()
