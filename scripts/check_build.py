#!/usr/bin/env python3
"""Static gates for a Jack Remotion build. Run before every render.

    check_build.py <project>

Checks (each prints PASS / WARN / FAIL):
  1. tsc --noEmit
  2. no 3D: perspective / rotateX / rotateY / rotateZ / translateZ / preserve-3d   (the user: "I hate the 3d look")
  3. no Math.random / Date.now / setTimeout / requestAnimationFrame / CSS animation  (render must be deterministic)
  4. no overshoot easing (back / elastic / bounce)
  5. BEATS: ascending, 2-frame overlaps, none < 18 or > 110 frames, last ends at REEL_FRAMES
  6. SFX: first cue < 150 frames, opening 10s has a lift (riser/whoosh) + two tactile landings,
     no disallowed tonal/cinematic roles, gains within 0.02–0.06, files exist
  7. transcript.json non-empty and public/audio/vo.mp3 exists; VO not shorter than REEL_FRAMES
  8. no frame-edge chrome strings (step tabs, footers) — heuristic
  9. no fade / crossfade / wipe transitions — every transition is a hard cut + speed ramp
 10. Clawd rule: every beat whose words mention Claude / Anthropic puts a <Mascot> (or an
     OrangeScene) on screen; opt out per beat only with a `no-clawd: <reason>` comment
"""
import json
import os
import re
import subprocess
import sys

BAD_3D = re.compile(r"perspective\s*[:(]|rotate[XYZ]\s*\(|translateZ\s*\(|preserve-3d|rotate3d|translate3d")
BAD_RUNTIME = re.compile(r"Math\.random|Date\.now|setTimeout|setInterval|requestAnimationFrame|@keyframes|animation\s*:|transition\s*:")
BAD_EASE = re.compile(r"Easing\.(back|elastic|bounce)|back\.out|elastic|bounce")
CHROME = re.compile(r"(0[1-9]\s*/\s*[A-Z]{3,}|STEP \d|script \d+|@jack|jackroberts)", re.I)
BAD_FADE = re.compile(r"@remotion/transitions/(fade|wipe|slide|flip|clock-wipe|iris)|\bfade(In|Out)?\s*\(|crossfade|TransitionSeries")
CLAUDE_WORD = re.compile(r"^(claude|claude's|claudes|anthropic|anthropic's|clawd)$", re.I)
BAD_SFX_ROLE = re.compile(r"bell|ding|chime|ping|glass|sparkle|notification|coin|arcade|glitch|impact|bass|boom|braam|error", re.I)

status = 0


def rep(level, msg):
    global status
    print(f"{level:5} {msg}")
    if level == "FAIL":
        status = 1


