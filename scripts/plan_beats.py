#!/usr/bin/env python3
"""Turn a beat plan (plan.tsv) into src/plan.ts BEATS + src/beats/index.tsx stubs.

    plan_beats.py <project> [--tsv plan.tsv] [--end FRAME] [--write]

plan.tsv — tab-separated, one beat per line, `#` comments allowed:

    id      start   device      phrase                                  sfx
    01      0       AppIcon     GPT-6 Astra                             click-soft
    02      38      SiteMock    can now build beautiful websites        whoosh
    03      94      NotifStack  that clients actually want to buy       pop

  start   frame the beat's FIRST WORD begins (from transcribe.py's frame column)
  device  a kit/devices name, a `Footage`/`Cap` for sourced media, or `custom`
  phrase  the spoken words the beat carries (goes into the header comment)
  sfx     optional cue basename from public/sfx; lands on the beat start

End of each beat = next beat's start + 2 (the handoff overlap). Last beat ends at --end
(default: REEL_FRAMES already in plan.ts).

Without --write it prints what it would generate. With --write it rewrites the BEATS
table and the SFX table in src/plan.ts and APPENDS stub components for any id that does
not yet exist in src/beats/index.tsx. Existing beats are never touched.
"""
import argparse
import os
import re
import sys


def read_plan(path):
    rows = []
    with open(path) as f:
        for ln in f:
            ln = ln.rstrip("\n")
            if not ln.strip() or ln.lstrip().startswith("#"):
                continue
            parts = ln.split("\t")
            if len(parts) < 4:
                sys.exit(f"bad line (need id, start, device, phrase): {ln!r}")
            if parts[0].lower() == "id":
                continue
            rows.append({
                "id": parts[0].strip(),
                "start": int(parts[1]),
                "device": parts[2].strip(),
                "phrase": parts[3].strip(),
                "sfx": parts[4].strip() if len(parts) > 4 and parts[4].strip() else None,
            })
    rows.sort(key=lambda r: r["start"])
    return rows


def comp_name(r):
    slug = re.sub(r"[^A-Za-z0-9]+", " ", r["phrase"]).title().replace(" ", "")[:14] or "Beat"
    return f"B{r['id']}{slug}"


GAIN = {"whoosh": 0.028, "whoosh-short": 0.026, "click": 0.03, "click-soft": 0.028}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--tsv", default=None)
    ap.add_argument("--end", type=int, default=None)
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    tsv = a.tsv or os.path.join(a.project, "plan.tsv")
    plan_ts = os.path.join(a.project, "src", "plan.ts")
    beats_tsx = os.path.join(a.project, "src", "beats", "index.tsx")
    rows = read_plan(tsv)
    src = open(plan_ts).read()
    m = re.search(r"export const REEL_FRAMES = (\d+);", src)
    end = a.end or (int(m.group(1)) if m else None)
    if end is None:
        sys.exit("no --end and no REEL_FRAMES in plan.ts")

    names = [comp_name(r) for r in rows]
    lines = []
    for i, r in enumerate(rows):
        stop = rows[i + 1]["start"] + 2 if i + 1 < len(rows) else end
        stop_s = "REEL_FRAMES" if i + 1 == len(rows) else str(stop)
        dur = (stop if i + 1 < len(rows) else end) - r["start"]
        warn = "  // !! <18 frames" if dur < 18 else ("  // !! >110 frames — split it?" if dur > 110 else "")
        lines.append(f"  [{names[i]}, {r['start']}, {stop_s}], // {r['phrase']}{warn}")
    beats_block = "export const BEATS: [React.FC<{len: number}>, number, number][] = [\n" + "\n".join(lines) + "\n];"

    sfx_lines = [f"  ['{r['sfx']}', {r['start']}, {GAIN.get(r['sfx'], 0.03)}]," for r in rows if r["sfx"]]
    sfx_block = "export const SFX: [string, number, number][] = [\n" + "\n".join(sfx_lines) + "\n];"

    existing = open(beats_tsx).read() if os.path.exists(beats_tsx) else ""
    stubs = []
    for r, n in zip(rows, names):
        if re.search(rf"export const {n}\b", existing):
            continue
        stubs.append(f'''
/* {r['id']} ─ "{r['phrase']}" ─ {r['device']}: <describe the ONE visible action> */
export const {n}: React.FC<BeatProps> = ({{len}}) => {{
  const f = useCurrentFrame();
  const t = tw(f, 0, 10);
  return (
    <Beat len={{len}}>
      <Abs x={{540}} y={{HERO_Y}}>
        <div style={{rise(t)}}>{{/* {r['device']} goes here */}}</div>
      </Abs>
    </Beat>
  );
}};
''')

    imp = "import {" + ", ".join(names) + "} from './beats';"
    print(imp + "\n\n" + beats_block + "\n\n" + sfx_block)
    print(f"\n{len(stubs)} new stub(s) for src/beats/index.tsx")

    if not a.write:
        print("\n(dry run — add --write to apply)")
        return

    src = re.sub(r"import \{[^}]*\} from './beats';", imp, src, count=1)
    src = re.sub(r"export const BEATS: \[React\.FC<\{len: number\}>, number, number\]\[\] = \[.*?\n\];", beats_block, src, flags=re.S)
    if sfx_lines:
        src = re.sub(r"export const SFX: \[string, number, number\]\[\] = \[.*?\n\];", sfx_block, src, flags=re.S)
    open(plan_ts, "w").write(src)

    if stubs:
        if not existing:
            existing = ("import React from 'react';\nimport {useCurrentFrame} from 'remotion';\n"
                        "import {Abs, Beat, HERO_Y, rise, tw} from '../kit';\n\ntype BeatProps = {len: number};\n")
        elif "HERO_Y" not in existing:
            existing = existing.replace("from '../kit';", "from '../kit';\nimport {HERO_Y} from '../kit';", 1)
        open(beats_tsx, "w").write(existing.rstrip("\n") + "\n" + "".join(stubs))
    print("written. Now: replace every stub body, delete demo beats no longer in BEATS, npx tsc --noEmit.")


if __name__ == "__main__":
    main()
