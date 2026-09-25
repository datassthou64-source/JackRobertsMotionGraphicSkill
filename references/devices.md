# Device catalogue — VO phrase → what goes on screen

For **selection**, read `template-selection.md`: it describes all 16 approved templates,
their suitable script sections and required assets without opening a demo or source file.
`template-library.json` owns approval/exclusion status. The older table below is an API
reference, not an approval list or a default scene plan; its generic Composer, NotifStack,
Counter, Terminal and other demo suggestions do not override later rejections or the real-UI
rule. Do not open the demo-beat references to decide suitability.

## Kit (primitives)

| Import | What | Key props |
|---|---|---|
| `Beat` | the beat wrapper: ground + hard cut + speed-ramped content (no fade) | `len`, `dots`, `dark`, `ramp` (`{scale\|x\|y\|rotate: [from,to], origin}` or `false`) |
| `Abs` | place a child centred on (x, y) | `x y center` |
| `Card` | white card, hairline, house shadow | `w h r dark` |
| `Win` | macOS window; `url` draws a browser pill | `w h dark title url bar` |
| `AppIcon` | squircle holding a real SVG mark | `file size bg pad` (`pad` is a fraction, default `0.2`) |
| `RasterIcon` | a PNG that already is the tile | `file size` |
| `Logo` | bare mark | `file size` |
| `Pill` | chip inside the apparatus | `size bg fg border` |
| `Footage` | sourced clip in a rounded frame | `clip w h r from rate zoom ox oy pos` |
| `Cap` | screenshot in a rounded frame | `file w h r imgStyle` |
| `Cursor` `Ring` `Glow` `Check` `Sparkle` | actors and micro marks | |
| `tw mix rise pop typed rnd path pressAt countTo` | the frame math | |

## Devices

| VO says… | Device | Demo beat | Notes |
|---|---|---|---|
| a product / model / tool is named (hook) | `Glow` + `AppIcon` 420 + `Pill` name | B01Hook | the name lands 12 frames after the mark |
| "builds a website / landing page / app" | `Win` + `SiteMock` | B02Build | blocks stagger 2 frames apart; pass `image` for a real media slot |
| "connect / integrate / plug X into Y" | `Beam` between two `AppIcon`s + `Ring` + green `Pill` | B03Connect | beam draws 14 frames, pulse loops after |
| "install / run this command / CLI" | `Terminal` with a typed prompt line + a green result line | B04Install | `dark` window, no `dark` beat needed |
| "pick / select / switch to the model / setting" | `Composer` + `Menu` + `ClickAt` | B04Install | the check on the active row fades in with `checkT` |
| "type / paste / send this prompt" | `Composer` with `text={typed(...)}` and `caret`, `sendT` on the button | — | `FileChip` children = attachments |
| "attach a file / reference / image" | `FileChip` popping into a `Composer` | — | thumb = a real still |
| "clients pay / stars roll in / notifications" | `NotifStack` | — | 3 rows, 14 frames apart, amounts in green |
| a big number, a count, a price, a percentage | `Counter` with `countTo` | B05Rip | ≥ 140px when it is the hero, tabular nums |
| "builds / deploys / runs to completion / let it rip" | `ProgressRing` + `StepChips` | B05Rip | ring 40 frames `inOut`; chips light 10 frames apart |
| "generates images / a gallery of / dozens of" | `ImageCluster` around a centre `AppIcon` | — | 5–6 stills, 3 frames apart, sizes 200–300 |
| "a clear visual direction / design tokens / brand" | `TokenRow` under a `Cap` of the reference | — | swatches sampled off the real reference |
| "time spent / budget / versions" | `Slider` | — | thumb travels with `inOut` |
| "every AI site looks the same / a pile of versions" | `CardFan` | — | render prop draws each card |
| "Claude Code" / "your own Claude" / Claude *doing* something | `OrangeScene` (Clawd on a real terminal, scale-settle cut) or `<Mascot kind=…>` on any device | orange-scene-template project | six Clawd animations, `references/mascots.md`; stand it on a surface with `FEET[kind]` |
| a real product's real screen | `Cap` inside `Win`, `push-in` 1.0→1.08 | — | paint over only what the beat changes |
| the subject's own film / keynote / demo | `Footage` 980 wide, r 40, `zoom 1.1` | — | pick the 1.5–3s that IS the topic (asset-sourcing.md) |
| "this / that specific thing" (pointing) | `Ring` on the target + `Cursor` | — | one annotation per beat, never stacked |
| a cost / token comparison, "X% cheaper", a benchmark result | `CostChart` | — | one chart across many beats: raise `reveal`, pop `badges`, swap `metric` $→tokens |
| a dark dashboard / findings / terminal-heavy | `<Beat dark>` + `Win dark` | — | counts toward the 20% dark budget |

