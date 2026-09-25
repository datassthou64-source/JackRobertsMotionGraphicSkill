import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Beam, ClickAt, Composer, countTo, Counter, Menu, ProgressRing, SiteMock, StepChips, Terminal} from '../devices';
import {Mascot} from '../mascots';
import {Abs, AppIcon, Beat, C, Glow, inOut, Logo, mix, Pill, pop, Ring, rise, tw, Win} from '../kit';

/**
 * DEMONSTRATION BEATS — replace every one of them. They exist so the starter renders
 * and so each device has one working example to copy. One beat = one idea = one
 * object. Header comment on every beat: number ─ the spoken words ─ the visible action.
 *
 * Every beat receives `len` (its length in frames) and reads the beat-local frame with
 * useCurrentFrame(). Nothing settled sits in 1180–1295.
 *
 * Transitions: every beat is a hard cut + speed ramp. The hero is fully on screen at frame 0
 * and the `ramp` (varied per beat: y, x, scale, rotate) carries it in — never an opacity
 * lead-in on the hero. `rise`/`pop` are only for secondary items that land later in the beat.
 */

type BeatProps = {len: number};

/* 1 ─ "Claude Code just got a huge upgrade" ─ the mark lands, the name lands under it, Clawd types
   underneath (Claude is named → Clawd is on screen from the cut) */
export const B01Hook: React.FC<BeatProps> = ({len}) => {
  const f = useCurrentFrame();
  const icon = tw(f, 0, 10);
  const name = tw(f, 12, 9);
  return (
    <Beat len={len} first>
      <Glow x={540} y={600} r={620} color="rgba(217,119,87,0.28)" o={icon} />
      <Abs x={540} y={560}>
        <div style={{transform: `scale(${mix(0.86, 1, icon)})`}}>
          <AppIcon file="lh_claude-color.svg" size={360} />
        </div>
      </Abs>
      <Abs x={540} y={1045}>
        <Mascot kind="laptop" f={f + 45} h={190} />
      </Abs>
      <Abs x={540} y={850}>
        <div style={rise(name)}>
          <Pill size={46}>
            <Logo file="lh_claude-color.svg" size={52} />
            <span style={{fontWeight: 700}}>Claude Code</span>
          </Pill>
        </div>
      </Abs>
    </Beat>
  );
};

/* 2 ─ "build a full website from one prompt" ─ one browser window, a site assembling block by block */
export const B02Build: React.FC<BeatProps> = ({len}) => {
  const f = useCurrentFrame();
  return (
    <Beat len={len} dots ramp={{y: [420, 0]}}>
      <Abs x={540} y={640}>
        <div>
          <Win w={900} h={764} url="northbound.travel">
            <SiteMock f={f} start={6} spec={{brand: 'Northbound°', headline: 'Beyond ordinary travel.', sub: 'Private flights, shaped around the way you actually move.', nav: ['Fleet', 'Routes', 'Members'], cta: 'Book a flight', primary: 'Start planning', secondary: 'See the fleet', stats: ['12 jets', '40 cities', '24/7 crew']}} />
          </Win>
        </div>
      </Abs>
    </Beat>
  );
};

/* 3 ─ "connect it to your tools" ─ two marks, a beam draws between them, Connected */
export const B03Connect: React.FC<BeatProps> = ({len}) => {
  const f = useCurrentFrame();
  const b = tw(f, 8, 10);
  const ok = tw(f, 40, 9);
  return (
    <Beat len={len} dots ramp={{x: [-300, 0]}}>
      <Beam x1={300} y1={620} x2={780} y2={620} f={f} start={14} bend={-160} />
      <Abs x={260} y={620}>
        <div>
          <AppIcon file="lh_claude-color.svg" size={250} />
        </div>
      </Abs>
      <Abs x={820} y={620}>
        <div style={pop(b)}>
          <AppIcon file="lh_github.svg" size={250} />
        </div>
      </Abs>
      <Ring x={820} y={620} t={tw(f, 40, 16)} r={210} color={C.green} />
      <Abs x={540} y={930}>
        <div style={rise(ok, 30)}>
          <Pill size={44} border="rgba(31,136,61,0.45)" bg="#f3fbf5" fg={C.green}>
            <div style={{width: 20, height: 20, borderRadius: 10, background: C.green}} />
            Connected
          </Pill>
        </div>
      </Abs>
    </Beat>
  );
};

/* 4 ─ "install the CLI" ─ a composer picks the model, then the install line types in a terminal */
export const B04Install: React.FC<BeatProps> = ({len}) => {
  const f = useCurrentFrame();
  const menu = tw(f, 22, 8);
  const term = tw(f, 34, 10);
  return (
    <Beat len={len} ramp={{scale: [1.16, 1], origin: '540px 420px'}}>
      <Abs x={540} y={420}>
        <div>
          <Composer w={940} text="" placeholder="Ask Claude anything…" chips={['Opus 5', 'Extra high']} />
        </div>
      </Abs>
      <div style={{position: 'absolute', left: 120, top: 505}}>
        <Menu t={menu} items={[{n: 'Opus 5', d: 'Our most intelligent model'}, {n: 'Sonnet 5', d: 'Fast and capable'}, {n: 'Haiku 4.5', d: 'Quickest answers'}]} active={0} hover={0} />
      </div>
      <ClickAt f={f} from={[700, 700]} to={[210, 520]} start={8} />
      <Abs x={540} y={1000}>
        <div style={rise(term, 40)}>
          <Terminal f={f} h={230} lines={[{text: 'npm i -g @anthropic-ai/claude-code', at: 44, prompt: true, type: true}, {text: '✓ added claude-code', at: 68, color: '#3fb950'}]} />
        </div>
      </Abs>
    </Beat>
  );
};

/* 5 ─ "and let it rip" ─ one ring runs to 100, the steps light up under it */
export const B05Rip: React.FC<BeatProps> = ({len}) => {
  const f = useCurrentFrame();
  const p = tw(f, 2, 40, inOut);
  const stars = countTo(f, 50, 30, 12400, 100);
  return (
    <Beat len={len} last ramp={{rotate: [-6, 0], origin: '50% 70%'}}>
      <Abs x={540} y={560}>
        <ProgressRing p={p} label="Building" doneLabel="Site is live" size={640} />
      </Abs>
      <Abs x={540} y={1000}>
        <StepChips f={f} steps={[{n: 'Layout', at: 6}, {n: 'Images', at: 16}, {n: 'Video', at: 26}, {n: 'Deploy', at: 36}]} />
      </Abs>
      <Abs x={540} y={1110}>
        <div style={{opacity: tw(f, 50, 8)}}>
          <Counter value={stars} suffix=" stars" size={64} color={C.sub} />
        </div>
      </Abs>
    </Beat>
  );
};
