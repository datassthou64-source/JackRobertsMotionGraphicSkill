# Transition speed ramp — fast cut, long settle

**This is the transition for every beat, always** (Tyler, 2026-09-26): a hard cut, then a speed
ramp. Fades, crossfades, wipes, slides and opacity handoffs are retired — `check_build.py`
fails on them. It is built into the kit: `<Beat ramp={…}>` ramps the content (default
scale 1.08 → 1 over min(36, len−8) frames) and `Reel.tsx` wraps every beat in `RampBlur`
(14 frames of camera motion blur on the fast part). Vary the `ramp` property from beat to
beat so twelve cuts do not all feel the same. Use `ramp={false}` only when the beat's device
runs its own ramp (OrangeScene) or the beat hand-applies one below.

It is the motion signature measured from the orange Clawd template on 2026-09-20.

## Signature

- **Hard cut at frame 0**: the element is already visible and already moving. Do not add a
  lead-in, fade, wipe, or delayed spring.
- **Peak velocity immediately**, then a `power4.out` / `settle` decay.
- **36 frames by default** at 30fps (about 1.2s): most distance is covered early; the last
  portion glides gently into rest. A scene may use 30–42 frames when its duration demands it.
- **No overshoot or bounce.** One continuous 2D move, fully settled before the scene ends.
- Add one restrained whoosh on the cut, normally 0.028–0.03.

The orange template uses scale `1.00 → 0.87` around a low pivot. That is only one
application. Choose the property that makes the scene read best:

| Scene relationship | Good ramp |
|---|---|
| reveal the whole apparatus | scale down into its final composition, often `1.08–1.18 → 1` |
| object arrives from an edge | x or y position into place |
| reframe attention | small position + scale combination |
| dial, card, badge, or physical token turns into place | subtle 2D rotation, usually ≤ 8° |
| real screen/footage takes over | scale or crop-position reframe; keep UI legible |

Do not apply every property just because the helper supports them. One dominant movement is
usually cleaner. Opacity is opt-in and should normally stay unchanged so frame 0 remains a
true hard cut.

## API

```tsx
import {
  transitionSpeedRamp,
  transitionSpeedRampStyle,
  mix,
} from './kit';

// Raw progress: use it for any numeric property.
const t = transitionSpeedRamp(f);          // 0 → 1 over 36 frames
const x = mix(-260, 0, t);
const cropX = mix(18, 50, t);

// Convenience wrapper: put it around an element whose own transform must stay intact.
<div style={transitionSpeedRampStyle(f, {x: [-260, 0], scale: [1.08, 1]})}>
  <Device />
</div>

// Rotation-only landing.
<div style={transitionSpeedRampStyle(f, {rotate: [-7, 0], origin: '50% 80%'})}>
  <Badge />
</div>
```

`transitionSpeedRampStyle()` owns its wrapper's `transform`. If a device already uses
`transform` for centring or internal animation, nest it inside the wrapper instead of
merging the styles. Use `from` to start later and `over` only to adjust the 36-frame default.

## Source of truth

- Measured scene and visual notes: `references/orange-scene-template.md`
- Primitive: `starter/src/kit.tsx`
- Live use: `starter/src/devices/orange-scene.tsx` (`orangeScale`)
- Review build: the original review project (not bundled)
