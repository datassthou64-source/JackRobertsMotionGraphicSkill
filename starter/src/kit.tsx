import {ShineBorder} from './devices/shine-border';
import React from 'react';
import {Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';

/**
 * Jack Roberts — Trial house style, in Remotion.
 * Lifted from the approved trial-reel intros (Script-3 V3 / SPLIT V5 / S7) and the
 * first full-length build (higgsfield-astra-trialstyle, 2026-09-17).
 *
 *   ground   light radial  #fff → #f6f7f7 → #e9eaea
 *   objects  white cards, 2px hairline, long soft drop shadow, REAL marks
 *   captions never baked; heroes clear 1180–1295 for the user's downstream caption track
 *   motion   settle (power4.out) in, inOut for moves, accel out. No bounce, no 3D, no flash.
 *
 * Everything here is frame-driven: `useCurrentFrame()` in, numbers out. No timers, no
 * randomness (use `rnd`), no CSS animations, no `requestAnimationFrame`.
 */

/* ------------------------------------------------------------------ easing */

export const settle = Easing.bezier(0.16, 1, 0.3, 1); // power4.out — every entrance
export const inOut = Easing.bezier(0.65, 0, 0.35, 1); // power2.inOut — cursor travel, counters, pushes
export const accel = Easing.bezier(0.65, 0, 0.84, 0); // power2.in — exits

/** 0→1 over `over` frames starting at `from`, clamped, eased. The one tween helper. */
export const tw = (f: number, from: number, over: number, easing = settle) =>
  interpolate(f, [from, from + over], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * "Transition speed ramp" — measured from the orange Clawd template.
 * Frame 0 is a hard cut at peak velocity; power4-out sheds speed quickly, then glides to
 * rest over ~1.2s. Use the progress for whichever 2D property expresses the scene best.
 */
export const TRANSITION_SPEED_RAMP_FRAMES = 36;
export const transitionSpeedRamp = (f: number, from = 0, over = TRANSITION_SPEED_RAMP_FRAMES) => tw(f, from, over, settle);

export type TransitionSpeedRampMotion = {
  x?: readonly [number, number];
  y?: readonly [number, number];
  scale?: readonly [number, number];
  rotate?: readonly [number, number];
  opacity?: readonly [number, number];
  origin?: React.CSSProperties['transformOrigin'];
};

/** Convenience wrapper for a speed-ramped 2D transform. Wrap an existing centred/translated element. */
export const transitionSpeedRampStyle = (
  f: number,
  motion: TransitionSpeedRampMotion,
  from = 0,
  over = TRANSITION_SPEED_RAMP_FRAMES,
): React.CSSProperties => {
  const t = transitionSpeedRamp(f, from, over);
  const transforms: string[] = [];
  if (motion.x || motion.y) transforms.push(`translate(${mix(motion.x?.[0] ?? 0, motion.x?.[1] ?? 0, t)}px, ${mix(motion.y?.[0] ?? 0, motion.y?.[1] ?? 0, t)}px)`);
  if (motion.rotate) transforms.push(`rotate(${mix(motion.rotate[0], motion.rotate[1], t)}deg)`);
  if (motion.scale) transforms.push(`scale(${mix(motion.scale[0], motion.scale[1], t)})`);
  return {
    ...(motion.opacity ? {opacity: mix(motion.opacity[0], motion.opacity[1], t)} : {}),
    ...(transforms.length ? {transform: transforms.join(' ')} : {}),
    ...(motion.origin ? {transformOrigin: motion.origin} : {}),
  };
};
/** typewriter: the first round(t·len) characters */
export const typed = (s: string, t: number) => s.slice(0, Math.round(clamp01(t) * s.length));
/** deterministic pseudo-random in [0,1) — a render must be reproducible frame for frame */
export const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** entrance style: opacity + rise + tiny scale, from a 0→1 t */
export const rise = (t: number, px = 40): React.CSSProperties => ({
  opacity: t,
  transform: `translateY(${mix(px, 0, t)}px) scale(${mix(0.96, 1, t)})`,
});
/** pop style for chips / tiles */
export const pop = (t: number): React.CSSProperties => ({opacity: t, transform: `scale(${mix(0.7, 1, t)})`});

/* ------------------------------------------------------------------ tokens */

export const UI = '-apple-system, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const MONO = '"SF Mono", Menlo, "JetBrains Mono", monospace';
export const SERIF = 'Georgia, "Times New Roman", serif';

export const C = {
  ink: '#141413',
  sub: '#59636e',
  muted: '#8a8a8a', // lightest ink allowed on the light ground, ≥26px only
  hair: '#d9dde1',
  line: '#e3e5e8',
  soft: '#f6f8fa',
  coral: '#d97757', // house accent (also Claude's spark — never recolour a brand)
  blue: '#0969da',
  green: '#1f883d',
  red: '#D22A18',
  amber: '#f6a218',
  dark0: '#0d1117',
  dark1: '#161b22',
  darkBorder: '#30363d',
  darkText: '#e6edf3',
  darkMuted: '#8d96a0',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;
/** reserved for the user's downstream caption track — nothing settled may sit inside it */
export const CAPTION_BAND = {top: 1180, bottom: 1295};
/** optical centre for a single hero object */
export const HERO_Y = 640;

/* ------------------------------------------------------------------ ground */

export const Ground: React.FC<{dots?: boolean; dark?: boolean}> = ({dots, dark}) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: dark
          ? 'radial-gradient(85% 75% at 50% 42%, #1a1f27 0%, #12161c 55%, #0b0e13 100%)'
          : 'radial-gradient(85% 75% at 50% 42%, #ffffff 0%, #f6f7f7 55%, #e9eaea 100%)',
      }}
    />
    {dots ? (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          backgroundImage: `radial-gradient(${dark ? 'rgba(255,255,255,0.14)' : 'rgba(31,35,40,0.16)'} 2px, transparent 2.5px)`,
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(60% 45% at 50% 38%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(60% 45% at 50% 38%, black 0%, transparent 100%)',
        }}
      />
    ) : null}
  </>
);

