import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {CLAWD_DATA, SetTimeline, SvgNode} from './clawd-data';

/**
 * Clawd mascot library — every Claude mascot animation we have, behind one component.
 *
 *   <Mascot kind="laptop" f={f} h={240} />
 *
 * Three engines, one API (all frame-driven, all deterministic):
 *   sprite   PNG-per-frame sequences (public/mascots/<kind>/fNN.png). Source: Tenor's
 *            transparent Clawd GIFs (laptop, football) via
 *            assets/mascots/fetch_tenor.py.
 *   set-svg  pixel-art SVG + a recorded list of timed `display`/`x`/`attr` sets (gym, flag,
 *            confetti). Replays the Codrops/ayotomcs GSAP frame-swaps without GSAP.
 *   gsap-svg the walking Claude: real tweens on body/legs/eyes, run through @remotion/gsap
 *            (paused timeline seeked to the frame — Remotion owns the clock).
 *
 * `h` is the rendered height in px; width follows the artwork's aspect. `f` is the beat's own
 * frame (relative to its Sequence). `speed` scales playback (1 = as authored). Everything
 * loops unless `loop={false}`.
 */

export type MascotKind = 'laptop' | 'football' | 'walk' | 'gym' | 'flag' | 'confetti';

/* ------------------------------------------------------------------ sprites */

/**
 * `mov` — optional ProRes 4444 (alpha) render of the same animation, e.g. from an AE roto pass.
 * When set it is used instead of the PNGs (`public/<mov>`), played via OffthreadVideo `transparent`.
 */
type SpriteSpec = {frames: number; fps: number; w: number; h: number; dir: string; pixelated?: boolean; mov?: string; durs?: number[]};
/** `durs` — per-frame hold in ms (a GIF's own timing); when set it overrides `fps`. */
export const SPRITES: Record<'laptop' | 'football', SpriteSpec> = {
  /** blinks, pulls out a laptop, turns 3/4 and types, packs it away — tenor.com …claw'd-crab-laptop-gif-14833619646318452398 (transparent) */
  laptop: {frames: 36, fps: 30, w: 449, h: 303, dir: 'mascots/laptop', durs: [390, 70, 90, 90, 170, 70, 170, 90, 90, 70, 90, 90, 90, 90, 90, 70, 90, 90, 90, 90, 70, 90, 90, 90, 90, 70, 90, 90, 80, 90, 70, 90, 180, 90, 70, 120]},
  /** kicks a football — tenor.com …claw'd-crab-football-gif-17523955505938523920 (transparent) */
  football: {frames: 49, fps: 30, w: 447, h: 302, dir: 'mascots/football', durs: [370, 170, 170, 90, 80, 80, 70, 80, 80, 90, 80, 80, 80, 90, 80, 90, 80, 90, 90, 80, 80, 70, 80, 90, 90, 80, 80, 80, 90, 90, 90, 70, 90, 80, 80, 80, 90, 80, 70, 90, 80, 90, 80, 90, 80, 90, 90, 60, 80]},
};

/** frame index at time `ms` for a variable-timing sprite */
const durIndex = (durs: number[], ms: number, loop: boolean) => {
  const total = durs.reduce((a, b) => a + b, 0);
  if (!loop && ms >= total) return durs.length - 1;
  let t = ms % total;
  for (let i = 0; i < durs.length; i++) {
    if (t < durs[i]) return i;
    t -= durs[i];
  }
  return durs.length - 1;
};

export const Sprite: React.FC<{kind: keyof typeof SPRITES; f: number; h: number; speed?: number; loop?: boolean; style?: React.CSSProperties}> = ({kind, f, h, speed = 1, loop = true, style}) => {
  const s = SPRITES[kind];
  const raw = Math.floor((Math.max(0, f) * speed * s.fps) / 30);
  const i = s.durs ? durIndex(s.durs, (Math.max(0, f) * speed * 1000) / 30, loop) : loop ? raw % s.frames : Math.min(s.frames - 1, raw);
  const w = (h * s.w) / s.h;
  if (s.mov) {
    // loop by hand: OffthreadVideo has no `loop`, so restart the clip every `frames`
    const start = loop ? Math.floor((Math.max(0, f) * speed) / s.frames) * s.frames : 0;
    return (
      <Sequence from={start} layout="none">
        <OffthreadVideo src={staticFile(s.mov)} transparent muted playbackRate={speed} style={{width: w, height: h, display: 'block', ...style}} />
      </Sequence>
    );
  }
  return (
    <Img
      src={staticFile(`${s.dir}/f${String(i).padStart(2, '0')}.png`)}
      style={{width: w, height: h, display: 'block', imageRendering: s.pixelated ? 'pixelated' : undefined, ...style}}
    />
  );
};

/* ------------------------------------------------------ set-timeline SVG */

type State = Record<string, {display?: string; x?: number; y?: number; attr?: Record<string, string | number>}>;