def main():
    proj = sys.argv[1] if len(sys.argv) > 1 else "."
    src = os.path.join(proj, "src")
    files = [os.path.join(dp, f) for dp, _, fs in os.walk(src) for f in fs if f.endswith((".ts", ".tsx"))]

    r = subprocess.run(["npx", "tsc", "--noEmit"], cwd=proj, text=True, capture_output=True)
    rep("PASS" if r.returncode == 0 else "FAIL", "tsc --noEmit" + ("" if r.returncode == 0 else "\n" + r.stdout[-2000:]))

    for pat, label, level in ((BAD_3D, "3D transform", "FAIL"), (BAD_RUNTIME, "non-deterministic / CSS animation", "FAIL"), (BAD_EASE, "overshoot easing", "FAIL"), (BAD_FADE, "fade/wipe transition (hard cut + speed ramp only)", "FAIL"), (CHROME, "possible frame-edge chrome", "WARN")):
        hits = []
        for fp in files:
            for i, ln in enumerate(open(fp), 1):
                code = ln.split("//")[0]
                if code.lstrip().startswith(("*", "/*")):
                    continue  # comments
                if pat.search(code):
                    hits.append(f"{os.path.relpath(fp, proj)}:{i}: {ln.strip()[:90]}")
        rep("PASS" if not hits else level, f"{label}: {len(hits)} hit(s)" + ("\n      " + "\n      ".join(hits[:12]) if hits else ""))

    plan = open(os.path.join(src, "plan.ts")).read()
    total = int(re.search(r"REEL_FRAMES = (\d+)", plan).group(1))
    beats = re.findall(r"\[\s*(\w+),\s*(\d+),\s*(\d+|REEL_FRAMES)\s*\]", plan)
    beats = [(n, int(s), total if e == "REEL_FRAMES" else int(e)) for n, s, e in beats]
    problems = []
    for i, (n, s, e) in enumerate(beats):
        d = e - s
        if d < 18:
            problems.append(f"{n}: {d} frames (<18, under 0.6s)")
        if d > 110:
            problems.append(f"{n}: {d} frames (>110, 3.7s+ on one idea — split it)")
        if i + 1 < len(beats):
            ns = beats[i + 1][1]
            if ns < s:
                problems.append(f"{n}: not ascending")
            if e - ns != 2:
                problems.append(f"{n}: overlap into next is {e - ns}, expected 2")
    if beats and beats[-1][2] != total:
        problems.append(f"last beat ends {beats[-1][2]} ≠ REEL_FRAMES {total}")
    if beats and beats[0][1] != 0:
        problems.append("first beat does not start at 0")
    rep("PASS" if not problems else "FAIL", f"BEATS: {len(beats)} beats over {total} frames ({total/30:.1f}s, mean {total/30/max(1,len(beats)):.2f}s/beat)" + ("\n      " + "\n      ".join(problems) if problems else ""))

    sfx = re.findall(r"\['([\w-]+)',\s*(\d+),\s*([\d.]+)\]", plan.split("export const SFX")[1] if "export const SFX" in plan else "")
    sp = []
    if not sfx:
        sp.append("no SFX at all — a reel with no sound effects is a fail")
    else:
        first = min(int(a) for _, a, _ in sfx)
        if first > 150:
            sp.append(f"first cue at frame {first} (>5s)")
        opening = [(name, int(frame)) for name, frame, _ in sfx if int(frame) < min(total, 300)]
        # A generated riser, or with the bundled local cues (default since 2026-09-24) a
        # whoosh / sweep / swipe, counts as the opening lift.
        opening_risers = [(name, frame) for name, frame in opening if re.search(r"riser|whoosh|sweep|swipe", name)]
        opening_landings = [(name, frame) for name, frame in opening if re.search(r"click|haptic|press", name)]
        if not opening_risers:
            sp.append("first 10s has no lift (riser, or a whoosh/sweep with local cues)")
        if len(opening_landings) < 2:
            sp.append(f"first 10s has {len(opening_landings)} tactile landing(s), expected at least 2")
        dens = len(sfx) / (total / 30)
        if dens > 1.0:
            print(f"WARN  SFX density {dens:.2f}/s (>1.0/s; check for over-designed or repetitive cues)")
        for f_, a, g in sfx:
            g = float(g)
            if BAD_SFX_ROLE.search(f_):
                sp.append(f"{f_}@{a}: disallowed tonal/cinematic SFX role")
            if not 0.02 <= g <= 0.06:
                sp.append(f"{f_}@{a}: gain {g} outside 0.02–0.06")
            if not os.path.exists(os.path.join(proj, "public", "sfx", f_ + ".mp3")):
                sp.append(f"{f_}@{a}: public/sfx/{f_}.mp3 missing")
            if int(a) >= total:
                sp.append(f"{f_}@{a}: after REEL_FRAMES")
    rep("PASS" if not sp else "FAIL", f"SFX: {len(sfx)} cues" + ("\n      " + "\n      ".join(sp) if sp else ""))

    tp = os.path.join(src, "transcript.json")
    words = json.load(open(tp)) if os.path.exists(tp) else []
    vo = os.path.join(proj, "public", "audio", "vo.mp3")
    tprob = []
    if not words:
        tprob.append("transcript.json is empty — word timing and beat alignment cannot be verified")
    if not os.path.exists(vo):
        tprob.append("public/audio/vo.mp3 missing")
    else:
        d = float(json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", vo], text=True, capture_output=True).stdout)["format"]["duration"])
        if d * 30 < total - 1:
            tprob.append(f"VO is {d:.2f}s but REEL_FRAMES is {total/30:.2f}s")
        if words and words[-1]["end"] * 30 < total - 60:
            tprob.append(f"last transcript word ends at {words[-1]['end']:.2f}s, composition runs to {total/30:.2f}s — CTA cut set?")
    # Clawd rule — Claude on the VO means Clawd on screen
    srcs = {fp: open(fp).read() for fp in files}
    def body(name):
        for txt in srcs.values():
            m = re.search(r"export const " + re.escape(name) + r"\b", txt)
            if m:
                nxt = txt.find("\nexport const ", m.end())
                return txt[m.start(): nxt if nxt > 0 else len(txt)]
        return ""
    claude_frames = [round(w["start"] * 30) for w in words if CLAUDE_WORD.match(w["text"].strip(".,!?:;\"'").lower())]
    missing = []
    for n, s_, e_ in beats:
        said = [fr for fr in claude_frames if s_ <= fr < e_]
        b = body(n)
        if said and not re.search(r"<Mascot\b|<OrangeScene\b|no-clawd:", b):
            missing.append(f"{n} (Claude said at frame {said[0]}) has no <Mascot> — cast a Clawd or add `// no-clawd: <reason>`")
    rep("PASS" if not missing else "FAIL", f"Clawd rule: {len(claude_frames)} Claude mention(s)" + ("\n      " + "\n      ".join(missing) if missing else ""))

    rep("PASS" if not tprob else "FAIL", "VO + transcript" + ("\n      " + "\n      ".join(tprob) if tprob else ""))

    print("\nnext: stills at every beat's first+last frame, then contact_sheet.py, then render.")
    sys.exit(status)


if __name__ == "__main__":
    main()
