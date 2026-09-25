import React from 'react';
import {Composition} from 'remotion';
import {REEL_FRAMES} from './plan';
import {Reel} from './Reel';
import {MascotSheet} from './MascotSheet';

/** Reel is always the clean, caption-free master. */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SfxOnly" component={Reel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} defaultProps={{vo: false}} />
    <Composition id="MascotSheet" component={MascotSheet} durationInFrames={240} fps={30} width={1080} height={1920} />
  </>
);
