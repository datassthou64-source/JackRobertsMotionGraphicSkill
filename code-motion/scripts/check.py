#!/usr/bin/env python3
"""Gates for a code-motion project.  check.py <project>   (exit 1 on any FAIL)

Static: no 3D, no Math.random/Date/performance.now (frames must be pure functions of f),
no CSS transitions, no opacity-based scene handoffs, no rAF/timers.
Timeline (read from the page via render.mjs --meta): beats 18–110 frames, contiguous, the
last beat ends at plan.json "end" (the CTA cut). Audio: VO exists, every SFX file exists,
gains 0.02–0.05, first cue before 5s.
"""
import json, re, subprocess, sys
from pathlib import Path

P = Path(sys.argv[1]).resolve()
SKILL = Path(__file__).resolve().parent.parent
src = (P / "index.html").read_text()
fails, warns = [], []
code = re.sub(r"/\*.*?\*/|//[^\n]*", "", src, flags=re.S)

for pat, why in [
    (r"perspective|rotate[XY]\(|rotate3d|translateZ|translate3d|preserve-3d", "3D transform (Tyler: no 3D look, ever)"),
    (r"Math\.random", "Math.random — use CM.rng(seed)"),
    (r"Date\.now|new Date\(|performance\.now", "wall-clock time — frames must depend only on f"),
    (r"requestAnimationFrame|setTimeout|setInterval", "timers/rAF — the renderer seeks, nothing may tick on its own"),
    (r"transition\s*:", "CSS transition — animate from f in render()"),
    (r"(back|elastic|bounce)\w*\(", "overshoot easing — settle, never bounce"),
]:
    if re.search(pat, code):
        fails.append(why)

meta = json.loads(subprocess.run(["node", str(SKILL / "engine/render.mjs"), str(P), "--meta"],
                                 capture_output=True, text=True).stdout or "{}")
plan = json.loads((P / "plan.json").read_text())
sc = meta.get("scenes", [])
if not sc:
    fails.append("page did not load / no scenes (run render.mjs --meta to see the error)")
for i, (sid, a, b) in enumerate(sc):
    n = b - a
    if n < 18 or n > 110:
        (fails if n < 12 or n > 130 else warns).append(f"{sid}: {n} frames (18–110 — split or merge)")
    if i and a > sc[i - 1][2]:
        fails.append(f"gap before {sid}: frames {sc[i-1][2]}–{a} show nothing")
if sc and max(s[2] for s in sc) != plan["end"]:
    fails.append(f"last beat ends at {max(s[2] for s in sc)}, plan.json end (CTA cut) is {plan['end']}")
ramps = [s for s in re.findall(r"ramp:\s*(\{[^}]*\})", src)]
if len(ramps) < len(sc):
    warns.append(f"{len(sc) - len(ramps)} beat(s) use the default ramp — vary the property beat to beat")

if plan.get("vo") and not (P / plan["vo"]).exists():
    fails.append(f"VO missing: {plan['vo']}")
cues = plan.get("sfx", [])
if not cues:
    fails.append("no SFX — a reel with no SFX is a fail")
for c in cues:
    if not (P / c["file"]).exists():
        fails.append(f"SFX missing: {c['file']}")
    if not .02 <= c["gain"] <= .05:
        fails.append(f"SFX gain {c['gain']} at f{c['f']} outside 0.02–0.05")
    if re.search(r"chime|ping|sparkle|notification|glitch|impact|premium", c["file"]):
        fails.append(f"banned cue {c['file']} — dry clicks/whooshes only")
if cues and min(c["f"] for c in cues) > 150:
    fails.append("first SFX cue after 5s")
if sc:
    rate = len(cues) / (plan["end"] / 30)
    if rate > 1.2:
        warns.append(f"{rate:.2f} cues/s — dense; aim 0.35–0.9")

for w in warns: print("WARN ", w)
for f in fails: print("FAIL ", f)
print(f"{len(sc)} beats, {len(cues)} cues — " + ("PASS" if not fails else f"{len(fails)} FAIL"))
sys.exit(1 if fails else 0)
