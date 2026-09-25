/**
 * Approved sample props for every reel template (Tyler, 2026-09-25) — all render at 5 s (150 f).
 * Copy a preset, swap the logos (public/logos/…), replace any FACTS with the script's own, pass `len`
 * if the beat is not 150 frames. Nothing else needs tuning.
 *
 *   <OrbitRing {...PRESETS.OrbitRing} logos={[...]} len={len} />
 *
 * FACTS that must come from the script/source, never from these samples: TokenStat
 * provider/note/baseUrl/rows, TerminalCounter prompt/scanLabel/countTo/result, TableScroll rows,
 * ScreenFocus src/imgW/imgH/focus.
 */
const MODELS = ['lh_claude-color.svg', 'kimi.svg', 'gemini.svg', 'mistral.svg', 'grok.svg', 'lh_openai.svg', 'lh_github.svg', 'notion.svg', 'figma.svg', 'higgsfield-mark.svg'];

export const PRESETS = {
  TokenStat: {
    provider: 'Google Gemini',
    note: 'Free tier, no credit card. Free-tier prompts may be used by Google to improve products.',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    headers: ['Model', 'Context', 'Max out', 'Rate limit'],
    rows: [
      ['Gemini 3.7 Flash', '1M', '65K', '—'],
      ['Gemini 3.6 Flash', '1M', '65K', '15 RPM\n1,500 RPD'],
      ['Gemini 3.5 Flash', '1M', '65K', '15 RPM\n1,500 RPD'],
      ['Gemini 3.5 Pro', '1M', '65K', '5 RPM\n100 RPD'],
      ['Gemma 4 27B', '128K', '8K', '30 RPM\n14,400 RPD'],
      ['Gemini Embed', '8K', '—', '100 RPM'],
      ['Gemini 3 Flash Lite', '1M', '65K', '30 RPM\n1,500 RPD'],
    ],
  },
  LogoRoster: {logos: ['lh_openai.svg', 'gemini.svg', 'mistral.svg', 'grok.svg', 'kimi.svg', 'lh_github.svg']},
  OrbitRing: {hero: 'lh_claude-color.svg', logos: ['lh_openai.svg', 'gemini.svg', 'grok.svg', 'kimi.svg', 'mistral.svg', 'lh_github.svg', 'notion.svg']},
  ModelSwitcher: {logos: MODELS, stops: [0, 1, 2, 3, 4, 5, 6]},
  SwitcherCards: {logos: MODELS, start: 1, steps: 3},
  NumberedFanIn: {hero: 'lh_claude-color.svg', count: 5, barLabel: 'INSTALLING'},
  ScreenFocus: {src: 'stills/<capture>.jpg', imgW: 960, imgH: 470, focus: {x: 30, y: 190, w: 900, h: 150}, accent: '#f5b301'},
  TerminalCounter: {prompt: 'Build a SaaS website for the agency', scanLabel: 'Scanning skills', countTo: 100000, result: 'Installed 3 skills'},
  FilesToDoc: {
    sources: [
      {logo: 'powerpoint.svg', color: '#d35230'},
      {logo: 'excel.svg', color: '#107c41'},
      {logo: 'word.svg', color: '#185abd'},
    ],
  },
  TableScroll: {
    headers: ['Skill', 'What it does', 'Use when'] as [string, string, string],
    rows: [
      ['using-agent-skills', 'Maps work to the right skill workflow', 'Starting a session'],
      ['interview-me', 'One question at a time until ~95% clear', 'The ask is underspecified'],
      ['idea-refine', 'Divergent → convergent thinking', 'You have a rough concept'],
      ['spec-driven-dev', 'Writes a PRD: goals, commands, tests', 'Starting a new project'],
      ['test-driven-dev', 'Red-Green-Refactor, test pyramid', 'Implementing logic'],
      ['context-engineering', 'Right info at the right time', 'Output quality drops'],
    ] as [string, string, string][],
    focusRow: 4,
  },
};
