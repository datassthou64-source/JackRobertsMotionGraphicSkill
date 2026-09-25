# Template catalogue

Everything a build can place on screen, in one list. Choose by **meaning** with
`references/template-selection.md` (full suitability map: what each is for, what it needs, poor fits);
`references/template-library.json` is the approval authority. Paths are relative to `starter/`.

## Approved templates (26)

| # | Template | What it does | File |
|---|---|---|---|
| 1 | **ShineBorder** | Animated border; default for Broll | `src/devices/shine-border.tsx` |
| 2 | **AnimatedTabs** | Icon selection strip | `src/devices/animated-tabs.tsx` |
| 3 | **OrbitingCircles** | Flat circular tool orbits | `src/devices/orbiting-circles.tsx` |
| 4 | **IntegrationBeam** | Paths draw in; packets flow through the hub to the output | `src/devices/approved-visuals/connections.tsx` |
| 5 | **MagneticDock** | Sweep right, return to centre, click at frame 47, expand the window | `src/devices/approved-visuals/connections.tsx` |
| 6 | **LogoConveyor** | Two opposing logo rows, default 2× speed | `src/devices/approved-visuals/connections.tsx` |
| 7 | **SpotlightCard** | Pointer-following light with individual tile emphasis | `src/devices/approved-visuals/images.tsx` |
| 8 | **ImageComparison** | Before/after media or website comparison | `src/devices/approved-visuals/images.tsx` |
| 9 | **AttachmentPopover** | Full-width image preview above a freshly verified real chat composer | `src/devices/approved-visuals/media-actions.tsx` |
| 10 | **GlareSweep** | One-second reflective sweep; repeat per second in three-second auditions | `src/devices/approved-visuals/media-actions.tsx` |
| 11 | **MosaicAssembly** | Website assembly by default; image-grid mode for image generation | `src/devices/approved-visuals/media-actions.tsx` |
| 12 | **DrawnEmphasis** | Transparent circle annotation over any logo, image, UI control or asset | `src/devices/approved-visuals/media-actions.tsx` |
| 13 | **PhoneReveal** | Touch-only phone scroll, image opening and swipe; centre y=820; no mouse cursor | `src/devices/approved-visuals/result-actions.tsx` |
| 14 | **ConfettiReveal** | Completion ring opens into a result with two staged confetti bursts | `src/devices/approved-visuals/result-actions.tsx` |
| 15 | **ReferenceToWebsite** | Reference-image handoff through a real current composer into a website result | `src/devices/approved-visuals/result-actions.tsx` |
| 16 | **AssetRelay** | Move one asset through tools and expand the finished result | `src/devices/approved-visuals/result-actions.tsx` |
| 17 | **TokenStat** | Dark docs/pricing table card with a rotating light sweep on its rim over a blurred, lightly dimmed copy of itself; no text overlay | `src/devices/reel-templates/scenes-b.tsx` |
| 18 | **LogoRoster** | Logos land one at a time big in the centre, then drop into a growing row | `src/devices/reel-templates/scenes-b.tsx` |
| 19 | **OrbitRing** | Hero pops centre, lifts, logos shoot out on spokes and keep orbiting; tick ring + dotted halo fill | `src/devices/reel-templates/scenes-b.tsx` |
| 20 | **ModelSwitcher** | Selection frame scrolls through a long row of model tiles, settles green with a check | `src/devices/reel-templates/scenes-b.tsx` |
| 21 | **SwitcherCards** | Portrait model cards; frame steps ahead, row catches up, three times, then green | `src/devices/reel-templates/scenes-b.tsx` |
| 22 | **NumberedFanIn** | Numbers 1..N arc in with arrows at a spinning hero mark; install bar fills | `src/devices/reel-templates/scenes-a.tsx` |
| 23 | **ScreenFocus** | Screenshot over its own blur; accent box draws round one region; gentle push-in | `src/devices/reel-templates/scenes-a.tsx` |
| 24 | **TerminalCounter** | Narrow agent terminal types a prompt, scan counts up with a bar, result line; slow in-place scale-up | `src/devices/reel-templates/scenes-a.tsx` |
| 25 | **FilesToDoc** | Source logo tiles start centred; dashed connectors draw down into one document as the scene lifts | `src/devices/reel-templates/scenes-a.tsx` |
| 26 | **TableScroll** | Dark reference table scrolls; accent frame lands on one row | `src/devices/reel-templates/scenes-a.tsx` |

## Scene template

| Template | What it does | File |
|---|---|---|
| **OrangeScene** | Beige ground, Clawd standing on a real Claude Code terminal, hard cut + 1.00→0.87 speed-ramp scale settle (the signature the whole transition system is measured from) | `src/devices/orange-scene.tsx` · `references/orange-scene-template.md` |

## Device library (`src/devices/index.tsx`)

Drawn apparatus for things that have no real screen yet: `Beam`, `Terminal`, `Menu`, `Composer`, `FileChip`, `NotifStack`, `Counter`, `ProgressRing`, `StepChips`, `SiteMock`, `ImageCluster`, `TokenRow`, `Slider`, `CardFan`, `ClickAt`, `CostChart`, `StarButton`, `ClaudeCodeTerm`, `Orbit`, `PromptFeed`, `Laptop`, `TokenRain`, `RosterGrid`.
Plus the kit (`src/kit.tsx`): `Beat` (hard cut + speed ramp), `Abs`, `Card`, `Win`, `AppIcon`, `RasterIcon`, `Logo`, `Pill`, `Footage`, `Cap`, `Broll`, `Cursor`, `Ring`, `Glow`, `Check`, `Sparkle`, and the frame math (`tw mix rise pop typed rnd countTo transitionSpeedRamp transitionSpeedRampStyle`). APIs: `references/devices.md`.

## Clawd mascots (`src/mascots/`)

`<Mascot kind f h />` — `laptop` (building/coding) · `football` (easy/playing) · `walk` (arriving) · `gym` (working hard) · `flag` (shipped/finished) · `confetti` (win/free/launch). Whenever Claude is spoken, a Clawd is on screen. Preview every kind with the `MascotSheet` composition. Details: `references/mascots.md`.

## Transitions

One transition, everywhere: **hard cut + transition speed ramp** (`<Beat ramp={{scale|x|y|rotate: [from, to]}}>`), with 14 frames of camera motion blur from `RampBlur` in `Reel.tsx`. No fades, crossfades, wipes or slides — `check_build.py` fails on them. Details: `references/transition-speed-ramp.md`.

## Bundled media

- `public/logos/` — real marks: Claude, Anthropic, OpenAI/ChatGPT, GitHub, Gemini, Grok, Kimi, Mistral, Notion, Figma, Word, Excel, PowerPoint, ByteDance, 21st, Refero, Higgsfield, Clawd. Fetch more with `scripts/fetch_logo.sh`.
- `public/sfx/` — dry UI cues; the approved defaults are `click-soft`, `click`, `whoosh-short`, `whoosh`.
- `public/mascots/` — Clawd sprite frames; `public/clips/claude-code-session.mp4` for OrangeScene; `public/images/scene-a.jpg`, `scene-b.jpg` demo photos for the image templates; `public/ui/` a dated ChatGPT composer capture (re-capture before real use).
