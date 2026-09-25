import React from 'react';
import {B01Hook, B02Build, B03Connect, B04Install, B05Rip} from './beats';

/**
 * THE ONE FILE A BUILD EDITS FOR TIMING. Everything else derives from it.
 *
 * Frames are 30fps. Every beat start sits on the first frame of the VO word it
 * illustrates (read it off transcript.json — never a duration formula). Consecutive
 * beats overlap by 2 frames; the later beat draws on top, so the boundary is a hard cut.
 *
 * `scripts/plan_beats.py` writes the BEATS table and beat stubs from a plan.tsv; edit
 * here afterwards.
 */

/** the VO's own length in frames, trimmed to the last word BEFORE the facecam CTA */
export const REEL_FRAMES = 450;

/** [component, start frame, end frame] */
export const BEATS: [React.FC<{len: number}>, number, number][] = [
  [B01Hook, 0, 82], //        Claude Code just got a huge upgrade
  [B02Build, 80, 182], //     build a full website from one prompt
  [B03Connect, 180, 270], //  connect it to your tools
  [B04Install, 268, 362], //  install the CLI
  [B05Rip, 360, REEL_FRAMES], // and let it rip
];

/**
 * [file (public/sfx/<file>.mp3), absolute frame, gain]. Files are normalised near 0 dBFS,
 * so gains sit at 0.022–0.04: click/haptic 0.026–0.032, whoosh 0.026–0.03.
 * Cue meaningful authored actions, not every cut. First cue inside 5s. Replace these safe
 * placeholders with a bespoke Apple-style ElevenLabs palette after animation is final.
 */
export const SFX: [string, number, number][] = [
  ['click-soft', 0, 0.028],
  ['whoosh', 78, 0.028],
  ['click-soft', 100, 0.028],
  ['whoosh-short', 178, 0.026],
  ['click-soft', 220, 0.028],
  ['whoosh', 266, 0.028],
  ['click', 290, 0.03],
  ['whoosh-short', 358, 0.026],
  ['click-soft', 402, 0.028],
];

/** frame ranges that carry NO caption (a finished-site reveal plays clean) */
export const NO_CAPTION: [number, number][] = [];

/** word groups that must stay whole on one caption pill */
export const ATOMIC: string[][] = [
  ['Claude', 'Code'],
  ['GPT-6', 'Astra'],
  ['open', 'source'],
  ['one', 'shot'],
];

/** a brand Whisper split into pieces → one word, e.g. "code base" → "codebase" (keeps trailing punctuation) */
export const GLUE: [string[], string][] = [
  [['code', 'base'], 'codebase'],
];

/** Whisper misspelling → brand spelling (whole-word, case-insensitive) */
export const FIXES: [string, string][] = [
  ['Cloud', 'Claude'],
  ['Seathdance', 'Seedance'],
  ['referrer', 'Refero'],
];