/* ----------------------------------------------------------- beat wrapper */

/**
 * One beat = one idea. Every transition is a HARD CUT + TRANSITION SPEED RAMP (Tyler,
 * 2026-09-26): frame 0 is the cut, the content is already moving at peak speed and
 * settles (power4.out) — no fade, no crossfade, no wipe, no opacity ramp, in or out.
 * The ground is not ramped, so the cut reads clean; only the content moves.
 *
 * `ramp` picks the dominant 2D move (vary it beat to beat: scale-down reveal, x/y arrival,
 * small reframe, ≤8° rotate). Default = scale 1.08 → 1. `ramp={false}` when the beat's
 * device runs its own speed ramp (e.g. OrangeScene). Reel.tsx adds camera motion blur over
 * the first RAMP_BLUR_FRAMES of every beat. `first`/`last` are accepted for old beats and
 * do nothing — there is no fade to skip. `dark` earns a dark ground only when the artwork is
 * dark or a run of same-device beats needs breaking up (≤20%).
 */
export const Beat: React.FC<{
  len: number;
  children: React.ReactNode;
  dots?: boolean;
  dark?: boolean;
  first?: boolean;
  last?: boolean;
  ramp?: TransitionSpeedRampMotion | false;
}> = ({len, children, dots, dark, ramp = {scale: [1.08, 1]}}) => {
  const f = useCurrentFrame();
  const over = Math.min(TRANSITION_SPEED_RAMP_FRAMES, Math.max(12, len - 8));
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <Ground dots={dots} dark={dark} />
      {ramp ? <div style={{position: 'absolute', inset: 0, ...transitionSpeedRampStyle(f, ramp, 0, over)}}>{children}</div> : children}
    </div>
  );
};

/** absolute placement, centred on (x, y) by default */
export const Abs: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; center?: boolean}> = ({
  x,
  y,
  children,
  style,
  center = true,
}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: center ? 'translate(-50%, -50%)' : undefined, ...style}}>{children}</div>
);

/* --------------------------------------------------------------- apparatus */

export const cardShadow = '0 40px 80px -30px rgba(31,35,40,0.24), 0 4px 10px rgba(31,35,40,0.06)';
export const darkShadow = '0 50px 90px -30px rgba(8,10,14,0.55), 0 10px 24px rgba(8,10,14,0.2)';

export const Card: React.FC<{w: number; h?: number; r?: number; dark?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({
  w,
  h,
  r = 34,
  dark,
  style,
  children,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: dark ? '#0f1319' : '#ffffff',
      border: `2px solid ${dark ? '#2a303a' : C.line}`,
      boxShadow: dark ? darkShadow : cardShadow,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: UI,
      ...style,
    }}
  >
    {children}
  </div>
);

