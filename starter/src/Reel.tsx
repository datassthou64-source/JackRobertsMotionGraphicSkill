import React from 'react';
import {AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BEATS, REEL_FRAMES, SFX} from './plan';

/**
 * The clean timeline. plan.ts owns BEATS / SFX / REEL_FRAMES. Captions are added downstream.
 * Every beat boundary is a hard cut; the beat's speed ramp (kit `Beat`) carries the motion and
 * RampBlur gives that opening move camera motion blur. No fades anywhere.
 */

/** frames of motion blur at the start of every beat — covers the fast part of the ramp */
export const RAMP_BLUR_FRAMES = 14;
/** renders averaged per blurred frame; 12 is the speed/quality balance, 20 for a final master */
const BLUR_SAMPLES = 12;
/** exposure in frames (0.8 ≈ a 288° shutter) */
const BLUR_SHUTTER = 0.8;

/**
 * Camera motion blur: a running average of BLUR_SAMPLES renders across the shutter, trailing
 * the frame. Normal blending (sample k at opacity 1/(k+1)) keeps static pixels exact — the
 * plus-lighter sum in @remotion/motion-blur bands the ground gradient. Samples before frame 0
 * show the start pose (every tween clamps), so the blur holds through the cut itself.
 */
export const RampBlur: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  if (f >= RAMP_BLUR_FRAMES) return <>{children}</>;
  return (
    <AbsoluteFill>
      {Array.from({length: BLUR_SAMPLES}).map((_, i) => (
        <AbsoluteFill key={i} style={{opacity: 1 / (i + 1)}}>
          <Freeze frame={f - (BLUR_SHUTTER * i) / (BLUR_SAMPLES - 1)}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{vo?: boolean}> = ({vo = true}) => (
  <AbsoluteFill style={{background: '#f6f7f7'}}>
    {BEATS.map(([B, from, to]) => (
      <Sequence key={from} from={from} durationInFrames={to - from} layout="none">
        <RampBlur>
          <B len={to - from} />
        </RampBlur>
      </Sequence>
    ))}
    {vo ? <Audio src={staticFile('audio/vo.mp3')} endAt={REEL_FRAMES} /> : null}
    {SFX.map(([file, at, gain], i) => (
      <Sequence key={`s${i}`} from={at} layout="none">
        <Audio src={staticFile(`sfx/${file}.mp3`)} volume={gain} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
