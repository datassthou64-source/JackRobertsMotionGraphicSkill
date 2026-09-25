/**
 * Reusable templates ported from the motion language of reel Ddjfv-WP9yo (2026-09-25).
 * Props-driven: swap the logos / screens / numbers, keep the motion.
 * No captions, no headline text, no tool names — the user's editor adds text downstream.
 * Images and marks are always real files from public/ — never drawn in code.
 */
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AppIcon, C, Logo, MONO, UI, Win, clamp01, inOut, mix, tw, typed} from '../../kit';
import {BlurGround, DISPLAY, Flat, LEN, draw, fmt} from './shared';
import {Easing} from 'remotion';

/** strong ease-in-out (expo) — long, soft starts and stops */
const EXPO = Easing.bezier(0.87, 0, 0.13, 1);

/* ================================================================ NumberedFanIn
 * Hero mark in the middle, numbers 1..N land on an arc with arrows pointing at it,
 * an install bar fills under it. "These 5 free plugins…" */
export type NumberedFanInProps = {hero: string; count?: number; barLabel?: string; bg?: string; len?: number};
export const NumberedFanIn: React.FC<NumberedFanInProps> = ({hero, count = 5, barLabel = 'INSTALLING', bg = '#e6ddcc', len = LEN}) => {
  const f = useCurrentFrame();
  const push = mix(1, 1.06, tw(f, 24, len - 24, inOut)); // fast intro, then a slow push to the cut
  const cx = 540;
  const cy = 800;
  const oy = cy + 60; // logo centre — the arc and every arrow aim here
  const heroT = tw(f, 0, 10);
  const bar = tw(f, 4, 24, inOut);
  // hero motion: spins in, keeps turning slowly, and kicks each time an arrow lands
  const spin = mix(-140, 0, heroT) + f * 1.6;
  const hit = (at: number) => interpolate(f, [at, at + 3, at + 9], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + 0.07 * Array.from({length: count}).reduce<number>((m, _, i) => Math.max(m, hit(13 + i * 3)), 0) + 0.05 * hit(28);
  const ang = (i: number) => ((-58 + (116 * i) / Math.max(1, count - 1)) * Math.PI) / 180;
  return (
    <Flat bg={bg} push={push}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: count}).map((_, i) => {
          const a = ang(i);
          const x1 = cx + Math.sin(a) * 340;
          const y1 = oy - Math.cos(a) * 340;
          const x2 = cx + Math.sin(a) * 190;
          const y2 = oy - Math.cos(a) * 190;
          const t = tw(f, 5 + i * 3, 8, inOut);
          const d = Math.atan2(y2 - y1, x2 - x1);
          const hx = mix(x1, x2, t);
          const hy = mix(y1, y2, t);
          return (
            <g key={i} stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none">
              <path d={`M${x1} ${y1} L${x2} ${y2}`} {...draw(t)} />
              {t > 0.95 ? (
                <path d={`M${hx - 24 * Math.cos(d - 0.45)} ${hy - 24 * Math.sin(d - 0.45)} L${hx} ${hy} L${hx - 24 * Math.cos(d + 0.45)} ${hy - 24 * Math.sin(d + 0.45)}`} />
              ) : null}
            </g>
          );
        })}
      </svg>
      {Array.from({length: count}).map((_, i) => {
        const a = ang(i);
        const t = tw(f, 3 + i * 3, 9);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx + Math.sin(a) * 405 - 60,
              top: oy - Math.cos(a) * 405 - 70 + mix(30, 0, t),
              width: 120,
              textAlign: 'center',
              fontFamily: DISPLAY,
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 110,
              color: '#c25e4c',
              opacity: t,
            }}
          >
            {i + 1}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx - 150, top: cy - 90, transform: `rotate(${spin}deg) scale(${mix(0.6, 1, heroT) * pulse})`, opacity: heroT}}>
        <Logo file={hero} size={300} />
      </div>
      <div style={{position: 'absolute', left: 250, top: cy + 290, width: 580, opacity: tw(f, 4, 8)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 26, color: '#8c7f6c', letterSpacing: 2}}>
          <span>{barLabel}</span>
          <span>{Math.round(bar * 100)}%</span>
        </div>
        <div style={{marginTop: 12, height: 10, borderRadius: 5, background: 'rgba(20,20,19,0.08)'}}>
          <div style={{width: `${bar * 100}%`, height: 10, borderRadius: 5, background: '#d9776a'}} />
        </div>
      </div>
    </Flat>
  );
};

/* ================================================================ ScreenFocus
 * A real screenshot floats over a blurred copy of itself, an accent box draws around
 * the part that matters, then the card pushes in on it. */
