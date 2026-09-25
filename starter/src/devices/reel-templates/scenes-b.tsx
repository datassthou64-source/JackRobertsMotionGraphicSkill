/**
 * Templates ported from reel DdeVVlpT9zW (2026-09-25) — full-screen beats and the motion-graphic
 * half of its split-screen beats. No captions, no stat text, no tool names.
 * Every hero / logo slot takes a real file from public/logos — nothing is drawn in code.
 */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {AppIcon, C, Logo, MONO, UI, clamp01, inOut, mix, tw} from '../../kit';
import {Flat, LEN, draw} from './shared';

/* ================================================================ TokenStat
 * The "7 BILLION free AI tokens" beat without the text: a docs table (built from props)
 * scrolls inside a card whose rim carries a rotating light sweep; a blurred, dimmed copy
 * of the same table is the ground. */
export type TokenStatProps = {
  provider: string;
  note: string;
  baseUrl: string;
  headers: string[];
  rows: string[][];
  shine?: string; // sweep colour
  dim?: number; // 0..1 darkness over the ground
  len?: number;
};

const DocTable: React.FC<Pick<TokenStatProps, 'provider' | 'note' | 'baseUrl' | 'headers' | 'rows'>> = ({provider, note, baseUrl, headers, rows}) => (
  <div style={{padding: '34px 36px', fontFamily: UI, color: C.darkText, fontSize: 30, lineHeight: 1.4}}>
    <div style={{fontSize: 40, fontWeight: 700, marginBottom: 16}}>
      <span style={{color: '#4493f8', textDecoration: 'underline'}}>{provider}</span>
    </div>
    <div style={{marginBottom: 18}}>{note}</div>
    <div style={{color: C.darkMuted, marginBottom: 8}}>Base URL:</div>
    <div style={{fontFamily: MONO, fontSize: 22, background: '#161b22', padding: '8px 12px', borderRadius: 6, marginBottom: 26, display: 'inline-block'}}>{baseUrl}</div>
    <div style={{border: '2px solid #30363d'}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, fontWeight: 700, background: '#0d1117'}}>
        {headers.map((h) => (
          <div key={h} style={{padding: '14px 12px', borderRight: '2px solid #30363d', textAlign: 'center'}}>
            {h}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, borderTop: '2px solid #30363d', background: i % 2 ? '#161b22' : '#0d1117'}}>
          {r.map((c, j) => (
            <div key={j} style={{padding: '18px 12px', borderRight: '2px solid #30363d', whiteSpace: 'pre-line'}}>
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const TokenStat: React.FC<TokenStatProps> = (p) => {
  const {shine = '#ffd2a6', dim = 0.3, len = LEN} = p;
  const f = useCurrentFrame();
  const inT = tw(f, 0, 18);
  const scroll = tw(f, 0, len, inOut); // one slow read-down across the whole beat
  const ang = (f * 4.5) % 360; // one full sweep every 80 frames
  const cardW = 820;
  const cardH = 900;
  const sweep = `conic-gradient(from ${ang}deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0) 250deg, ${shine} 320deg, #ffffff 345deg, rgba(255,255,255,0) 360deg)`;
  return (
    <AbsoluteFill style={{background: '#07090c', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -200, top: -150 - scroll * 160, width: 1480, transform: 'scale(1.35)', transformOrigin: '50% 0', filter: 'blur(22px)'}}>
        <DocTable {...p} />
        <DocTable {...p} />
      </div>
      <AbsoluteFill style={{background: `rgba(4,5,8,${dim})`}} />
      <AbsoluteFill style={{background: 'radial-gradient(70% 55% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 540 - cardW / 2,
          top: 960 - cardH / 2,
          width: cardW,
          height: cardH,
          opacity: inT,
          transform: `translateY(${mix(50, 0, inT)}px) scale(${mix(0.94, 1, inT)})`,
        }}
      >
        <div style={{position: 'absolute', inset: -10, borderRadius: 40, background: sweep, filter: 'blur(26px)', opacity: 0.55}} />
        <div style={{position: 'absolute', inset: -4, borderRadius: 34, background: sweep}} />
        <div style={{position: 'absolute', inset: -4, borderRadius: 34, border: '3px solid rgba(255,255,255,0.10)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: '#0d1117', overflow: 'hidden', boxShadow: '0 60px 120px -30px rgba(0,0,0,0.8)'}}>
          <div style={{transform: `translateY(${-scroll * 300}px)`}}>
            <DocTable {...p} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================ LogoRoster
 * Each logo lands big in the centre, then shrinks into a growing row underneath, so the
 * roster builds one mark at a time. "ChatGPT, Gemini, GLM, Kimi… and even more." */
export type LogoRosterProps = {logos: string[]; per?: number; bg?: string; len?: number};
export const LogoRoster: React.FC<LogoRosterProps> = ({logos, per: perIn, bg = '#ffffff', len = LEN}) => {
  const f = useCurrentFrame();
  // spread the logos over the beat unless `per` is pinned to the VO
  const per = perIn ?? Math.max(10, Math.floor((len - 30) / Math.max(1, logos.length)));
  const push = mix(1, 1.05, tw(f, 0, len, inOut));
  const slot = 130;
  const rowW = logos.length * slot;
  return (
    <Flat bg={bg} push={push}>
      {logos.map((file, i) => {
        const at = i * per;
        if (f < at) return null;
        const land = tw(f, at, 10);
        const toRow = tw(f, at + per - 4, 12, inOut);
        const x = mix(540, 540 - rowW / 2 + slot * (i + 0.5), toRow);
        const y = mix(840, 1150, toRow);
        const s = mix(300, 96, toRow) * mix(0.85, 1, land);
        return (
          <div key={i} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: land}}>
            <Logo file={file} size={s} />
          </div>
        );
      })}
    </Flat>
  );
};

/* ================================================================ OrbitRing
 * Hero pops in dead centre, then lifts; logos pop out on spokes around it and the whole
 * orbit keeps turning while a tick ring and a dotted halo fill clockwise.
 * "Links Claude to over 600 AI models." (merged with the old OrbitSpokes) */
export type OrbitRingProps = {hero: string; logos: string[]; len?: number};
export const OrbitRing: React.FC<OrbitRingProps> = ({hero, logos, len = LEN}) => {
  const f = useCurrentFrame();
  const push = mix(1, 1.05, tw(f, 40, len - 40, inOut));
  const cx = 540;
  const pop = tw(f, 0, 14);
  const lift = tw(f, 16, 18, inOut);
  const cy = mix(960, 820, lift);
  const heroScale = mix(0.2, 1, pop) * mix(1.25, 1, lift); // big in the centre, settles smaller as it lifts
  const R = 250;
  const spinDeg = Math.max(0, f - 30) * 0.9; // the orbit keeps turning once it's out
  const at0 = 30;
  const ticks = tw(f, at0 + logos.length * 3, 20, inOut);
  const halo = tw(f, at0 + 10 + logos.length * 3, Math.max(34, len - 70 - logos.length * 3), inOut);
  const dotRows = [345, 368, 391, 414];
  const angOf = (i: number) => (i / logos.length) * Math.PI * 2 - Math.PI / 2 + (spinDeg * Math.PI) / 180;
  return (
    <Flat bg="#ffffff" push={push}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {logos.map((_, i) => {
          const a = angOf(i);
          const t = tw(f, at0 + i * 3, 12, inOut);
          return <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(a) * (R - 50)} ${cy + Math.sin(a) * (R - 50)}`} stroke="#d9776a" strokeWidth={3} opacity={0.7} {...draw(t)} />;
        })}
        {Array.from({length: 72}).map((_, i) => {
          const q = i / 72;
          const on = clamp01((ticks - q) * 14);
          const a = q * Math.PI * 2 - Math.PI / 2;
          return <path key={i} d={`M${cx + Math.cos(a) * 300} ${cy + Math.sin(a) * 300} L${cx + Math.cos(a) * 318} ${cy + Math.sin(a) * 318}`} stroke="#9aa1a9" strokeWidth={3} strokeLinecap="round" opacity={on} />;
        })}
        {dotRows.map((rr, row) =>
          Array.from({length: 110 + row * 8}).map((_, i, arr) => {
            const q = i / arr.length;
            const on = clamp01((halo - q) * 16);
            const a = q * Math.PI * 2 - Math.PI / 2 + row * 0.02;
            return <circle key={`${row}-${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={4.2 * on} fill={row % 2 ? '#3a3f45' : '#6b7178'} opacity={0.8} />;
          }),
        )}
      </svg>
      {logos.map((file, i) => {
        const a = angOf(i);
        const t = tw(f, at0 + 6 + i * 3, 10);
        const r = mix(R - 70, R, t);
        return (
          <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * r - 42, top: cy + Math.sin(a) * r - 42, opacity: t, transform: `scale(${mix(0.4, 1, t)})`}}>
            <Logo file={file} size={84} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx - 90, top: cy - 90, opacity: clamp01(pop * 2), transform: `scale(${heroScale})`}}>
        <Logo file={hero} size={180} />
      </div>
    </Flat>
  );
};

/* ================================================================ ModelSwitcher
 * A long row of model tiles; the selection frame scrolls through several of them with a
 * short beat on each, then settles on the last one and turns green with a check.
 * "It switches model automatically." */
export type ModelSwitcherProps = {logos: string[]; stops?: number[]; hold?: number; len?: number};
export const ModelSwitcher: React.FC<ModelSwitcherProps> = ({logos, stops = [0, 1, 2, 3, 4, 5, 6], hold: holdIn, len = LEN}) => {
  const f = useCurrentFrame();
  // spread the stops so the green settle lands ~1s before the cut
  const hold = holdIn ?? Math.max(9, Math.min(22, Math.floor((len - 48) / Math.max(1, stops.length - 1))));
  const push = mix(1, 1.05, tw(f, 0, len, inOut));
  const tile = 250;
  const step = tile + 60;
  const inT = tw(f, 0, 12);
  let sel = stops[0];
  for (let k = 1; k < stops.length; k++) sel = mix(sel, stops[k], tw(f, 8 + (k - 1) * hold, hold - 2, inOut));
  const settleAt = 8 + (stops.length - 1) * hold + 4;
  const done = tw(f, settleAt, 10);
  const y = 960 - tile / 2;
  return (
    <Flat bg="#ffffff" push={push}>
      {logos.map((file, i) => {
        const x = 540 + (i - sel) * step - tile / 2;
        const near = clamp01(1 - Math.abs(i - sel));
        if (x < -tile * 1.5 || x > 1080 + tile) return null;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y + mix(40, 0, inT), opacity: inT * mix(0.35, 1, near), transform: `scale(${mix(0.82, 1, near)})`}}>
            <AppIcon file={file} size={tile} pad={0.22} />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 540 - tile / 2 - 16,
          top: y - 16,
          width: tile + 32,
          height: tile + 32,
          borderRadius: tile * 0.23 + 14,
          border: `6px solid ${done > 0 ? `rgba(31,136,61,${0.4 + 0.6 * done})` : '#d9776a'}`,
          boxShadow: done > 0 ? `0 0 0 ${10 * done}px rgba(31,136,61,0.12)` : 'none',
          opacity: tw(f, 4, 8),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 + tile / 2 - 12,
          top: y - 40,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: C.green,
          color: '#fff',
          fontSize: 38,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: done,
          transform: `scale(${mix(0.5, 1, done)})`,
        }}
      >
        ✓
      </div>
    </Flat>
  );
};

/* ================================================================ SwitcherCards  (from clip 23)
 * Portrait model cards in a row. The selection frame steps to the next card first, the
 * row slides to catch up and recentre, repeat, then the frame turns green. Logos only. */
export type SwitcherCardsProps = {logos: string[]; steps?: number; start?: number; len?: number};
export const SwitcherCards: React.FC<SwitcherCardsProps> = ({logos, steps = 3, start = 1, len = LEN}) => {
  const f = useCurrentFrame();
  const push = mix(1, 1.05, tw(f, 0, len, inOut));
  const cw = 230;
  const ch = 290;
  const gap = 50;
  const step = cw + gap;
  const inT = tw(f, 0, 12);
  const beat = Math.max(18, Math.floor((len - 44) / Math.max(1, steps))); // steps spread over the beat
  let frame = start; // where the selection frame is
  let row = start; // which card the row centres
  for (let k = 0; k < steps; k++) {
    frame = mix(frame, start + k + 1, tw(f, 10 + k * beat, Math.round(beat * 0.4), inOut));
    row = mix(row, start + k + 1, tw(f, 10 + k * beat + Math.round(beat * 0.25), Math.round(beat * 0.5), inOut));
  }
  const done = tw(f, 14 + steps * beat, 10);
  const y = 960 - ch / 2;
  const frameX = 540 + (frame - row) * step;
  return (
    <Flat bg="#ffffff" push={push}>
      {logos.map((file, i) => {
        const x = 540 + (i - row) * step - cw / 2;
        const near = clamp01(1 - Math.abs(i - frame));
        const dist = Math.abs(i - row);
        if (dist > 2.6) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y + mix(40, 0, inT),
              width: cw,
              height: ch,
              borderRadius: 26,
              background: '#fff',
              border: `2px solid ${C.line}`,
              boxShadow: '0 24px 44px -26px rgba(31,35,40,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: inT * mix(0.25, 1, clamp01(1 - (dist - 0.6) / 1.8)),
              transform: `scale(${mix(0.86, 1, near)})`,
            }}
          >
            <Logo file={file} size={110} />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: frameX - cw / 2 - 14,
          top: y - 14,
          width: cw + 28,
          height: ch + 28,
          borderRadius: 34,
          border: `5px solid ${done > 0 ? `rgba(31,136,61,${0.4 + 0.6 * done})` : '#d9776a'}`,
          opacity: tw(f, 4, 8),
        }}
      />
    </Flat>
  );
};