/** macOS window. `url` draws a browser address pill instead of a title. */
export const Win: React.FC<{
  w: number;
  h?: number;
  dark?: boolean;
  title?: string;
  url?: string;
  bar?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({w, h, dark, title, url, bar = 72, style, children}) => (
  <Card w={w} h={h} r={28} dark={dark} style={style}>
    <div
      style={{
        height: bar,
        display: 'flex',
        alignItems: 'center',
        padding: '0 26px',
        gap: 12,
        background: dark ? '#161b22' : '#f6f8fa',
        borderBottom: `2px solid ${dark ? '#232933' : C.line}`,
        position: 'relative',
      }}
    >
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
        {url ? (
          <div
            style={{
              padding: '8px 28px',
              borderRadius: 999,
              background: dark ? '#0d1117' : '#ffffff',
              border: `2px solid ${dark ? '#2a303a' : C.line}`,
              fontSize: 25,
              color: dark ? C.darkMuted : C.sub,
              fontWeight: 500,
            }}
          >
            {url}
          </div>
        ) : (
          <div style={{fontSize: 28, fontWeight: 600, color: dark ? C.darkMuted : C.sub}}>{title}</div>
        )}
      </div>
    </div>
    <div style={{position: 'relative', height: h ? h - bar - 4 : undefined, overflow: 'hidden'}}>{children}</div>
  </Card>
);

/** an actor, not a device — add one whenever a tool DOES something to a UI */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number; size?: number}> = ({x, y, press = 0, opacity = 1, size = 64}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      transform: `scale(${1 - 0.14 * press})`,
      transformOrigin: '0 0',
      filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.28))',
      zIndex: 50,
    }}
  >
    <path d="M4 2.5 L4 19 L8.3 15 L11 21.3 L13.8 20.1 L11.2 14 L17 14 Z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/** cursor travel between two points, symmetric ease */
export const path = (f: number, from: number, over: number, a: [number, number], b: [number, number]) => {
  const t = tw(f, from, over, inOut);
  return [mix(a[0], b[0], t), mix(a[1], b[1], t)] as const;
};
/** a click: 0→1→0 over six frames starting at `at` */
export const pressAt = (f: number, at: number) => interpolate(f, [at, at + 2, at + 6], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** expanding ring — a click landing, a connection made */
export const Ring: React.FC<{x: number; y: number; t: number; r: number; color: string; width?: number}> = ({x, y, t, r, color, width = 6}) =>
  t <= 0 || t >= 1 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        border: `${width}px solid ${color}`,
        opacity: (1 - t) * 0.9,
        transform: `scale(${mix(0.3, 1, t)})`,
      }}
    />
  );

/** soft radial glow behind a hero — the only "atmosphere" the system allows */
export const Glow: React.FC<{x: number; y: number; r: number; color: string; o: number}> = ({x, y, r, color, o}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      opacity: o,
      background: `radial-gradient(closest-side, ${color} 0%, transparent 100%)`,
    }}
  />
);

/** A pill label that lives inside the apparatus (UI chip) — never frame chrome. */
export const Pill: React.FC<{children: React.ReactNode; size?: number; bg?: string; fg?: string; border?: string; style?: React.CSSProperties}> = ({
  children,
  size = 34,
  bg = '#ffffff',
  fg = C.ink,
  border = C.line,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.4,
      padding: `${size * 0.36}px ${size * 0.7}px`,
      borderRadius: 999,
      background: bg,
      color: fg,
      border: `2px solid ${border}`,
      boxShadow: '0 14px 30px -12px rgba(31,35,40,0.25)',
      fontFamily: UI,
      fontSize: size,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      letterSpacing: '-0.01em',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------- marks */

/** a real mark from public/logos — never a hand-drawn stand-in, never recoloured */
export const Logo: React.FC<{file: string; size: number; style?: React.CSSProperties}> = ({file, size, style}) => (
  <Img src={staticFile(`logos/${file}`)} style={{width: size, height: size, display: 'block', objectFit: 'contain', ...style}} />
);

/** App-icon squircle holding a real mark. `bg` = the brand's own tile colour. */
export const AppIcon: React.FC<{file: string; size: number; bg?: string; pad?: number; style?: React.CSSProperties}> = ({
  file,
  size,
  bg = '#ffffff',
  pad = 0.2,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.23,
      background: bg,
      border: bg === '#ffffff' ? `2px solid ${C.line}` : 'none',
      boxShadow: '0 30px 60px -24px rgba(31,35,40,0.35), 0 4px 10px rgba(31,35,40,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...style,
    }}
  >
    <Logo file={file} size={size * (1 - pad * 2)} />
  </div>
);

/** a full-bleed raster app icon (a PNG that already IS the tile) */
export const RasterIcon: React.FC<{file: string; size: number; style?: React.CSSProperties}> = ({file, size, style}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.23, overflow: 'hidden', boxShadow: '0 30px 60px -24px rgba(31,35,40,0.35)', ...style}}>
    <Img src={staticFile(`logos/${file}`)} style={{width: size, height: size, display: 'block'}} />
  </div>
);

