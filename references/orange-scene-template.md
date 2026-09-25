# Orange scene — Clawd on a terminal, scale-settle in (template)

Measured 2026-09-20 off `Shorts/20260911/AME/posted/SKILLS - IG copy.mp4`, frames 29–85
(0.967s–2.833s), one frame at a time. Code: `starter/src/devices/orange-scene.tsx`
(`OrangeScene`, `ORANGE`, `orangeScale`). Assets ship in the starter: the Clawd sprites in
`public/mascots/` (laptop by default — the original detective Clawd is retired, the user 2026-09-25), the stabilised 956×563 terminal clip in
`public/clips/claude-code-session.mp4`. Rendered example + project:
`remotion-projects/orange-scene-template-20260920/` (comps `OrangeScene`, `…Laptop`,
`…Gym`, `MascotSheet`).

The measured easing is also saved as the general-purpose **transition speed ramp** in
`references/transition-speed-ramp.md` and `starter/src/kit.tsx`; use that primitive when the
same feel belongs on position, rotation, or another scene transform instead of scale.

**Frame 0 is the cut.** No lead-in, no fade (Tyler, 2026-09-20).

## What the source does

| | |
|---|---|
| Transition in / out | **hard cut** both ways. No fade, no wipe, no push. |
| Ground | flat beige `#e1d8ca` (225,216,202). No gradient, no dots. |
| Object | ONE group, x-centred (cx 539): pixel Clawd (any `<Mascot>` kind; the source used a detective, now retired) standing on a real Claude Code terminal (macOS chrome, real scrolling session). Feet tuck behind the title bar. |
| Group box @ scale 1 | 956 × 819 — mascot strip rows 0–262, terminal rows 256–819 (956 × 563). |
| Motion | the whole group **scales 1.00 → 0.87** about a pivot 950px below the group top (≈130px under the terminal's bottom edge). Nothing pans; it shrinks and settles *downward*. |
| Source timing | frames 0–2 hold, peak ≈ 0.014 scale/frame at frames 6–9, at rest by frame 34. |
| Template timing | **peak velocity on the cut frame, power4-out (`settle`) decay over 36 frames** — the user's ask: fastest at the cut, slow ramp down. |
| Mascot | 3 poses: glass raised (f0–4) → swings down (f5–16) → pressed to the eye, squinting (f17+). Shipped as one PNG per frame so it plays exactly as shot. |
| Terminal | real footage. Stabilised by cropping each source frame at its measured scale and resizing back to 956×563, so the clip is static and the composition owns the scale. |
| Caption | grey pill, Arial 800, centred y≈1118 in this cut (the user's own track). Not part of the template. |
| Settled position | source: group centre y 676 (top 331, terminal bottom 1021). **the user wants it lower and more centred** → template default `cy = 815` (top ≈ 468, bottom ≈ 1171, still clear of the 1180–1295 caption band). `cy` is the one knob. |

## Per-0.2s of the source (scale, mascot pose, terminal content)

| t | frame | scale | mascot | terminal |
|---|---|---|---|---|
| 0.97 | 29 | 1.000 | glass up | `/context` picker menu |
| 1.17 | 35 | 0.979 | glass swinging | same |
| 1.37 | 41 | 0.921 | glass at eye | `> /context` typed, "Recalculating…" |
| 1.57 | 47 | 0.891 | at eye | tool list scrolling |
| 1.77 | 53 | 0.881 | at eye | skills / custom agents list |
| 1.97 | 59 | 0.874 | at eye | MCP tool list |
| 2.17 | 65 | 0.870 | at eye (rest) | context usage grid |
| 2.37 | 71 | 0.870 | at eye | git commit output |
| 2.57 | 77 | 0.870 | at eye | "Any other items needing fixed?" |
| 2.77 | 83 | 0.870 | at eye | high-priority list |

## Use it

```tsx
import {OrangeScene, ORANGE} from './devices/orange-scene';
<Sequence from={cut} durationInFrames={ORANGE.frames} layout="none">
  <OrangeScene cy={815} />                 // cy = settled group centre; cx defaults to 540
  <OrangeScene mascot="laptop" />          // any kind from references/mascots.md stands on the title bar
  <OrangeScene mascot="gym" mascotH={260} mascotX={470} />
</Sequence>
```

Swap `clip` for another stabilised terminal recording (956×563, chrome included) to reuse
the move on a different session. One whoosh at 0.03 on the cut.
