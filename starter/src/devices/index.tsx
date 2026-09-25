import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {C, Card, Check, Cursor, inOut, MONO, mix, Pill, pop, rise, rnd, SERIF, tw, typed, UI, Win} from '../kit';

/**
 * Device library — the premium UI patterns already ported to frame-driven Remotion.
 * Each one is a single visible mechanism lifted from a 21st.dev / Magic UI / Refero-class
 * component and re-drawn flat, deterministic, and vertical. Add a new device here when a
 * build ports one; the skill's `references/premium-ui-sourcing.md` owns the porting contract.
 *
 * Every device takes `f` (the beat-local frame) and a `start` and draws itself from those
 * two numbers. None of them keeps state.
 */

/* ============================================================ 1. Beam */

/**
 * Animated beam (21st.dev #919, Magic UI "Animated Beam"): a curved connector drawing
 * itself between two objects, then a light pulse travelling it. The integration beat.
 */
export const Beam: React.FC<{x1: number; y1: number; x2: number; y2: number; f: number; start: number; bend?: number; color?: string; rail?: string}> = ({
  x1,
  y1,
  x2,
  y2,
  f,
  start,
  bend = -120,
  color = C.coral,
  rail = '#d6d9dd',
}) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + bend;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const draw = tw(f, start, 14, inOut);
  const L = 1400;
  const travel = ((f - start - 10) % 26) / 26;
  const pulseOn = f > start + 10;
  const id = `beam${x1}${y1}${start}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset={Math.max(0, travel - 0.12)} stopColor={color} stopOpacity="0" />
          <stop offset={travel} stopColor={color} stopOpacity="1" />
          <stop offset={Math.min(1, travel + 0.12)} stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={rail} strokeWidth={6} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
      {pulseOn ? <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth={9} strokeLinecap="round" /> : null}
    </svg>
  );
};

/* ============================================================ 2. Terminal */

export type TermLine = {text: string; at: number; over?: number; color?: string; prompt?: boolean; type?: boolean};

/** A dark zsh window; lines type in (`type`) or land whole, each on its own frame. */
export const Terminal: React.FC<{f: number; w?: number; h?: number; title?: string; lines: TermLine[]; size?: number; style?: React.CSSProperties}> = ({
  f,
  w = 940,
  h = 260,
  title = 'zsh',
  lines,
  size = 38,
  style,
}) => (
  <Win w={w} h={h} dark title={title} style={style}>
    <div style={{padding: `${size * 0.7}px ${size}px`, fontFamily: MONO, fontSize: size, lineHeight: 1.6, color: C.darkText}}>
      {lines.map((l, i) => {
        const t = tw(f, l.at, l.over ?? (l.type ? 22 : 6), l.type ? inOut : undefined);
        if (t <= 0) return null;
        const shown = l.type ? typed(l.text, t) : l.text;
        return (
          <div key={i} style={{whiteSpace: 'nowrap', opacity: l.type ? 1 : t, color: l.color}}>
            {l.prompt ? <span style={{color: '#3fb950'}}>❯ </span> : null}
            {shown}
            {l.type && t < 1 ? <span style={{display: 'inline-block', width: size * 0.5, height: size, background: C.darkText, verticalAlign: 'middle', marginLeft: 4}} /> : null}
          </div>
        );
      })}
    </div>
  </Win>
);

/* ============================================================ 3. Menu / picker */

/** Dropdown menu (white, hairline, check on the active row) — model pickers, effort levels, settings. */
export const Menu: React.FC<{items: {n: string; d?: string; icon?: string}[]; active: number; hover?: number; w?: number; t: number; checkT?: number}> = ({
  items,
  active,
  hover = -1,
  w = 560,
  t,
  checkT = 1,
}) => (
  <div
    style={{
      width: w,
      borderRadius: 22,
      background: '#fff',
      border: '1.5px solid #e6e6e6',
      boxShadow: '0 30px 70px -24px rgba(0,0,0,0.28), 0 6px 16px rgba(0,0,0,0.06)',
      padding: 10,
      fontFamily: UI,
      opacity: t,
      transform: `translateY(${mix(-14, 0, t)}px) scale(${mix(0.97, 1, t)})`,
      transformOrigin: 'top left',
    }}
  >
    {items.map((m, i) => (
      <div key={m.n} style={{display: 'flex', alignItems: 'center', gap: 18, padding: m.d ? '16px 20px' : '14px 20px', borderRadius: 14, background: i === hover ? '#f2f2f2' : 'transparent'}}>
        {m.icon ? <Img src={staticFile(`logos/${m.icon}`)} style={{width: 44, height: 44, objectFit: 'contain', display: 'block'}} /> : null}
        <div style={{flex: 1}}>
          <div style={{fontSize: 30, color: '#111'}}>{m.n}</div>
          {m.d ? <div style={{fontSize: 23, color: '#8a8a8a', marginTop: 3}}>{m.d}</div> : null}
        </div>
        {i === active ? (
          <svg width="30" height="30" viewBox="0 0 24 24" style={{opacity: checkT}}>
            <path d="M5 12.5l4.5 4.5L19 8" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    ))}
  </div>
);

/* ============================================================ 4. Composer */

/**
 * A CSS-drawn chat composer (ChatGPT / Claude / Codex class). Text types, chips sit below,
 * attachments stack above, the send button lights when there is text. Use a real capture
 * (`Cap`) instead when the beat is about a SPECIFIC product's composer.
 */
export const Composer: React.FC<{
  w?: number;
  text?: string;
  placeholder?: string;
  chips?: string[];
  caret?: boolean;
  sendT?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({w = 960, text, placeholder = 'Ask anything…', chips = [], caret, sendT = 0, children, style}) => {
  const k = w / 960;
  return (
    <div
      style={{
        width: w,
        borderRadius: 30 * k,
        background: '#fff',
        border: '1.5px solid #ececec',
        boxShadow: '0 40px 80px -30px rgba(31,35,40,0.28), 0 4px 10px rgba(31,35,40,0.06)',
        padding: `${26 * k}px ${30 * k}px ${22 * k}px`,
        fontFamily: UI,
        ...style,
      }}
    >
      {children ? <div style={{display: 'flex', gap: 14 * k, marginBottom: 20 * k}}>{children}</div> : null}
      <div style={{fontSize: 38 * k, color: text ? '#111' : '#a3a3a3', whiteSpace: 'nowrap', letterSpacing: '-0.01em', minHeight: 48 * k}}>
        {text || placeholder}
        {caret ? <span style={{display: 'inline-block', width: 3 * k, height: 40 * k, background: '#111', verticalAlign: 'middle', marginLeft: 3 * k}} /> : null}
      </div>
      <div style={{display: 'flex', alignItems: 'center', marginTop: 24 * k, gap: 16 * k}}>
        <div style={{width: 44 * k, height: 44 * k, borderRadius: 22 * k, border: '2px solid #e3e5e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 * k, color: '#6f6f6f', lineHeight: 1}}>+</div>
        {chips.map((c) => (
          <div key={c} style={{display: 'flex', alignItems: 'center', gap: 10 * k, fontSize: 28 * k, color: '#6f6f6f', whiteSpace: 'nowrap'}}>
            {c}
            <svg width={20 * k} height={20 * k} viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" fill="none" stroke="#6f6f6f" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        ))}
        <div style={{flex: 1}} />
        <div style={{width: 56 * k, height: 56 * k, borderRadius: 28 * k, background: text ? '#111' : '#d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.12 * sendT})`}}>
          <svg width={28 * k} height={28 * k} viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/** an attachment chip inside a composer — a file, a reference, an image */