/* ------------------------------------------------------------------ footage */

/** Sourced footage (public/clips/<clip>.mp4) inside a rounded frame; `from` seconds in, `rate` retimes. */
export const Footage: React.FC<{
  clip: string;
  w: number;
  h: number;
  r?: number;
  from?: number;
  rate?: number;
  zoom?: number;
  ox?: number;
  oy?: number;
  pos?: string;
  style?: React.CSSProperties;
}> = ({clip, w, h, r = 30, from = 0, rate = 1, zoom = 1, ox = 0, oy = 0, pos = 'center', style}) => (
  <div style={{width: w, height: h, borderRadius: r, overflow: 'hidden', position: 'relative', background: '#000', boxShadow: cardShadow, ...style}}>
    <OffthreadVideo
      src={staticFile(`clips/${clip}.mp4`)}
      muted
      startFrom={Math.round(from * FPS)}
      playbackRate={rate}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: pos,
        transform: `translate(${ox}px, ${oy}px) scale(${zoom})`,
      }}
    />
  </div>
);

/** A screenshot (public/caps/<file>.png, or any public path containing "/") in a rounded frame. */
export const Cap: React.FC<{file: string; w: number; h?: number; r?: number; style?: React.CSSProperties; imgStyle?: React.CSSProperties}> = ({
  file,
  w,
  h,
  r = 22,
  style,
  imgStyle,
}) => (
  <div style={{width: w, height: h, borderRadius: r, overflow: 'hidden', boxShadow: cardShadow, background: '#111', ...style}}>
    <Img
      src={staticFile(file.includes('/') ? `${file}.png` : `caps/${file}.png`)}
      style={{width: '100%', height: h ? '100%' : undefined, objectFit: 'cover', display: 'block', ...imgStyle}}
    />
  </div>
);

/* -------------------------------------------------------------- micro marks */

export const Check: React.FC<{size: number; color?: string; t?: number}> = ({size, color = C.green, t = 1}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <circle cx="12" cy="12" r="11" fill={color} opacity={t} />
    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="16" strokeDashoffset={16 * (1 - t)} />
  </svg>
);

export const Sparkle: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.coral, style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', ...style}}>
    <path d="M12 1.5c.6 4.9 2.6 8.6 10.5 10.5-7.9 1.9-9.9 5.6-10.5 10.5C11.4 17.6 9.4 13.9 1.5 12 9.4 10.1 11.4 6.4 12 1.5z" fill={color} />
  </svg>
);

/* ------------------------------------------------------- b-roll frame */
/* ------------------------------------------------------- b-roll frame */

/** House b-roll: blurred backdrop, sharp card, approved animated Shine Border. */
export const BROLL = {w: 936, h: 526, r: 28, cy: 850};

/** `rate` = playbackRate for both layers (e.g. 1.5 to fit a long source move into a short beat). */
export const Broll: React.FC<{clip: string; f: number; len: number; from?: number; pos?: string; zoom?: number; rate?: number; cy?: number}> = ({clip, f, len, from = 0, pos = 'center', zoom = 1, rate = 1, cy = BROLL.cy}) => {
  const {w, h, r} = BROLL;
  const x = 540 - w / 2;
  const y = cy - h / 2;
  const bg = tw(f, 0, 8);
  const card = tw(f, 0, 10);
  const push = 1 + 0.06 * tw(f, 0, len, inOut);
  return (
    <>
      <OffthreadVideo
        src={staticFile(`clips/${clip}-bg.mp4`)}
        muted
        startFrom={Math.round(from * FPS)}
        playbackRate={rate}
        style={{position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover', opacity: bg}}
      />
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', background: '#0B0F14', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', opacity: card, transform: `scale(${mix(0.94, 1, card)})`}}>
        <OffthreadVideo
          src={staticFile(`clips/${clip}.mp4`)}
          muted
          startFrom={Math.round(from * FPS)}
          playbackRate={rate}
          style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${push * zoom})`}}
        />
        <ShineBorder f={f} duration={3} borderWidth={5} />
      </div>

    </>
  );
};