## Beat skeleton

```tsx
/* 07 ─ "and select GPT-6 Astra" ─ the real composer; model chip opens the picker */
export const B07Picker: React.FC<BeatProps> = ({len}) => {
  const f = useCurrentFrame();
  const comp = tw(f, 0, 10);
  const menu = tw(f, 22, 8);
  return (
    <Beat len={len}>
      <Abs x={540} y={520}><div style={rise(comp)}><Composer w={940} chips={['GPT-6 Astra', 'Extra high']} /></div></Abs>
      <div style={{position: 'absolute', left: 120, top: 600}}><Menu t={menu} items={[{n: 'GPT-6 Astra', d: 'Most intelligent'}, {n: 'GPT-6 mini'}]} active={0} hover={0} /></div>
      <ClickAt f={f} from={[700, 760]} to={[200, 615]} start={8} />
    </Beat>
  );
};
```

Rules the skeleton encodes: header comment = number ─ spoken words ─ visible action; every
entrance is a `tw` offset from the beat start (not a duration formula); one `Abs` per object;
`rise` for objects, `pop` for chips; the cursor arrives 4 frames before it moves.

## Adding a device

When new sourcing is requested and the user approves the resulting pattern, add it to
`starter/src/devices/index.tsx`, `template-library.json` and the complete suitability map in
`template-selection.md`. Unapproved patterns stay in their audition project. It must: take `f` + `start` (or a 0→1 `t`), keep no state, use no CSS animation, draw
flat. The next build then costs nothing for that device.

## Broll frame (kit) — footage that doesn't fill the frame

`<Broll clip="name" f={f} len={len} from={s} />` — the house b-roll treatment from the
approved CodeRabbit build: the same clip blurred + dimmed as a full-bleed backdrop, the sharp
clip in a 936×526 card centered at y=850, the approved Magic UI `ShineBorder` (purple/pink/peach,
5px, three-second sweep), 6% push-in over the beat. The old blue stroke/glow was retired
by the user on 2026-09-24. Needs `clips/<name>-bg.mp4`:

    ffmpeg -i clips/X.mp4 -an -vf "scale=-2:960,crop=540:960,gblur=sigma=14,eq=brightness=-0.22:saturation=0.85" -r 30 -g 1 -c:v libx264 -crf 22 -pix_fmt yuv420p clips/X-bg.mp4

Stack a `PillRow` of real marks / module names at y≈990 under it when the VO names things
(see trueforge-20260917 beats 06–09). The user asked for this treatment on every non-fullscreen
b-roll (2026-09-17).

## Added from trueforge-20260917 (2026-09-17)