export const FileChip: React.FC<{name: string; meta?: string; color?: string; thumb?: string; t?: number}> = ({name, meta, color = C.coral, thumb, t = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px 12px 12px', borderRadius: 18, border: '1.5px solid #e6e6e6', background: '#fafafa', fontFamily: UI, ...pop(t)}}>
    {thumb ? (
      <div style={{width: 56, height: 56, borderRadius: 12, overflow: 'hidden'}}>
        <Img src={staticFile(thumb)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
      </div>
    ) : (
      <div style={{width: 56, height: 56, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="30" height="30" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    )}
    <div>
      <div style={{fontSize: 27, fontWeight: 600, color: '#111', whiteSpace: 'nowrap'}}>{name}</div>
      {meta ? <div style={{fontSize: 21, color: '#8a8a8a'}}>{meta}</div> : null}
    </div>
  </div>
);

/* ============================================================ 5. Notification stack */

export type Notif = {title: string; sub?: string; amount?: string; at: number; icon?: React.ReactNode; color?: string};

/** Notifications stacking in (Stripe payments, GitHub stars, Slack pings) — one card per row. */
export const NotifStack: React.FC<{f: number; rows: Notif[]; w?: number; h?: number; gap?: number; y?: number}> = ({f, rows, w = 860, h = 130, gap = 30, y = 0}) => (
  <div style={{position: 'absolute', left: 540 - w / 2, top: y}}>
    {rows.map((r, i) => {
      const t = tw(f, r.at, 10);
      return (
        <div key={i} style={{marginBottom: gap, ...rise(t, 50)}}>
          <Card w={w} h={h} r={30}>
            <div style={{display: 'flex', alignItems: 'center', height: '100%', padding: '0 34px', gap: 26}}>
              {r.icon ?? (
                <div style={{width: 70, height: 70, borderRadius: 35, background: `${r.color ?? C.green}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color ?? C.green, fontWeight: 800, fontSize: 40}}>
                  $
                </div>
              )}
              <div style={{flex: 1}}>
                <div style={{fontSize: 34, fontWeight: 700, color: C.ink}}>{r.title}</div>
                {r.sub ? <div style={{fontSize: 26, color: C.sub}}>{r.sub}</div> : null}
              </div>
              {r.amount ? <div style={{fontSize: 42, fontWeight: 800, color: r.color ?? C.green}}>{r.amount}</div> : null}
            </div>
          </Card>
        </div>
      );
    })}
  </div>
);

/* ============================================================ 6. Counter */

/** A hero number counting up. `value` can be the eased number; format it here. */
export const Counter: React.FC<{value: number; prefix?: string; suffix?: string; label?: string; size?: number; color?: string; decimals?: number}> = ({
  value,
  prefix = '',
  suffix = '',
  label,
  size = 190,
  color = C.ink,
  decimals = 0,
}) => (
  <div style={{textAlign: 'center', fontFamily: UI}}>
    {label ? <div style={{fontSize: size * 0.16, fontWeight: 600, color: C.sub, letterSpacing: '0.02em', marginBottom: size * 0.04}}>{label}</div> : null}
    <div style={{fontSize: size, fontWeight: 800, color, letterSpacing: '-0.06em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
      {prefix}
      {value.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
      {suffix}
    </div>
  </div>
);

/** eased count from 0 to `to` over [from, from+over], stepping by `step` */
export const countTo = (f: number, from: number, over: number, to: number, step = 1) =>
  Math.round(interpolate(f, [from, from + over], [0, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: inOut}) / step) * step;

/* ============================================================ 7. Progress ring */

/** A ring filling to 100 with the number inside and a label flipping when done. "Let it rip." */
export const ProgressRing: React.FC<{p: number; label?: string; doneLabel?: string; size?: number; stroke?: number; color?: string; doneColor?: string}> = ({
  p,
  label = 'Building',
  doneLabel = 'Done',
  size = 700,
  stroke = 26,
  color = C.ink,
  doneColor = C.green,
}) => {
  const R = size * 0.43;
  const circ = 2 * Math.PI * R;
  const done = p >= 1;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#e6e8eb" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={done ? doneColor : color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: UI}}>
        <div style={{fontSize: size * 0.29, fontWeight: 800, letterSpacing: '-0.06em', color: C.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(p * 100)}</div>
        <div style={{fontSize: size * 0.05, fontWeight: 600, color: C.sub, marginTop: 6}}>{done ? doneLabel : label}</div>
      </div>
    </div>
  );
};

/* ============================================================ 8. Step chips */

/** A row of pills that light green one by one — steps of a pipeline resolving. */
export const StepChips: React.FC<{f: number; steps: {n: string; at: number}[]; size?: number}> = ({f, steps, size = 30}) => (
  <div style={{display: 'flex', gap: 16}}>
    {steps.map((s) => {
      const on = tw(f, s.at, 8);
      const lit = on > 0.5;
      return (
        <div
          key={s.n}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: `${size * 0.53}px ${size * 0.87}px`,
            borderRadius: 999,
            background: lit ? '#eef8f1' : '#fff',
            border: `2px solid ${lit ? 'rgba(31,136,61,0.4)' : C.line}`,
            fontFamily: UI,
            fontSize: size,
            fontWeight: 600,
            color: lit ? C.green : '#9aa1a8',
            boxShadow: '0 14px 30px -14px rgba(31,35,40,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <Check size={size} t={on} color={on > 0 ? C.green : '#d6d9dd'} />
          {s.n}
        </div>
      );
    })}
  </div>
);

/* ============================================================ 9. Site mock */

export type SiteSpec = {
  brand: string;
  nav?: string[];
  cta?: string;
  headline: string;
  sub?: string;
  primary?: string;
  secondary?: string;
  image?: string; // public path incl. folder, e.g. caps/ref-hyer (no ext)
  stats?: string[];
  serif?: boolean;
  bg?: string;
};

/**
 * A premium landing page assembling block by block — the "it built a website" beat.
 * Geometry follows the Refero/21st hero pattern: nav, serif display headline, sub,
 * two buttons, a media card right, a stat row. Mount inside `Win`.
 */
export const SiteMock: React.FC<{f: number; start?: number; w?: number; spec: SiteSpec}> = ({f, start = 0, w = 900, spec}) => {
  const k = w / 900;
  const b = (i: number) => tw(f, start + i * 2, 7);
  const block = (i: number): React.CSSProperties => ({opacity: b(i), transform: `translateY(${(1 - b(i)) * 24}px)`});
  const face = spec.serif === false ? UI : SERIF;
  return (
    <div style={{position: 'relative', width: w, height: 690 * k, background: spec.bg ?? '#fbfaf7', fontFamily: UI}}>
      <div style={{...block(0), position: 'absolute', left: 44 * k, right: 44 * k, top: 30 * k, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: face, fontSize: 34 * k, fontWeight: 700, color: C.ink}}>{spec.brand}</div>
        <div style={{display: 'flex', gap: 26 * k, fontSize: 20 * k, color: C.sub}}>
          {(spec.nav ?? ['Product', 'Pricing', 'Docs']).map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <div style={{padding: `${9 * k}px ${20 * k}px`, borderRadius: 999, background: C.ink, color: '#fff', fontSize: 19 * k, fontWeight: 600}}>{spec.cta ?? 'Get started'}</div>
      </div>
      <div style={{...block(1), position: 'absolute', left: 44 * k, top: 110 * k, width: 470 * k, fontFamily: face, fontSize: 70 * k, lineHeight: 1.02, color: C.ink, letterSpacing: '-0.02em'}}>
        {spec.headline}
      </div>
      {spec.sub ? (
        <div style={{...block(2), position: 'absolute', left: 44 * k, top: 290 * k, width: 400 * k, fontSize: 22 * k, lineHeight: 1.4, color: C.sub}}>{spec.sub}</div>
      ) : null}
      <div style={{...block(3), position: 'absolute', left: 44 * k, top: 380 * k, display: 'flex', gap: 14 * k}}>
        <div style={{padding: `${16 * k}px ${30 * k}px`, borderRadius: 999, background: C.ink, color: '#fff', fontSize: 22 * k, fontWeight: 600}}>{spec.primary ?? 'Start free'}</div>
        <div style={{padding: `${16 * k}px ${30 * k}px`, borderRadius: 999, border: `2px solid ${C.hair}`, color: C.ink, fontSize: 22 * k, fontWeight: 600}}>{spec.secondary ?? 'See demo'}</div>
      </div>
      <div style={{...block(2), position: 'absolute', right: 34 * k, top: 100 * k, width: 330 * k, height: 400 * k, borderRadius: 24 * k, overflow: 'hidden', background: '#e9eaea'}}>
        {spec.image ? (
          <Img src={staticFile(`${spec.image}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 50%', transform: `scale(${mix(1.25, 1.05, b(2))})`}} />
        ) : null}
      </div>
      {spec.stats ? (
        <div style={{...block(4), position: 'absolute', left: 34 * k, right: 34 * k, top: 530 * k, display: 'flex', gap: 16 * k}}>
          {spec.stats.map((s) => (
            <div key={s} style={{flex: 1, height: 120 * k, borderRadius: 20 * k, background: '#ffffff', border: '2px solid #eceae4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: face, fontSize: 32 * k, color: C.ink}}>
              {s}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

/* ============================================================ 10. Image cluster */

export type ClusterItem = {file: string; x: number; y: number; w: number; h: number; at: number; r?: number};

/** Stills resolving around a centre object one by one — "generates images", "a gallery of". */
export const ImageCluster: React.FC<{f: number; items: ClusterItem[]}> = ({f, items}) => (
  <>
    {items.map((it, i) => {
      const t = tw(f, it.at, 10);
      return (
        <div key={i} style={{position: 'absolute', left: it.x - it.w / 2, top: it.y - it.h / 2, width: it.w, height: it.h, borderRadius: it.r ?? 22, overflow: 'hidden', boxShadow: '0 30px 60px -24px rgba(31,35,40,0.35)', ...pop(t)}}>
          <Img src={staticFile(it.file.includes('/') ? `${it.file}.png` : `stills/${it.file}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        </div>
      );
    })}
  </>
);

/* ============================================================ 11. Token row */

/** Design tokens read off a reference — swatches, a type sample, a radius. "A clear visual direction." */
export const TokenRow: React.FC<{f: number; start: number; colors: string[]; y?: number}> = ({f, start, colors, y = 1000}) => {
  const items = [...colors.map((c) => ({kind: 'c', v: c})), {kind: 'aa', v: ''}, {kind: 'r', v: ''}];
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22}}>
      {items.map((it, i) => {
        const t = tw(f, start + i * 3, 8);
        return (
          <div key={i} style={{width: 86, height: 86, borderRadius: 43, background: it.kind === 'c' ? it.v : '#fff', border: `2px solid ${C.line}`, boxShadow: '0 14px 30px -12px rgba(31,35,40,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 36, color: C.ink, ...pop(t)}}>
            {it.kind === 'aa' ? 'Aa' : null}
            {it.kind === 'r' ? <div style={{width: 40, height: 40, borderTopLeftRadius: 18, borderTop: `3px solid ${C.ink}`, borderLeft: `3px solid ${C.ink}`}} /> : null}
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================ 12. Slider */

/** A labelled slider whose thumb travels — time spent, budget, a version count. */
export const Slider: React.FC<{t: number; w?: number; label?: string; left?: string; right?: string; color?: string}> = ({t, w = 800, label, left, right, color = C.coral}) => (
  <div style={{width: w, fontFamily: UI}}>
    {label ? <div style={{fontSize: 28, fontWeight: 600, color: C.sub, marginBottom: 14, display: 'flex', justifyContent: 'space-between'}}><span>{label}</span><span style={{color: C.ink}}>{right}</span></div> : null}
    <div style={{position: 'relative', height: 14, borderRadius: 7, background: '#e6e8eb'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t * 100}%`, borderRadius: 7, background: color}} />
      <div style={{position: 'absolute', left: `${t * 100}%`, top: -13, width: 40, height: 40, borderRadius: 20, background: '#fff', border: `3px solid ${color}`, transform: 'translateX(-50%)', boxShadow: '0 6px 14px rgba(0,0,0,0.15)'}} />
    </div>
    {left ? <div style={{fontSize: 24, color: C.muted, marginTop: 12}}>{left}</div> : null}
  </div>
);

/* ============================================================ 13. Card fan-out */

/** A stack of cards that fans out from a pile — "a dozen versions", "every AI site looks the same". */
export const CardFan: React.FC<{f: number; start: number; n: number; w: number; h: number; render: (i: number) => React.ReactNode; spread?: number}> = ({f, start, n, w, h, render, spread = 70}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const t = tw(f, start + i * 3, 10);
      const dx = (i - (n - 1) / 2) * spread;
      return (
        <div key={i} style={{position: 'absolute', left: 540 - w / 2, top: 620 - h / 2, width: w, height: h, opacity: t, transform: `translate(${dx * t}px, ${(1 - t) * 40}px) rotate(${(i - (n - 1) / 2) * 1.5 * t}deg)`, zIndex: i}}>
          {render(i)}
        </div>
      );
    })}
  </>
);

/* ============================================================ 14. Cursor click helper */

/** a cursor that travels A→B, presses, and a ring lands — the smallest complete "it did something" */
export const ClickAt: React.FC<{f: number; from: [number, number]; to: [number, number]; start: number; travel?: number}> = ({f, from, to, start, travel = 14}) => {
  const t = tw(f, start, travel, inOut);
  const x = mix(from[0], to[0], t);
  const y = mix(from[1], to[1], t);
  const press = interpolate(f, [start + travel, start + travel + 2, start + travel + 6], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <Cursor x={x} y={y} press={press} opacity={tw(f, start - 4, 4)} />;
};

export {Pill};

/* ============================================================ 15. Cost / token chart */

/**
 * The TrueForge Enterprise-Bench chart, rebuilt from scratch so it can animate — the
 * sponsor's own figures, drawn FLAT (their deck extrudes the bars; the user's rule is no 3D
 * of any kind, so the depth is gone and the data is not).
 *
 * Example data below is the TrueForge build's (DevRev Enterprise-Bench, 14 tasks);
 * replace COST_BARS per project.
 *   Claude Managed Agents · Opus 4.8        $11.8 / run   10.0M tokens
 *   TrueForge · Opus 4.8 (same model)       $8.5  / run    3.8M tokens   −30%
 *   TrueForge · GLM-5.2 (open model)        $2.9  / run    3.7M tokens   −75%
 *
 * Beats 11–23 all draw THIS one chart at different `reveal` counts and `metric`s, so the
 * viewer keeps one object in mind while the VO adds one fact per cut.
 */
export type CostBar = {label: string; sub: string; cost: number; tokens: number; badge?: string; brand: 'claude' | 'tf' | 'tf-open'};

export const COST_BARS: CostBar[] = [
  {label: 'Claude Managed Agents', sub: 'Opus 4.8', cost: 11.8, tokens: 10.0, brand: 'claude'},
  {label: 'TrueForge', sub: 'Opus 4.8 · same model', cost: 8.5, tokens: 3.8, badge: '−30%', brand: 'tf'},
  {label: 'TrueForge', sub: 'GLM-5.2 · open model', cost: 2.9, tokens: 3.7, badge: '−75%', brand: 'tf-open'},
];

const BAR_FILL: Record<CostBar['brand'], string> = {claude: C.coral, tf: '#6d5cf5', 'tf-open': '#4a37e0'};

/**
 * `reveal`   how many bars have grown in (0–3); each grows over 14 frames, 8 frames apart
 * `metric`   'cost' → $ per run, 'tokens' → M tokens per run (same geometry, new scale)
 * `badges`   how many −% badges have popped (0–2), each 10 frames after its bar
 * `subs`     draw the model sub-labels (beat 12 turns them on)
 */
export const CostChart: React.FC<{
  f: number;
  start?: number;
  reveal?: number;
  metric?: 'cost' | 'tokens';
  badges?: number;
  subs?: boolean;
  w?: number;
  h?: number;
}> = ({f, start = 0, reveal = 3, metric = 'cost', badges = 0, subs = true, w = 900, h = 620}) => {
  const max = metric === 'cost' ? 12 : 11;
  const val = (b: CostBar) => (metric === 'cost' ? b.cost : b.tokens);
  const fmt = (v: number) => (metric === 'cost' ? `$${v.toFixed(1)}` : `${v.toFixed(1)}M`);
  const bw = w * 0.2;
  const gap = (w - bw * 3) / 4;
  return (
    <div style={{width: w, height: h, position: 'relative', fontFamily: UI}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, height: 2, background: C.hair}} />
      {COST_BARS.map((b, i) => {
        const t = i < reveal ? tw(f, start + i * 8, 14) : 0;
        const bh = (val(b) / max) * (h - 200) * t;
        const badge = b.badge && i <= badges ? tw(f, start + i * 8 + 10, 8) : 0;
        const counted = interpolate(t, [0, 1], [0, val(b)]);
        return (
          <div key={b.sub} style={{position: 'absolute', left: gap + i * (bw + gap), bottom: 152, width: bw}}>
            <div style={{position: 'absolute', bottom: bh + 26, left: 0, width: bw, textAlign: 'center', opacity: t}}>
              <div style={{fontSize: 62, fontWeight: 800, letterSpacing: '-0.05em', color: BAR_FILL[b.brand], fontVariantNumeric: 'tabular-nums'}}>{fmt(counted)}</div>
            </div>
            {badge > 0 ? (
              <div style={{position: 'absolute', bottom: bh - 44, left: 0, width: bw, display: 'flex', justifyContent: 'center', ...pop(badge)}}>
                <div style={{padding: '8px 22px', borderRadius: 999, background: C.green, color: '#fff', fontSize: 34, fontWeight: 700}}>{b.badge}</div>
              </div>
            ) : null}
            <div
              style={{
                height: bh,
                borderRadius: '18px 18px 4px 4px',
                background: `linear-gradient(180deg, ${BAR_FILL[b.brand]} 0%, ${BAR_FILL[b.brand]}22 100%)`,
              }}
            />
            <div style={{position: 'absolute', top: '100%', left: -gap / 2, width: bw + gap, textAlign: 'center', paddingTop: 22, opacity: t}}>
              <div style={{fontSize: 32, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em'}}>{b.label}</div>
              {subs ? <div style={{fontSize: 27, fontWeight: 500, color: C.sub, marginTop: 6}}>{b.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================ 15. GitHub star button */

/** The dark GitHub star pill (☆ Star · count · mark) — the "look how many stars" beat. */
export const StarButton: React.FC<{count: number; lit: number; w?: number}> = ({count, lit, w = 900}) => {
  const k = w / 900;
  return (
    <div style={{display: 'flex', alignItems: 'stretch', width: w, height: 190 * k, borderRadius: 34 * k, background: 'linear-gradient(180deg, #2a3138 0%, #1c2229 100%)', border: `${2 * k}px solid #3a424b`, boxShadow: '0 40px 80px -24px rgba(8,10,14,0.6), inset 0 1px 0 rgba(255,255,255,0.08)', fontFamily: UI, overflow: 'hidden'}}>
      <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 30 * k, padding: `0 ${44 * k}px`}}>
        <svg width={92 * k} height={92 * k} viewBox="0 0 24 24">
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill={`rgba(243,178,52,${lit})`} stroke="#f3b234" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <div style={{fontSize: 70 * k, fontWeight: 600, color: '#e6edf3', letterSpacing: '-0.02em'}}>Star</div>
        <div style={{marginLeft: 8 * k, padding: `${14 * k}px ${40 * k}px`, borderRadius: 999, background: '#39424c', color: '#fff', fontSize: 66 * k, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', minWidth: 300 * k, textAlign: 'center'}}>
          {count.toLocaleString('en-US')}
        </div>
      </div>
      <div style={{width: 190 * k, borderLeft: `${2 * k}px solid #3a424b`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile('logos/lh_github.svg')} style={{width: 100 * k, height: 100 * k, filter: 'invert(1)'}} />
      </div>
    </div>
  );
};

/* ============================================================ 16. Claude Code welcome terminal */

/** The Claude Code welcome screen (dashed coral panels, Clawd, recent activity) — drawn, since a real capture carries a user's name and paths. */
export const ClaudeCodeTerm: React.FC<{f: number; w?: number; h?: number; version?: string; user?: string}> = ({f, w = 980, h = 560, version = 'v2.1.0', user = 'Jack'}) => {
  const t = tw(f, 4, 10);
  const rows = [
    ['1m ago', 'Updated project memory'],
    ['8m ago', "Updated claw'd feet"],
    ['2d ago', 'Add new words to spinner'],
    ['1w ago', 'Update unit tests'],
  ];
  const cor = '#da7757';
  return (
    <Win w={w} h={h} dark bar={60} style={{background: '#262624'}}>
      <div style={{position: 'absolute', inset: 0, background: '#262624', fontFamily: MONO, color: '#e8e6e3', fontSize: 22, padding: '28px 30px'}}>
        <div style={{display: 'flex', gap: 14, opacity: t}}>
          <div style={{position: 'relative', width: 400, height: 350, border: `2px dashed ${cor}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
            <div style={{position: 'absolute', top: -16, left: 60, padding: '0 10px', background: '#262624', color: cor}}>Claude Code {version}</div>
            <div>Welcome back {user}!</div>
            <Img src={staticFile('logos/clawd.svg')} style={{width: 110, display: 'block'}} />
            <div style={{textAlign: 'center', color: '#b6b3ae', fontSize: 20, lineHeight: 1.5}}>
              Opus 4.8 • Max 20x
              <br />
              /users/{user.toLowerCase()}/code/apps
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div style={{border: `2px dashed ${cor}`, borderRadius: 8, padding: '14px 18px', lineHeight: 1.45}}>
              <div style={{color: cor}}>Recent activity</div>
              {rows.map(([a, b], i) => (
                <div key={i} style={{display: 'flex', gap: 22, opacity: tw(f, 10 + i * 3, 5)}}>
                  <span style={{width: 90, color: '#b6b3ae'}}>{a}</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <div style={{border: `2px dashed ${cor}`, borderRadius: 8, padding: '14px 18px', lineHeight: 1.45, flex: 1}}>
              <div style={{color: cor}}>What's new</div>
              <div style={{opacity: tw(f, 20, 5)}}>/agents to create subagents</div>
              <div style={{opacity: tw(f, 23, 5)}}>/security-review for review agent</div>
              <div style={{opacity: tw(f, 26, 5)}}>ctrl+b to background bashes</div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 34, borderTop: '1px solid #4a4845', paddingTop: 18, color: '#9a9792', opacity: tw(f, 24, 6)}}>
          <span style={{color: '#e8e6e3'}}>&gt; </span>
          <span style={{display: 'inline-block', width: 12, height: 24, background: '#e8e6e3', verticalAlign: 'middle', marginRight: 6, opacity: Math.round(f / 15) % 2 === 0 ? 1 : 0}} />
          Try "edit &lt;filepath&gt; to …"
        </div>
      </div>
    </Win>
  );
};

/* ============================================================ 17. Orbit harness */

export type Tool = {file: string; at: number; swap?: {file: string; at: number}};

/**
 * The harness in the middle (TrueForge mark), an inner ring of tool tiles beamed to it and
 * an outer ring orbiting the other way. No labels — the marks carry it. A `swap` throws the
 * old tile out radially and flies the new one in from outside the frame. `spin` is the
 * absolute frame so the rings keep turning across cuts.
 */
export const Orbit: React.FC<{f: number; spin: number; inner: Tool[]; outer: Tool[]; models?: {file: string; name: string; at: number}[]; cx?: number; cy?: number; centerAt?: number}> = ({
  f,
  spin,
  inner,
  outer,
  models = [],
  cx = 540,
  cy = 720,
  centerAt = 0,
}) => {
  const R1 = 300;
  const R2 = 470;
  const c = tw(f, centerAt, 12);
  const modelIdx = models.reduce((acc, m, i) => (f >= m.at ? i : acc), -1);
  const model = modelIdx >= 0 ? models[modelIdx] : null;
  const mt = model ? tw(f, model.at, 8) : 0;
  const posOf = (i: number, n: number, r: number, dir: number, speed: number) => {
    const a = ((i / n) * 360 - 90 + dir * spin * speed) * (Math.PI / 180);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, a] as const;
  };
  const tile = (tl: Tool, size: number, x: number, y: number, ang: number, key: string) => {
    const t = tw(f, tl.at, 10);
    const out = tl.swap ? tw(f, tl.swap.at, 12, inOut) : 0; // old tile leaves
    const inn = tl.swap ? tw(f, tl.swap.at + 8, 12) : 0; // new tile arrives
    const fly = 520;
    const dx = Math.cos(ang) * fly;
    const dy = Math.sin(ang) * fly;
    const box = (file: string, o: number, tx: number, ty: number, sc: number, hot: boolean) => (
      <div style={{position: 'absolute', left: x - size / 2 + tx, top: y - size / 2 + ty, width: size, height: size, opacity: o, transform: `scale(${sc})`}}>
        <div style={{width: size, height: size, borderRadius: size * 0.26, background: '#fff', border: `2px solid ${hot ? '#6d5cf5' : C.line}`, boxShadow: hot ? '0 30px 60px -20px rgba(109,92,245,0.5), 0 4px 10px rgba(31,35,40,0.06)' : '0 30px 60px -24px rgba(31,35,40,0.3), 0 4px 10px rgba(31,35,40,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={staticFile(`logos/${file}`)} style={{width: size * 0.62, height: size * 0.62, objectFit: 'contain', display: 'block'}} />
        </div>
      </div>
    );
    return (
      <React.Fragment key={key}>
        {out < 1 ? box(tl.file, t * (1 - out), dx * out, dy * out, mix(0.7, 1, t) * mix(1, 0.6, out), false) : null}
        {tl.swap && inn > 0 ? box(tl.swap.file, inn, dx * (1 - inn), dy * (1 - inn), mix(0.6, 1, inn), inn < 1 || f < tl.swap.at + 30) : null}
      </React.Fragment>
    );
  };
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={cx} cy={cy} r={R1} fill="none" stroke="#d9dde1" strokeWidth={2} strokeDasharray="4 14" opacity={c} />
        <circle cx={cx} cy={cy} r={R2} fill="none" stroke="#d9dde1" strokeWidth={2} strokeDasharray="4 14" opacity={c} />
        {inner.map((tl, i) => {
          const [x, y] = posOf(i, inner.length, R1, 1, 0.35);
          const d = tw(f, tl.at - 4, 12, inOut);
          const L = R1;
          const pulse = ((f - tl.at) % 36) / 36;
          const hot = tl.swap && f >= tl.swap.at + 8;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={hot ? '#6d5cf5' : '#cfd4da'} strokeWidth={5} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - d)} />
              {d >= 1 ? <circle cx={mix(cx, x, pulse)} cy={mix(cy, y, pulse)} r={8} fill="#6d5cf5" opacity={0.9 * (1 - Math.abs(pulse - 0.5) * 2)} /> : null}
            </g>
          );
        })}
      </svg>
      {outer.map((tl, i) => {
        const [x, y, a] = posOf(i, outer.length, R2, -1, 0.22);
        return tile(tl, 118, x, y, a, `o${i}`);
      })}
      {inner.map((tl, i) => {
        const [x, y, a] = posOf(i, inner.length, R1, 1, 0.35);
        return tile(tl, 150, x, y, a, `i${i}`);
      })}
      <div style={{position: 'absolute', left: cx - 130, top: cy - 130, width: 260, height: 260, ...pop(c)}}>
        <div style={{width: 260, height: 260, borderRadius: 64, background: '#fff', border: `2px solid ${C.line}`, boxShadow: '0 40px 80px -24px rgba(31,35,40,0.4), 0 4px 10px rgba(31,35,40,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={staticFile('logos/trueforge-mark.svg')} style={{width: 150, height: 150, display: 'block'}} />
        </div>
      </div>
      {model ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: cy + 150, display: 'flex', justifyContent: 'center', ...pop(mt)}}>
          <Pill size={32} border="#6d5cf5" style={{boxShadow: '0 20px 40px -16px rgba(109,92,245,0.5)'}}>
            <Img src={staticFile(`logos/${model.file}`)} style={{width: 40, height: 40, objectFit: 'contain', display: 'block'}} />
            {model.name}
          </Pill>
        </div>
      ) : null}
    </>
  );
};

/* ============================================================ 17b. Prompt feed (Animated Beam) */

/**
 * One composer feeding three machines on the Magic UI Animated Beam mechanism (21st.dev
 * #919, dillionverma, MIT): a grey rail draws itself along a curve, then a gradient light
 * streak travels it on a loop. Ported flat and frame-driven; the paths curve out of the box
 * top and drop into each machine.
 */
export const PromptFeed: React.FC<{f: number; at: number; xs: number[]; y0: number; y1: number; flow?: number; color?: string}> = ({f, at, xs, y0, y1, flow = 0, color = '#6d5cf5'}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      {xs.map((x, i) => {
        const travel = ((f * 0.028 + i * 0.18) % 1) * 1.15 - 0.075;
        const st = (o: number) => Math.max(0, Math.min(1, o));
        return (
          <linearGradient key={i} id={`feed${i}`} gradientUnits="userSpaceOnUse" x1={540} y1={y0} x2={x} y2={y1}>
            <stop offset={st(travel - 0.16)} stopColor={color} stopOpacity="0" />
            <stop offset={st(travel)} stopColor={color} stopOpacity="1" />
            <stop offset={st(travel + 0.03)} stopColor="#c9c2ff" stopOpacity="1" />
            <stop offset={st(travel + 0.07)} stopColor={color} stopOpacity="0" />
          </linearGradient>
        );
      })}
    </defs>
    {xs.map((x, i) => {
      const c1y = y0 - (y0 - y1) * 0.55;
      const d = `M 540 ${y0} C 540 ${c1y}, ${x} ${c1y + 30}, ${x} ${y1}`;
      const L = 900;
      const draw = tw(f, at + i * 3, 16, inOut);
      return (
        <g key={i}>
          <path d={d} fill="none" stroke="#cfd4da" strokeWidth={5} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
          {flow > 0 ? (
            <>
              <path d={d} fill="none" stroke={`url(#feed${i})`} strokeWidth={26} strokeLinecap="round" opacity={0.22 * flow} />
              <path d={d} fill="none" stroke={`url(#feed${i})`} strokeWidth={9} strokeLinecap="round" opacity={flow} />
            </>
          ) : null}
        </g>
      );
    })}
  </svg>
);

/* ============================================================ 17c. Laptop */

/** A flat MacBook frame: dark bezel, white screen, thin deck with a notch — "runs on your machine". */
export const Laptop: React.FC<{w?: number; h?: number; t?: number; children?: React.ReactNode}> = ({w = 900, h = 560, t = 1, children}) => (
  <div style={{position: 'relative', width: w + 90, height: h + 60, opacity: t, transform: `translateY(${mix(120, 0, t)}px)`}}>
    <div style={{position: 'absolute', left: 45, top: 0, width: w, height: h, borderRadius: 28, background: '#1a1d21', boxShadow: '0 50px 100px -30px rgba(31,35,40,0.45), 0 6px 14px rgba(31,35,40,0.08)', padding: 14}}>
      <div style={{width: '100%', height: '100%', borderRadius: 16, background: '#ffffff', overflow: 'hidden', position: 'relative'}}>{children}</div>
      <div style={{position: 'absolute', left: '50%', top: 4, width: 120, height: 14, borderRadius: '0 0 10px 10px', background: '#1a1d21', transform: 'translateX(-50%)'}} />
    </div>
    <div style={{position: 'absolute', left: 0, top: h - 2, width: w + 90, height: 30, borderRadius: '6px 6px 22px 22px', background: 'linear-gradient(180deg, #d8dbdf 0%, #b9bec4 100%)', boxShadow: '0 30px 60px -24px rgba(31,35,40,0.4)'}}>
      <div style={{position: 'absolute', left: '50%', top: 0, width: 150, height: 10, borderRadius: '0 0 8px 8px', background: '#a7acb2', transform: 'translateX(-50%)'}} />
    </div>
  </div>
);

const TOK_FILL = '#f6a218';

/** small token coins rising out of a bar top — "burned way fewer tokens" */
export const TokenRain: React.FC<{f: number; at: number; x: number; y: number; n: number; seed: number}> = ({f, at, x, y, n, seed}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const s = at + i * 3;
      const t = tw(f, s, 30, inOut);
      if (t <= 0 || t >= 1) return null;
      const dx = (rnd(i, seed) - 0.5) * 120;
      return (
        <div key={i} style={{position: 'absolute', left: x + dx - 16, top: y - t * 220 - 16, width: 32, height: 32, borderRadius: 16, background: '#fff3d6', border: `3px solid ${TOK_FILL}`, opacity: 1 - t, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontSize: 16, fontWeight: 800, color: '#c77d0a'}}>
          T
        </div>
      );
    })}
  </>
);

/* ── RosterGrid — people counted, not named ───────────────────────────────────────────
 * Ported 2026-09-24 from dubai-20260917's RosterCard (a "10 Legends / 10 Rising Stars"
 * line where no roster faces existed publicly). A white card of columns of person seats;
 * each column lights seat by seat from its own `at` frame. Use it only when real faces or
 * footage don't exist — real people beat an icon grid (Law 2). `hue` = C.coral or a brand hex.
 */
export type RosterColumn = {title: string; sub?: string; count: number; at: number; hue: string};

const RosterSeat: React.FC<{t: number; lit: number; hue: string; size: number}> = ({t, lit, hue, size}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.25, background: lit > 0.5 ? hue : '#f1f3f5', border: `2px solid ${lit > 0.5 ? 'transparent' : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...pop(t)}}>
    <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4.2" fill={lit > 0.5 ? '#fff' : '#c9ced4'} />
      <path d="M4 20.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" fill={lit > 0.5 ? '#fff' : '#c9ced4'} />
    </svg>
  </div>
);

export const RosterGrid: React.FC<{f: number; columns: RosterColumn[]; seat?: number; perRow?: number}> = ({f, columns, seat = 118, perRow = 3}) => {
  const card = tw(f, 0, 10);
  const gap = 20;
  const colW = perRow * seat + (perRow - 1) * gap;
  return (
    <div style={{...rise(card, 60), display: 'flex', gap: 56, padding: '40px 50px', borderRadius: 34, background: '#fff', border: `2px solid ${C.line}`, boxShadow: '0 40px 80px -30px rgba(31,35,40,.24), 0 4px 10px rgba(31,35,40,.06)', fontFamily: UI}}>
      {columns.map((c, ci) => (
        <div key={c.title} style={{width: colW, paddingLeft: ci ? 28 : 0, borderLeft: ci ? `2px solid ${C.line}` : 'none'}}>
          <div style={{fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', opacity: tw(f, 6, 8)}}>{c.title}</div>
          {c.sub ? <div style={{fontSize: 26, color: C.sub, marginTop: 4, opacity: tw(f, 10, 8)}}>{c.sub}</div> : null}
          <div style={{display: 'grid', gridTemplateColumns: `repeat(${perRow}, ${seat}px)`, gap, marginTop: 26}}>
            {Array.from({length: c.count}).map((_, i) => (
              <RosterSeat key={i} size={seat} t={tw(f, 4 + i * 2, 8)} lit={tw(f, c.at + 6 + i * 3, 6)} hue={c.hue} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export {GatewayFlow} from './gateway-flow';

export {ShineBorder} from './shine-border';
export {AnimatedTabs} from './animated-tabs';
export {OrbitingCircles} from './orbiting-circles';

export {IntegrationBeam,MagneticDock,LogoConveyor,SpotlightCard,ImageComparison} from './approved-visuals';
export {NumberedFanIn, ScreenFocus, TerminalCounter, FilesToDoc, TableScroll, TokenStat, LogoRoster, OrbitRing, ModelSwitcher, SwitcherCards, REEL_TEMPLATE_PRESETS} from './reel-templates';
