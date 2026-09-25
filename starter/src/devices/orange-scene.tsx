import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {mix, transitionSpeedRamp} from '../kit';
import {FEET, Mascot, MascotKind} from '../mascots';

/**
 * "Orange scene" — the beige Clawd-on-terminal beat, measured off
 * Shorts/20260911/AME/posted/SKILLS - IG copy.mp4 frames 29–85 (0.967s–2.833s).
 *
 * What the source does, per frame (see references/orange-scene-template.md in the skill):
 *   - hard cut in, hard cut out (no fade, no wipe);
 *   - flat beige ground #e1d8ca, no gradient, no dots;
 *   - ONE group: pixel Clawd (any Mascot kind, laptop by default) standing on a
 *     real Claude Code terminal (macOS chrome, real scrolling session), x-centred;
 *   - the whole group SCALES 1.00 → 0.87 about a pivot ~130px BELOW the terminal's bottom
 *     edge, so it shrinks and settles downward. Nothing pans.
 *   - speed ramp: peak velocity on the cut frame, power4-out decay, at rest by ~frame 36.
 *
 * Group box at scale 1 is 956×819: mascot strip rows 0–262, terminal rows 256–819
 * (mascot feet tuck behind the title bar).
 */
export const ORANGE = {
  bg: '#e1d8ca',
  groupW: 956,
  groupH: 819,
  termTop: 256,
  termH: 563,
  termR: 14,
  scaleFrom: 1.0,
  scaleTo: 0.87,
  /** pivot, measured from the group's top edge (source: 1135 − 185) */
  pivotY: 950,
  /** frames from the cut until the scale is at rest */
  ramp: 36,
  /** clip length: the source beat is 57 frames */
  frames: 57,
  shadow: '0 26px 60px rgba(40,30,20,0.28), 0 4px 12px rgba(40,30,20,0.10)',
};

/** scale at frame f: fastest on the cut, eases to rest — the ramp the user asked for */
export const orangeScale = (f: number) => mix(ORANGE.scaleFrom, ORANGE.scaleTo, transitionSpeedRamp(f, 0, ORANGE.ramp));

/**
 * `cx`  group centre x (source: 539)
 * `cy`  SETTLED group centre y — the group ends up centred here once the ramp is done
 *       (source: 676; the 2026-09-20 render uses 815 = "lower and more centred")
 */
/**
 * `mascot`  any MascotKind from ./mascots (the original detective Clawd is retired —
 *           Tyler, 2026-09-25); it stands on the terminal at `mascotH` px (group units) with their feet on
 *           the title bar.
 */
export const OrangeScene: React.FC<{cx?: number; cy?: number; clip?: string; mascot?: MascotKind; mascotH?: number; mascotX?: number}> = ({
  cx = 540,
  cy = 815,
  clip = 'clips/claude-code-session.mp4',
  mascot = 'laptop',
  mascotH = 240,
  mascotX = 470,
}) => {
  const f = useCurrentFrame();
  const {groupW, groupH, termTop, termH, termR, pivotY, scaleTo, frames} = ORANGE;
  const s = orangeScale(f);
  // settled centre = pivot − scaleTo·(pivotY − groupH/2)  ⇒  pivot from the requested cy
  const pivotAbs = cy + scaleTo * (pivotY - groupH / 2);
  const top = pivotAbs - pivotY;
  const left = cx - groupW / 2;
  return (
    <AbsoluteFill style={{background: ORANGE.bg}}>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: groupW,
          height: groupH,
          transformOrigin: `${groupW / 2}px ${pivotY}px`,
          transform: `scale(${s})`,
        }}
      >
        {/* mascot stands on the title bar */}
        <div style={{position: 'absolute', left: mascotX, top: termTop + 6 - mascotH * FEET[mascot], transform: 'translateX(-50%)'}}>
          <Mascot kind={mascot} f={f} h={mascotH} />
        </div>
        {/* terminal — real Claude Code session, chrome included, stabilised to 956×563 */}
        <div style={{position: 'absolute', left: 0, top: termTop, width: groupW, height: termH, borderRadius: termR, overflow: 'hidden', background: '#111', boxShadow: ORANGE.shadow}}>
          <OffthreadVideo src={staticFile(clip)} muted style={{position: 'absolute', left: 0, top: 0, width: groupW, height: termH + 1, display: 'block'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The scene on its own: frame 0 IS the cut (no lead-in — Tyler, 2026-09-20). */
export const OrangeDemo: React.FC<{mascot?: MascotKind}> = ({mascot = 'laptop'}) => (
  <AbsoluteFill style={{background: ORANGE.bg}}>
    <Sequence from={0} durationInFrames={ORANGE.frames} layout="none">
      <OrangeScene mascot={mascot} />
      <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.03} />
    </Sequence>
  </AbsoluteFill>
);