/** replay every zero-duration set with pos ≤ t (GSAP semantics: later wins, loops restart clean) */
const evalTL = (tl: SetTimeline, T: number, st: State) => {
  if (T < tl.delay) return;
  let t = T - tl.delay;
  if (tl.repeat && Number.isFinite(tl.duration) && tl.duration > 0) t %= tl.duration;
  for (const o of tl.ops) {
    if (o.pos > t) continue;
    for (const k of o.targets) {
      const cur = st[k] ?? (st[k] = {});
      const v = o.vars as State[string];
      if (v.display !== undefined) cur.display = v.display;
      if (v.x !== undefined) cur.x = v.x;
      if (v.y !== undefined) cur.y = v.y;
      if (v.attr) cur.attr = {...cur.attr, ...v.attr};
    }
  }
  for (const c of tl.children) if (t >= c.pos) evalTL(c.tl, t - c.pos, st);
};

const Node: React.FC<{n: SvgNode; st: State}> = ({n, st}) => {
  const s = n.k ? st[n.k] : undefined;
  const props: Record<string, unknown> = {...n.props};
  if (s) {
    if (s.display !== undefined) props.display = s.display;
    if (s.attr) Object.assign(props, s.attr);
    if (s.x !== undefined || s.y !== undefined) props.transform = `${props.transform ?? ''} translate(${s.x ?? 0} ${s.y ?? 0})`.trim();
  }
  if (n.k) props['data-k'] = n.k;
  if (props.clipPath) {
    props['clip-path'] = props.clipPath;
    delete props.clipPath;
  }
  return React.createElement(n.tag, props, ...n.children.map((c, i) => <Node key={i} n={c} st={st} />));
};

const SetSvg: React.FC<{tree: SvgNode; timelines: SetTimeline[]; f: number; h: number; speed: number; style?: React.CSSProperties}> = ({tree, timelines, f, h, speed, style}) => {
  const T = (Math.max(0, f) / 30) * speed;
  const st: State = {};
  for (const tl of timelines) evalTL(tl, T, st);
  // the demo wraps some mascots in a div/section — find the svg
  const svg = tree.tag === 'svg' ? tree : (tree.children.find((c) => c.tag === 'svg') as SvgNode);
  const [, , vw, vh] = String(svg.props.viewBox).split(' ').map(Number);
  const w = (h * vw) / vh;
  return (
    <div style={{width: w, height: h, ...style}}>
      <Node n={{...svg, props: {...svg.props, width: w, height: h, overflow: 'visible'}}} st={st} />
    </div>
  );
};

/* ----------------------------------------------------------- walking Claude */

/**
 * The Codrops walking loop, ported tween for tween. Targets are the generated data-k ids:
 *   k0 eyes · k1 body · k2..k5 leg1..4 · k6 whole figure · k7 left hand · k8 right hand
 * `.call()`-based pivot swaps became positioned `.set()`s (the hook forbids callbacks).
 * `walk` = distance in SVG units the figure travels (55% walking, 45% in the jump).
 * `speed` is not supported here (the hook forbids timeScale) — wrap the beat in a Sequence with
 * a different fps if it must run faster.
 */