| Device | VO phrase | Notes |
|---|---|---|
| `StarButton` | "N stars on GitHub" | dark ☆ Star · count · mark pill, `lit` fills the star |
| `ClaudeCodeTerm` | "Claude Code" | the v2 welcome screen, drawn (dashed coral panels, Clawd) — placeholder name/paths |
| `Orbit` | "connects to / customizable / swap out / any model" | harness in the middle, inner ring beamed, outer ring counter-orbiting; `swap` throws a tile out and flies a new one in; pass `spin` = absolute frame for continuity across cuts |
| `PromptFeed` | "same prompt to N machines" | Animated Beam (21st #919) port — rail draws, gradient streak loops |
| `Laptop` | "locally / on your machine" | flat MacBook frame, put anything inside; shrink the previous scene into it |
| `TokenRain` | "burned tokens" | coins rising from a bar top |
| `Menu` `icon` | model pickers | real marks per row |
| `Broll` + `PillRow` | any non-fullscreen footage | see the b-roll frame section above |

## Added from the 2026-09-19 batch (merged 2026-09-24)

| Device | VO phrase | Notes |
|---|---|---|
| `RosterGrid` | "10 X and 10 Y" / "N people from each…" | columns of person seats lit seat by seat from each column's `at`; `columns=[{title, sub, count, at, hue}]`. From dubai's RosterCard. Only when real faces/footage don't exist |
| `Broll` `rate` | a long source move in a short beat | `playbackRate` for both layers, e.g. `rate={1.5}` |
| `GLUE` (plan.ts) | Whisper splits a brand ("code base") | `[['code','base'], 'codebase']` rejoins it in `captions.ts`, keeping trailing punctuation |

## Gateway Flow (2026-09-24)

`GatewayFlow` from `devices/gateway-flow.tsx`: actual Meng To / ThreeUI component
25589 ported from 21st CLI source. 80 dotted Bezier streams and moving square particles
converge on a replaceable logo; `f`, `logo`, `logoSize`, `width`, `height`, `top`, `speed`,
`pulseAt` props. Frame-driven seeded canvas simulation preserves the original geometry
and shockwave forces. Black background is intentional for this requested component.
Example: `<GatewayFlow f={f} logo="chatgpt.svg" />`.
Five-second test + original MIT source: `remotion-projects/chatgpt-gateway-flow-20260924/`.
Source: https://21st.dev/@mengto/components/gateway-flow (Meng To / ThreeUI, MIT).

## Approved reusable visuals — 2026-09-24

- `ShineBorder`: default border for `Broll`; also reusable around screenshots, clips or cards. Props `f`, `duration`, `borderWidth`, `colors`. Magic UI, MIT.
- `AnimatedTabs`: icon-led selection strip. Props `items`, `f`, `selectAt`, `size`. Motion Primitives selected-background mechanism.
- `OrbitingCircles`: reusable flat brand/tool orbit. Props `children`, `f`, `radius`, `duration`, `reverse`, `iconSize`, `path`. Magic UI, MIT.

The user rejected Agent Plan, Dot Loader and Animated List for Jack's library. Prefer reusable
visual mechanisms that read instantly: one large object, real marks, few or no words.
Do not bring text-heavy dashboards, task lists or notification copy into future audition batches.
Attribution and original sources: `references/approved-component-sources.md`.

B-roll placement update (2026-09-24): default centre y=850, slightly above the
960px canvas centre. `Broll cy={...}` overrides it. Keep the bottom edge above y=1180.

## Approved interactive templates — 2026-09-24, round 2

Import from `devices` (implementation in `devices/approved-visuals/`).

| Component | Reuse | Props |
|---|---|---|
| `IntegrationBeam` | Animated tool → hub → output flow; visible packets, not static lines | `f`, `logos` |
| `MagneticDock` | Cursor sweeps left-to-right, returns to centre, clicks at f47, opens a window at f51–79 | `f`, `logos`, `screen` (React content) |
| `LogoConveyor` | Opposing logo streams at the approved 2× speed | `f`, `logos`, `speed` (default 2) |
| `SpotlightCard` | Light follows pointer, brightens/scales individual tiles, then returns to centre | `f`, `logos` |
| `ImageComparison` | Website upgrade, before/after media, quality comparison | `f`, `before`, `after` (React content), or `image`, `imageB` filenames |

Default website content is a fictional demonstration. Replace it with the actual subject’s
screens where available; never imply the demo is a real product screen.
`Broll` centre is now y=850 (a little above canvas centre), with `cy` override.
IDs 27–46 were reviewed in round 4; see the approved media actions and rejection list below.

## Approved media actions — 2026-09-24, round 4

The user approved all earlier refinements (including b-roll centre y=850). Four more reusable
mechanisms are now exported from `devices` and recorded in `template-library.json`:

| Component | Use | Main props |
|---|---|---|
| `AttachmentPopover` | Open an image to the same 900px width as the chat composer | `f`, `image`, `composerSrc` (fresh local capture) |
| `GlareSweep` | One-second highlight pass | `f`, `image`, `screen` |
| `MosaicAssembly` | Website construction by default; generated-image grid when the subject is image generation | `f`, `mode="website"` or `"images"`, `screen`, `image`, `imageB` |
| `DrawnEmphasis` | Circle any relevant region of an existing asset; no card or text required | `f`, `cx`, `cy`, `rx`, `ry`, `start`, `duration`, `rotation`, `color`, `opacity` |

The full AttachmentPopover and MosaicAssembly sequences use 90-frame choreography; map
`f={localFrame * 89 / Math.max(1, len - 1)}` for another length. GlareSweep receives raw
local frames to preserve its one-second pass; do not stretch it. DrawnEmphasis uses explicit timing.
Example: place an actual screenshot, then layer
`<DrawnEmphasis f={f} cx={710} cy={820} rx={150} ry={90} start={8} duration={28} />`.
Do not add an enclosing rectangle just to justify the annotation.

**Current chat UI is mandatory.** Before each new build using chat, open the current Claude,
ChatGPT or Codex interface online and use a real capture of the appropriate product. Save
URL, date and visible variant alongside it. `CurrentChatComposer` can render a local crop;
its bundled 2026-09-24 ChatGPT capture is a dated example, not proof of freshness for later
runs. Refresh it or pass `composerSrc` to AttachmentPopover. Never substitute a generic
invented chat box for a named product. Logged-out/public and signed-in variants can differ.

**Motion must continue through the beat.** Author an action sequence with an entrance,
interaction/transformation, and a transition/result/handoff. A zoom in/out over a static
screen is insufficient. Reuse mechanisms and swap their assets; do not redesign every run.
GlareSweep completes a pass in 30 frames (one second); audition loops repeat it. Keep footage and marks real,
text short, and movement related to what the viewer should notice.

Rejected (do not reuse): expanding image strip, unpacking image stack, progressive focus,
colour backlight, rolling digits, liquid button, model swap, pattern inspection, filtering
tool grid, outline lettering, overlapping tool cluster, single-command terminal and
video-filled lettering. Earlier Agent Plan, Dot Loader and Animated List rejections stand.
`PhoneReveal`, `ConfettiReveal`, `ReferenceToWebsite` and `AssetRelay` were approved in the
following round. `WorldRoutes` was never approved and is excluded. Gallery and renderable source:
`remotion-projects/21st-visual-templates-round4-20260924/`.


## Round-4 approvals confirmed and phone input rule — 2026-09-24

PhoneReveal, ConfettiReveal, ReferenceToWebsite and AssetRelay are now approved and exported
from `devices` (implementation: `approved-visuals/result-actions.tsx`). Previous pending
status for these four is superseded. All take `f` plus replaceable images/screens; refer to
source for props. PhoneReveal centres the device at y=820 and uses touch-style scrolling,
opening and swiping. **A phone never has a mouse cursor.** Use touch rings or no indicator.
Desktop pointers must act on the relevant control. GlareSweep now completes each pass in
one second; the three-second preview repeats it three times.

The audition process is closed at the user’s request. Round-5 IDs 49–61 were rejected; IDs
62–68 were not approved and are excluded. None of that new batch enters the reusable library.
Retain only the 16 approved templates recorded in `template-library.json`, including the
phone without a cursor and the one-second glass sweep. These are for engaging short-form
b-roll; generic interface demonstrations and catalogue availability are not selection criteria.


## Reel templates — 2026-09-25

Ten full-frame, text-free scenes in `starter/src/devices/reel-templates/` (exported from
`./devices`): TokenStat, LogoRoster, OrbitRing, ModelSwitcher, SwitcherCards, NumberedFanIn,
ScreenFocus, TerminalCounter, FilesToDoc, TableScroll. Meaning → template, props, minimum beat
lengths and distinctions live in `template-selection.md` ("Reel templates"); do not duplicate
them here. Usage: `const B07 = ({len}) => <OrbitRing hero="lh_claude-color.svg" logos={[...]} />;`
— the scene reads the beat-local frame itself. All default to 5 s; start from
`REEL_TEMPLATE_PRESETS.<Name>` and pass `len={len}`.
