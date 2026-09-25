import words from './transcript.json';
import {ATOMIC, FIXES, GLUE} from './plan';

/**
 * Caption chunking — one or two words per grey pill, timed off the Whisper word list.
 * The look (Arial 800 / grey pill / y≈1236) lives in Reel.tsx; this file only decides
 * WHAT is on the pill and WHEN. Brand spellings and glued names come from plan.ts.
 */

export type W = {text: string; start: number; end: number};
export type Chunk = {text: string; from: number; to: number};

const FPS = 30;

/** Whisper splits names and misspells brands; glue and respell them the way the brands do. */
const normalise = (ws: W[]): W[] => {
  const out: W[] = [];
  for (const w of ws) {
    const t = w.text.trim();
    const prev = out[out.length - 1];
    if (prev && /^[-.]/.test(t)) {
      prev.text += t;
      prev.end = w.end;
      continue;
    }
    if (prev && prev.text.toLowerCase() === 'chat' && /^GPT/.test(t)) {
      prev.text = 'ChatGPT' + t.slice(3);
      prev.end = w.end;
      continue;
    }
    out.push({...w, text: t});
  }
  // multi-word glue (a brand Whisper split into pieces) → one word
  for (const [parts, joined] of GLUE) {
    for (let i = 0; i + parts.length <= out.length; i++) {
      if (parts.every((p, k) => out[i + k].text.replace(/[.,!?]+$/, '').toLowerCase() === p.toLowerCase())) {
        const tail = out[i + parts.length - 1].text.match(/[.,!?]+$/)?.[0] ?? '';
        out.splice(i, parts.length, {text: joined + tail, start: out[i].start, end: out[i + parts.length - 1].end});
      }
    }
  }
  return out.map((w) => {
    let text = w.text.replace(/[.,!?]+$/, '');
    for (const [bad, good] of FIXES) text = text.replace(new RegExp(`^${bad}$`, 'i'), good);
    return {...w, text};
  });
};

export const buildChunks = (untilFrame: number): Chunk[] => {
  const raw = words as W[];
  const ws = normalise(raw);
  const groups: W[][] = [];
  let i = 0;
  while (i < ws.length) {
    const atom = ATOMIC.find((a) => a.every((p, k) => ws[i + k]?.text.toLowerCase() === p.toLowerCase()));
    if (atom) {
      groups.push(ws.slice(i, i + atom.length));
      i += atom.length;
      continue;
    }
    const g = [ws[i]];
    const next = ws[i + 1];
    const startsAtom = next && ATOMIC.some((a) => a[0].toLowerCase() === next.text.toLowerCase() && a.every((p, k) => ws[i + 1 + k]?.text.toLowerCase() === p.toLowerCase()));
    const brk = /[.,!?]$/.test(raw.find((o) => o.start === ws[i].start)?.text.trim() ?? '');
    if (next && !startsAtom && !brk && next.start - ws[i].end < 0.35 && (ws[i].text + next.text).length <= 14) {
      g.push(next);
      i += 2;
    } else {
      i += 1;
    }
    groups.push(g);
  }
  const chunks: Chunk[] = groups.map((g, k) => {
    const from = Math.round(g[0].start * FPS);
    const nextFrom = groups[k + 1] ? Math.round(groups[k + 1][0].start * FPS) : from + 30;
    const to = Math.min(nextFrom, Math.round(g[g.length - 1].end * FPS) + 12);
    return {text: g.map((w) => w.text).join(' '), from, to};
  });
  return chunks.filter((c) => c.from < untilFrame).map((c) => ({...c, to: Math.min(c.to, untilFrame)}));
};