export type ScreenFocusProps = {
  src: string; // public path, e.g. stills/foo.jpg
  imgW: number;
  imgH: number;
  focus: {x: number; y: number; w: number; h: number}; // in image pixels
  accent?: string;
  zoom?: number;
  len?: number;
};
export const ScreenFocus: React.FC<ScreenFocusProps> = ({src, imgW, imgH, focus, accent = '#f5b301', zoom = 1.08, len = LEN}) => {
  const f = useCurrentFrame();
  const cardW = 720;
  const k = cardW / imgW;
  const cardH = imgH * k;
  const inT = tw(f, 0, 18);
  const boxT = tw(f, 12, 18, inOut);
  const push = tw(f, 28, len - 40, inOut); // push-in runs through the whole beat
  const fx = (focus.x + focus.w / 2) * k - cardW / 2;
  const fy = (focus.y + focus.h / 2) * k - cardH / 2;
  const z = mix(1, zoom, push);
  const pad = 14;
  const bw = focus.w * k + pad * 2;
  const bh = focus.h * k + pad * 2;
  const per = 2 * (bw + bh);
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <BlurGround src={src} dim={0.25} />
      <div
        style={{
          position: 'absolute',
          left: 540 - cardW / 2,
          top: 960 - cardH / 2,
          width: cardW,
          height: cardH,
          transform: `translate(${-fx * z * push}px, ${-fy * z * push}px) scale(${z * mix(0.92, 1, inT)})`,
          opacity: inT,
        }}
      >
        <Img src={staticFile(src)} style={{width: cardW, height: cardH, borderRadius: 26, boxShadow: '0 50px 90px -30px rgba(0,0,0,0.55)'}} />
        <svg width={bw + 12} height={bh + 12} style={{position: 'absolute', left: focus.x * k - pad - 6, top: focus.y * k - pad - 6, overflow: 'visible'}}>
          <rect x={6} y={6} width={bw} height={bh} rx={22} fill="none" stroke={accent} strokeWidth={7 / z} strokeDasharray={per} strokeDashoffset={per * (1 - boxT)} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================ TerminalCounter
 * Narrow agent terminal: prompt types, agent starts, a library scan counts up with a
 * progress bar, then a result line lands. */
export type TerminalCounterProps = {prompt: string; scanLabel: string; countTo: number; result: string; title?: string; len?: number};
export const TerminalCounter: React.FC<TerminalCounterProps> = ({prompt, scanLabel, countTo, result, title = 'agent', len = LEN}) => {
  const f = useCurrentFrame();
  const inT = tw(f, 0, 16);
  const scanLen = Math.max(48, Math.round(len * 0.5));
  const scan = tw(f, 34, scanLen, inOut);
  const doneAt = 34 + scanLen + 4;
  const line = (at: number) => ({opacity: tw(f, at, 8), transform: `translateY(${mix(14, 0, tw(f, at, 10))}px)`});
  const w = 720;
  const drift = tw(f, 0, len, inOut); // slow push-in across the whole beat
  return (
    <Flat bg="#ffffff">
      <div style={{position: 'absolute', left: 540 - w / 2, top: 410, opacity: inT, transform: `translateY(${mix(40, 0, inT)}px) scale(${mix(0.94, 1.08, drift)})`}}>
        <Win w={w} h={470} dark title={title} bar={60}>
          <div style={{padding: '30px 34px', fontFamily: MONO, fontSize: 27, color: C.darkText, lineHeight: 1.7}}>
            <div style={{minHeight: 92}}>
              <span style={{color: '#d9776a'}}>$ </span>
              {typed(prompt, tw(f, 4, 22, inOut))}
              {f < 30 && Math.floor(f / 8) % 2 === 0 ? <span style={{background: C.darkText}}>&nbsp;</span> : null}
            </div>
            <div style={{...line(28), color: C.darkMuted}}>⎿ Starting agent…</div>
            <div style={{...line(34), display: 'flex', justifyContent: 'space-between'}}>
              <span>
                <span style={{color: '#d9776a'}}>◆ </span>
                {scanLabel}
              </span>
              <span style={{color: C.darkMuted}}>{fmt(countTo * scan)}</span>
            </div>
            <div style={{...line(34), marginTop: 6, height: 10, borderRadius: 5, background: '#232933'}}>
              <div style={{width: `${scan * 100}%`, height: 10, borderRadius: 5, background: '#d9776a'}} />
            </div>
            <div style={{...line(doneAt), marginTop: 14, color: '#3fb950'}}>✓ {result}</div>
          </div>
        </Win>
      </div>
    </Flat>
  );
};

/* ================================================================ FilesToDoc
 * N source logo tiles at the top, dashed connectors draw down and converge into one
 * output document whose lines fill in. "Turns any file into markdown." No text. */
export type FilesToDocProps = {sources: {logo: string; color: string}[]; lines?: number[]; len?: number};
export const FilesToDoc: React.FC<FilesToDocProps> = ({sources, lines = [0.45, 0, 0.6, 0.7, 0.55, 0, 0.85, 0.8], len = LEN}) => {
  const f = useCurrentFrame();
  const push = mix(1, 1.05, tw(f, 50, len - 50, inOut));
  const n = sources.length;
  const tile = 170;
  const span = 1080 - 120;
  const cx = (i: number) => 60 + (span / n) * (i + 0.5);
  const tileY = 260;
  const docTop = 690;
  const docT = tw(f, 26, 22, EXPO);
  const lift = mix(560, 0, tw(f, 10, 44, EXPO));
  return (
    <Flat bg="#ffffff" push={push}>
      <AbsoluteFill style={{transform: `translateY(${lift}px)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {sources.map((s, i) => {
          const x = cx(i);
          const d = `M${x} ${tileY + tile} C${x} ${tileY + tile + 150}, 540 ${docTop - 170}, 540 ${docTop}`;
          const t = tw(f, 8 + i * 4, 30, EXPO);
          return (
            <g key={i}>
              <mask id={`m${i}`}>
                <path d={d} stroke="#fff" strokeWidth={14} fill="none" {...draw(t)} />
              </mask>
              <path d={d} stroke={s.color} strokeWidth={6} fill="none" strokeDasharray="14 11" mask={`url(#m${i})`} />
            </g>
          );
        })}
      </svg>
      {sources.map((s, i) => {
        const t = tw(f, i * 4, 20, EXPO);
        return (
          <div key={i} style={{position: 'absolute', left: cx(i) - tile / 2, top: tileY + mix(30, 0, t), opacity: t, transform: `scale(${mix(0.85, 1, t)})`}}>
            <AppIcon file={s.logo} size={tile} pad={0.2} />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 540 - 230,
          top: docTop + mix(30, 0, docT),
          width: 460,
          height: 420,
          borderRadius: 22,
          border: `2px solid ${C.hair}`,
          background: '#fff',
          boxShadow: '0 30px 60px -30px rgba(31,35,40,0.35)',
          opacity: docT,
          padding: '34px 36px',
        }}
      >
        {lines.map((w, i) => (
          <div key={i} style={{height: 40, display: 'flex', alignItems: 'center'}}>
            <div style={{height: 14, borderRadius: 7, width: `${w * 100 * tw(f, 40 + i * 4, 16, EXPO)}%`, background: i === 0 ? C.ink : '#d5d9de'}} />
          </div>
        ))}
      </div>
      </AbsoluteFill>
    </Flat>
  );
};

/* ================================================================ TableScroll
 * A dark reference table scrolls up over a blurred ground and an accent frame
 * lands on the row that matters. "Covers the entire dev cycle." */
export type TableScrollProps = {
  headers: [string, string, string];
  rows: [string, string, string][];
  focusRow: number;
  accent?: string;
  ground?: string;
  len?: number;
};
export const TableScroll: React.FC<TableScrollProps> = ({headers, rows, focusRow, accent = '#f5b301', ground, len = LEN}) => {
  const f = useCurrentFrame();
  const rowH = 150;
  const inT = tw(f, 0, 16);
  const scrollLen = Math.round(len * 0.45);
  const scroll = tw(f, 8, scrollLen, inOut);
  const push = mix(1, 1.05, tw(f, 8 + scrollLen, len - 8 - scrollLen, inOut));
  const maxScroll = Math.max(0, focusRow * rowH - rowH);
  const box = tw(f, 8 + scrollLen - 6, 16, inOut);
  const per = 2 * (770 + rowH);
  return (
    <AbsoluteFill style={{background: '#eef0f2'}}>
      {ground ? <BlurGround src={ground} dim={0.05} blur={34} /> : null}
      <div
        style={{
          position: 'absolute',
          left: 130,
          top: 960 - 320,
          width: 820,
          height: 640,
          borderRadius: 30,
          background: '#0f1319',
          boxShadow: '0 50px 90px -30px rgba(8,10,14,0.55)',
          overflow: 'hidden',
          opacity: inT,
          transform: `translateY(${mix(40, 0, inT)}px) scale(${push})`,
          fontFamily: UI,
        }}
      >
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.3fr', padding: '26px 30px', color: C.darkText, fontWeight: 700, fontSize: 24, borderBottom: '2px solid #232933', background: '#0f1319', position: 'relative', zIndex: 2}}>
          {headers.map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>
        <div style={{transform: `translateY(${-maxScroll * scroll}px)`, position: 'relative'}}>
          {rows.map((r, i) => (
            <div key={i} style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.3fr', gap: 20, padding: '0 30px', height: rowH, alignItems: 'center', borderBottom: '2px solid #1c222b', fontSize: 22, color: C.darkText, lineHeight: 1.35}}>
              <div style={{color: '#58a6ff', textDecoration: 'underline'}}>{r[0]}</div>
              <div>{r[1]}</div>
              <div style={{color: C.darkMuted}}>{r[2]}</div>
            </div>
          ))}
          <svg width={790} height={rowH + 12} style={{position: 'absolute', left: 15, top: focusRow * rowH - 6}}>
            <rect x={5} y={5} width={780} height={rowH + 2} rx={20} fill="none" stroke={accent} strokeWidth={7} strokeDasharray={per} strokeDashoffset={per * (1 - box)} />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