export const ClawdWalk: React.FC<{h: number; walk?: number; style?: React.CSSProperties}> = ({h, walk = 200, style}) => {
  const j = 0.55 * walk;
  const y = walk - j;
  const scope = useGsapTimeline<SVGSVGElement>(
    ({timeline: m, selector: $}) => {
      const eyes = $('[data-k=k0]');
      const body = $('[data-k=k1]');
      const legs = [$('[data-k=k2]'), $('[data-k=k3]'), $('[data-k=k4]'), $('[data-k=k5]')];
      const fig = $('[data-k=k6]');
      const hands = [$('[data-k=k7]'), $('[data-k=k8]')];
      const org = (yy: number) => ['16.5', '37.5', '69.5', '90.5'].map((x) => `${x} ${yy}`);
      legs.forEach((l, i) => m.set(l, {svgOrigin: org(86)[i]}, 0));
      m.to(eyes, {x: -3, duration: 0.4, ease: 'power2.out'})
        .to(body, {rotation: -3, x: -3, y: -5, svgOrigin: '53 65', duration: 0.4, ease: 'power2.out'}, '<')
        .to(legs, {rotation: (i: number) => [-7, -8, -8, -9][i], scaleY: (i: number) => [1.35, 1.3, 1.2, 1.15][i], duration: 0.4, ease: 'power2.out'}, '<')
        .to(eyes, {x: 4, y: 12, duration: 0.4, ease: 'power2.out', delay: 1.5})
        .to(body, {rotation: 3, x: 3, y: -5, svgOrigin: '53 65', duration: 0.4, ease: 'power2.out'}, '<')
        .to(legs, {rotation: (i: number) => [9, 8, 8, 7][i], scaleY: (i: number) => [1.15, 1.2, 1.3, 1.35][i], duration: 0.4, ease: 'power2.out'}, '<')
        .to(eyes, {x: 0, y: 23, duration: 0.2, ease: 'power2.out', delay: 1.2})
        .to(body, {rotation: 0, x: 0, y: 0, duration: 0.2, ease: 'power2.out'}, '<')
        .to(legs, {rotation: 0, scaleY: 1, duration: 0.2, ease: 'power2.out'}, '<')
        .to(fig, {y: -18, duration: 0.18, ease: 'power2.out'})
        .to(fig, {y: 0, duration: 0.15, ease: 'power3.in'});
      legs.forEach((l, i) => m.set(l, {svgOrigin: org(60)[i]}));
      m.addLabel('walk').to(fig, {x: j, duration: 2.2, ease: 'none'}, 'walk').to(eyes, {x: 4, y: 0, duration: 0.2, ease: 'power2.out'}, 'walk');
      for (let k = 0; k < 20; k++) {
        const pair = k % 2 === 0 ? [legs[0], legs[2]] : [legs[1], legs[3]];
        m.to(pair, {scaleY: 0.45, duration: 0.1, ease: 'power2.out'}, `walk+=${(k * 0.1).toFixed(1)}`).to(pair, {scaleY: 1, duration: 0.1, ease: 'power2.in'}, `walk+=${((k + 1) * 0.1).toFixed(1)}`);
      }
      m.to(legs, {scaleY: 1, duration: 0.08, ease: 'power2.in'}, 'walk+=2.1');
      legs.forEach((l, i) => m.set(l, {svgOrigin: org(86)[i]}));
      m.to(eyes, {y: 12, duration: 0.4, ease: 'power2.out', delay: 0.3})
        .to(body, {rotation: 3, x: 3, y: -5, svgOrigin: '53 65', duration: 0.4, ease: 'power2.out'}, '<')
        .to(legs, {rotation: (i: number) => [9, 8, 8, 7][i], scaleY: (i: number) => [1.15, 1.2, 1.3, 1.35][i], duration: 0.4, ease: 'power2.out'}, '<')
        .to(eyes, {y: 23, duration: 0.3, ease: 'power2.out', delay: 0.6})
        .to(eyes, {x: 4, y: 0, duration: 0.4, ease: 'power2.out', delay: 1})
        .to(body, {rotation: 0, x: 0, y: 0, duration: 0.4, ease: 'power2.out'}, '<')
        .to(legs, {rotation: 0, scaleY: 1, duration: 0.4, ease: 'power2.out'}, '<')
        .to(body, {y: 8, duration: 0.1, ease: 'power3.in', delay: 0.2})
        .to(hands, {y: 10, duration: 0.1, ease: 'power3.in'}, '<')
        .addLabel('jump')
        .to(fig, {x: `+=${y}`, duration: 0.85, ease: 'power1.inOut'}, 'jump')
        .to(fig, {y: -90, duration: 0.42, ease: 'sine.out'}, 'jump')
        .to(body, {y: 0, duration: 0.42, ease: 'sine.out'}, 'jump')
        .to(hands, {y: -12, duration: 0.42, ease: 'sine.out'}, 'jump')
        .to(fig, {y: 0, duration: 0.2, ease: 'power3.in'}, 'jump+=0.6')
        .to(hands, {y: 0, duration: 0.2, ease: 'power3.in'}, 'jump+=0.6')
        .to(hands, {y: 6, duration: 0.05, ease: 'power2.in'})
        .to(hands, {y: 0, duration: 0.08, ease: 'power2.out'})
        .set(fig, {x: 0}, '+=1')
        .set(eyes, {x: 0, y: 0}, '<');
      m.repeat(-1);
    },
    {dependencies: [walk]},
  );
  const tree = CLAWD_DATA.walk.tree;
  const w = (h * 107) / 86;
  return (
    <svg ref={scope} viewBox="0 0 107 86" width={w} height={h} fill="none" style={{overflow: 'visible', display: 'block', ...style}}>
      {tree.children.map((c, i) => (
        <Node key={i} n={c} st={{}} />
      ))}
    </svg>
  );
};

/* ------------------------------------------------------------------- facade */

export const Mascot: React.FC<{kind: MascotKind; f: number; h: number; speed?: number; loop?: boolean; walk?: number; style?: React.CSSProperties}> = ({kind, f, h, speed = 1, loop = true, walk, style}) => {
  switch (kind) {
    case 'laptop':
    case 'football':
      return <Sprite kind={kind} f={f} h={h} speed={speed} loop={loop} style={style} />;
    case 'gym':
      return <SetSvg tree={CLAWD_DATA.gym.tree} timelines={CLAWD_DATA.gym.timelines} f={f} h={h} speed={speed} style={style} />;
    case 'flag':
      return <SetSvg tree={CLAWD_DATA.flag.tree} timelines={CLAWD_DATA.flag.timelines} f={f} h={h} speed={speed} style={style} />;
    case 'confetti':
      return <SetSvg tree={CLAWD_DATA.confetti.tree} timelines={CLAWD_DATA.confetti.timelines} f={f} h={h} speed={speed} style={style} />;
    case 'walk':
      return <ClawdWalk h={h} walk={walk} style={style} />;
  }
};

/** where the feet are, as a fraction of `h` from the top — for standing something on a surface */
export const FEET: Record<MascotKind, number> = {laptop: 1, football: 1, walk: 1, gym: 0.94, flag: 0.94, confetti: 0.76};
