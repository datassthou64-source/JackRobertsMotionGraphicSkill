import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, SERIF, UI, clamp01, mix, settle, tw} from '../../kit';

/** The reel's condensed italic serif (Bodoni MT Condensed on this machine, Didot fallback). */
export const DISPLAY = '"Bodoni MT", Didot, ' + SERIF;

export const GRADS = {
  coral: 'linear-gradient(180deg, #d9776a 0%, #e9a293 55%, #f6d7cf 100%)',
  ink: 'linear-gradient(180deg, #141413 0%, #3a3a3a 55%, #9a9a9a 100%)',
  inkSolid: 'linear-gradient(180deg, #141413 0%, #141413 100%)',
  white: 'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #d8d8d8 100%)',
};

/**
 * Italic serif headline, word-by-word mask rise. `at` = start frame, `gap` = frames between words.
 * Static design text (the item name, the ordinal) — not a caption track.
 */
export const SerifLine: React.FC<{
  text: string;
  f: number;
  at?: number;
  gap?: number;
  size?: number;
  grad?: keyof typeof GRADS;
  squeeze?: number;
}> = ({text, f, at = 0, gap = 3, size = 120, grad = 'ink', squeeze = 0.9}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      gap: size * 0.22,
      fontFamily: DISPLAY,
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.05,
      letterSpacing: -size * 0.02,
      transform: `scaleX(${squeeze})`,
      textTransform: 'uppercase',
    }}
  >
    {text.split(' ').map((w, i) => {
      const t = tw(f, at + i * gap, 16);
      return (
        <div key={i} style={{overflow: 'hidden', paddingBottom: size * 0.1, paddingRight: size * 0.08}}>
          <div
            style={{
              transform: `translateY(${mix(size * 1.1, 0, t)}px)`,
              opacity: clamp01(t * 1.6),
              backgroundImage: GRADS[grad],
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {w}
          </div>
        </div>
      );
    })}
  </div>
);

/** plain ground; `push` scales the whole scene (use for the slow 5s push-in) */
export const Flat: React.FC<{bg: string; push?: number; children: React.ReactNode}> = ({bg, push = 1, children}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden', fontFamily: UI, color: C.ink}}>
    <AbsoluteFill style={{transform: `scale(${push})`}}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
/** default template length: 5 s at 30 fps */
export const LEN = 150;

/** full-bleed blurred copy of an image — the "screen floats over itself" ground */
export const BlurGround: React.FC<{src: string; dim?: number; blur?: number; scale?: number}> = ({src, dim = 0.35, blur = 28, scale = 1.25}) => (
  <AbsoluteFill>
    <Img
      src={staticFile(src)}
      style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px)`, transform: `scale(${scale})`}}
    />
    <AbsoluteFill style={{background: `rgba(10,12,16,${dim})`}} />
  </AbsoluteFill>
);

/** progress of a stroke draw: returns dash props for an SVG path with pathLength=1 */
export const draw = (t: number): React.SVGProps<SVGPathElement> => ({
  pathLength: 1,
  strokeDasharray: '1 1',
  strokeDashoffset: 1 - clamp01(t),
});

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export {settle};
