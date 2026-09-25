import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ORANGE} from './devices/orange-scene';
import {Mascot, MascotKind} from './mascots';

/** Every saved Clawd animation on one reusable review composition. */
export const MASCOT_KINDS: MascotKind[] = ['laptop', 'football', 'walk', 'gym', 'flag', 'confetti'];

export const MascotSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: ORANGE.bg, fontFamily: 'Menlo, monospace', fontSize: 30, color: '#59636e'}}>
      {MASCOT_KINDS.map((kind, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <div key={kind} style={{position: 'absolute', left: 60 + col * 500, top: 120 + row * 440, width: 460, height: 400}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, borderBottom: '2px solid #c9bfae'}} />
            <div style={{position: 'absolute', left: 0, bottom: 62, right: 0, display: 'flex', justifyContent: 'center'}}>
              <Mascot kind={kind} f={f} h={240} walk={120} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center'}}>{kind}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
