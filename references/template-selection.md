# Approved template selection — script meaning → short-form b-roll

This is the planning reference for the 26 approved templates: 16 audition templates (2026-09-24) plus 10 reel templates (2026-09-25, section below). Choose from the
text below: **do not open demo videos, galleries, old projects, screenshots of templates,
or component source just to decide suitability.** Read the chosen component's source only
when implementing or changing it. A newly built video's visual QA still happens after rendering.
`template-library.json` is the authority for approval/exclusion status and implementation paths.

## Choose by the point of the section

Identify the one thing the viewer should understand from the spoken line. The section label
(hook, feature, how-to, proof, payoff) is a clue, not a mandate to use a different animation.
Use a template only when its visual supports that meaning. Real footage or a clear product
screen may be the best b-roll; no template has to be forced into every section.

- **Hook / product reveal:** make the actual tool or result the hero. A moving ShineBorder
  around real b-roll, or a brief GlareSweep across a strong result, can support the reveal.
  Use MagneticDock only if opening an app is the point; PhoneReveal only for a mobile use case.
- **Feature / capability:** match the relationship: integrations → IntegrationBeam;
  ecosystem around one hub → OrbitingCircles; many supported tools → LogoConveyor.
- **How-to / input:** use the specific approved action that is being described:
  choose → AnimatedTabs; open an app → MagneticDock; inspect an attachment → AttachmentPopover.
  An unrelated software interaction is not useful b-roll merely because it moves.
- **Demonstration / proof:** show the result itself: before/after → ImageComparison;
  assembling a website/gallery → MosaicAssembly; one relevant detail → DrawnEmphasis.
- **Workflow / transformation:** a reference becoming a site → ReferenceToWebsite;
  an asset passing through several tools → AssetRelay. IntegrationBeam is for connections/data
  flow, not an asset changing form.
- **Payoff:** ConfettiReveal can punctuate a real completed result. Use it sparingly and only
  when completion/success is the point. The spoken comment-keyword CTA remains facecam:
  end motion graphics before it; none of these templates is a CTA animation.

## Approved templates — complete suitability map

| Template | Use for this meaning / section | What moves; what must be supplied | Poor fit / distinction |
|---|---|---|---|
| **ShineBorder** | Frame real b-roll, a product screen or a hero result; hook, feature or proof | Colour highlight travels around the edge of existing media. Supply a real clip/screenshot/card. `Broll` already includes it. | A border adds emphasis; it does not explain a feature by itself. Do not create an empty border scene. |
| **AnimatedTabs** | A real choice among a few tools, modes or outputs; selection/how-to | Active background travels between supplied icon-led `items`; set `selectAt` to the actual choices. | Use for choosing one option, not a text-heavy feature list or an inventory of dozens of tools. |
| **OrbitingCircles** | One central tool with an ecosystem, multiple connected tools, or surrounding capabilities; overview | Real marks orbit a central subject continuously. Supply orbit children and a centre mark in a positioned container. | Shows a hub relationship, not ordered steps, data direction or before/after improvement. |
| **IntegrationBeam** | Tools connect, feed a hub, or send data to an output; integration feature | Paths draw and packets visibly travel through supplied real `logos`. | Choose over orbiting circles when direction/transfer matters. Does not demonstrate that a site was built or edited. |
| **MagneticDock** | Open or launch a desktop app and reveal its output; transition into a demo | Cursor sweeps across marks, returns to centre, clicks, then a window expands. Supply `logos` and a real `screen`/output. | Desktop only. Not a phone interaction or a decorative row of logos. |
| **LogoConveyor** | Breadth: many supported apps, integrations, models or tools; overview/feature | Two opposing rows of real `logos` move at the approved `speed=2`. | Shows variety, not selection, ranking, a workflow or proof of a specific integration. |
| **SpotlightCard** | Direct attention to one tool within a small set; feature emphasis | A pointer-following light emphasizes individual supplied logo tiles. | Best for focusing attention among options. Use DrawnEmphasis for a precise region inside an existing screenshot/image. |
| **ImageComparison** | Website upgrade, before/after quality, redesign or image improvement; proof | A moving divider reveals `before` versus `after`, or `image` versus `imageB`. Supply a genuinely comparable pair. | Stronger choice than a build animation when the sentence claims improvement. Do not fabricate benchmark evidence. |
| **AttachmentPopover** | Inspect the reference image/file being used in a chat; input/how-to | An image thumbnail opens to 900px, matching the real composer width. Supply `image` plus a freshly verified `composerSrc`. | An attachment preview, not an upload-progress demo or finished website. Use ReferenceToWebsite when the transformation is the point. |
| **GlareSweep** | Brief polished emphasis over a beautiful image or real result; reveal/payoff | Reflective highlight crosses supplied `image` or `screen` in **one second per pass**. | This is a surface highlight, not ShineBorder's edge effect. It should support compelling media, not compensate for an empty/static idea. |
| **MosaicAssembly** | A website coming together; website-building feature/result. Image mode for image-generation subjects | Six pieces converge and continue into scroll/selection. Default `mode="website"` takes `screen`; `mode="images"` takes `image` and `imageB`. | Do not use the rejected drag-to-rearrange template. Choose ImageComparison for improvement, or ReferenceToWebsite for reference→site transformation. |
| **DrawnEmphasis** | “This part”, a specific setting, output detail or region that matters; explanation/proof | A hand-drawn circle traces around supplied coordinates on an existing asset. Set `cx`, `cy`, `rx`, `ry`, `start`, `duration`. | Transparent overlay: no enclosing rectangle or text required. Does not provide the underlying asset and should not circle irrelevant details. |
| **PhoneReveal** | A mobile app/gallery experience or image result on a phone; mobile feature/demo | Lower phone at y=820, gallery scroll, photo opens out, then swipe. Supply two images; optional `screen` replaces the phone content. | **No mouse cursor.** This version's opening/swipe is image-based; do not pretend it simulates arbitrary app controls. |
| **ConfettiReveal** | A meaningful task is finished and a result is ready; payoff | Completion ring opens into supplied result `screen`, with two timed confetti bursts. | Not an error, ordinary intermediate step, continuous background decoration, or the spoken CTA. |
| **ReferenceToWebsite** | “Turn this reference/image into a website”; transformation/demo | Reference image moves through a real current composer and wipes into supplied website `screen`. Supply `image`, output, and refresh the composer capture. | More specific than generic website assembly. Do not use it when no image-to-site relationship is described. |
| **AssetRelay** | One asset passes through several tools to become a finished output; workflow/feature | Image moves through three marks, then expands into the result. Supply `image` and result `screen`; use the actual workflow's marks. | Different from static integrations: the asset's journey is the idea. Current mark choices are in the component, not a public `logos` prop. |

## Fast tie-breaks

- “It builds you a website” → MosaicAssembly. “It turns **this screenshot** into a website”
  → ReferenceToWebsite. “It makes your old website look better” → ImageComparison.
- “Works with all your tools” → LogoConveyor for breadth, OrbitingCircles for one hub,
  IntegrationBeam for directional connections. “It moves your image through these tools”
  → AssetRelay. Do not treat these as interchangeable logo animations.
- “Look at this result/detail” → show the actual result; add GlareSweep for a brief visual
  highlight or DrawnEmphasis for a precise region. Neither requires inventing another UI.
- “Use it on your phone” → PhoneReveal if the described image/gallery action fits;
  otherwise real mobile footage. Never substitute a desktop cursor interaction.

## Implementation facts needed before opening code

- Import these 16 names (and the 10 reel templates below) from `starter/src/devices/index.tsx` (`./devices` in a build).
  `Broll` comes from `kit`; it is the footage wrapper using ShineBorder, not a 17th approval.
  CurrentChatComposer, Website and Iphone are supporting helpers, not separate approved scenes.
- Real media replaces demo photos/websites/logos. Image filenames resolve under
  `public/images/`; logo filenames under `public/logos/`; composer captures under `public/ui/`.
  Supply React content through `screen`/`before`/`after` where listed. A shared TypeScript props
  type does not mean every component consumes every prop; use only the bindings listed above.
- **Full action sequences** (IntegrationBeam, MagneticDock, SpotlightCard, ImageComparison,
  AttachmentPopover, MosaicAssembly, PhoneReveal, ConfettiReveal, ReferenceToWebsite, AssetRelay)
  use a 90-frame choreography. To fit a different beat length, map local frames to the full
  sequence: `f={localFrame * 89 / Math.max(1, len - 1)}`. This preserves the final action.
- **Do not stretch the fixed-speed effects with that mapping.** At 30fps, GlareSweep receives
  raw local `f` and repeats every 30 frames; LogoConveyor receives raw `f` with `speed=2`.
  ShineBorder's `duration` is seconds (default 3), separate from the one-second glass sweep.
  OrbitingCircles uses its own `duration` in seconds; AnimatedTabs uses explicit `selectAt`
  frame offsets; DrawnEmphasis uses explicit `start`/`duration` in frames.
- `Broll`: width936 × height526, centre y850, radius28; approved ShineBorder treatment.
  PhoneReveal: centre y820, width340. Preserve the caption-safe band y1180–1295; clip decorative
  overflow when necessary. No captions or edge labels are added by these templates.
- Chat-based scenes must use the current Claude, ChatGPT or Codex interface verified online.
  This is **product-source verification**, not a requirement to reopen a template preview.
  AttachmentPopover accepts `composerSrc`; ReferenceToWebsite currently calls the bundled
  CurrentChatComposer, so refresh its capture (and provenance) before use.

## Boundaries

Only the 16 audition names above plus the 10 reel templates below are approved. Rejected and unapproved variants
remain excluded as recorded in `template-library.json`; a similar name in old source or
`devices.md` is not approval. Older primitives can frame real content, but cannot be used
as a back door to revive rejected notification lists, rolling digits, generic interaction
demos or single-command terminal scenes. A real terminal capture may still be necessary
when the actual subject is a CLI; that is distinct from the rejected invented demo.

No new audition batch is authorized. If none fits the spoken point, use relevant real
footage/screens with the approved framing. Do not browse 21st or reopen the old gallery
merely because a match was not obvious. A new request can reopen sourcing.


## Reel templates — approved 2026-09-25 (Tyler)

Ten full-frame scenes ported from two reference reels (Ddjfv-WP9yo, DdeVVlpT9zW) and
revised over four review rounds. Pick from this text; the preview renders live in
`remotion-projects/ref-templates-20260925/out/templates/` only for the user's review.

**Contract for all ten**
- Import from `./devices` in a build. Each is a whole scene: it paints its own ground and
  reads the beat-local frame with `useCurrentFrame()`, so render it as the beat body inside
  the beat's `<Sequence>` (wrapping it in `<Beat len>` is fine; its ground is painted over).
- **Text-free by the user's instruction.** No captions, no headline or stat text, no tool names,
  no ordinals. Do not add any — the editor's caption track carries the words. The only text
  left is UI that belongs to the apparatus (terminal lines, table cells, INSTALLING / %).
- **Finished and ready: every template defaults to 5 s (`len` = 150 frames).** The choreography
  spreads over `len` and a slow push-in carries the scene to the cut, so there is no dead hold.
  Pass `len={len}` when the beat is not 150 frames; timings rescale (LogoRoster `per`,
  ModelSwitcher `hold`, SwitcherCards steps, scroll/push/scan lengths). ~3–6 s is the sweet spot.
- **Start from `REEL_TEMPLATE_PRESETS.<Name>`** (exported from `./devices`) — the exact approved
  props. Swap the logos; replace the FACTS listed at the top of `reel-templates/presets.ts` with
  the script's own. Nothing else needs tuning:
  `<OrbitRing {...REEL_TEMPLATE_PRESETS.OrbitRing} logos={[...]} len={len} />`
- Logos are real files in `public/logos/` (already bundled: powerpoint, excel, word, gemini,
  mistral, grok, kimi, notion, figma, lh_openai, lh_claude-color, lh_github, lh_anthropic…).
  Fetch missing ones with `scripts/fetch_logo.sh`; never draw or recolour a mark. Never put a
  copyrighted character/mascot in a hero slot.
- Placement is the user-approved and deliberately centred/lower: TokenStat, OrbitRing and
  TableScroll extend into the 1180–1295 caption band. Keep that placement; do not "fix" it.

| # | Template | Use for this meaning / section | What moves · what to supply · min beat | Poor fit / distinction |
|---|---|---|---|---|
| 1 | **TokenStat** | A big free allowance, quota, pricing or limit read from real docs ("7 billion free tokens", "free tier, no credit card"); hook or proof | Dark docs card (table built from props, no screenshot needed) scrolls slowly; a light sweep rotates around its rim; a blurred copy of the same doc is the ground. Props: `provider`, `note`, `baseUrl`, `headers`, `rows` (use the real numbers from the source), optional `shine`, `dim` (default 0.3). Default 5 s (`len`). | The number itself is spoken, not shown. Use ShineBorder when framing a real clip/screenshot instead of a docs table; TableScroll when one specific row matters. |
| 2 | **LogoRoster** | Listing several tools/models one by one as they are named ("ChatGPT, Gemini, GLM, Kimi… and more"); feature/overview | Each logo lands big centre, then shrinks into a row that grows underneath. Props: `logos: string[]` in spoken order, `per` frames per logo (default 14 → sync to the VO). Default 5 s (`len`). | Names are spoken, so timing matters: set `per` from the transcript. LogoConveyor = breadth without order; LogoRoster = the enumeration itself. |
| 3 | **OrbitRing** | One tool connects to / unlocks many models or services ("links Claude to 600+ models"); hub → ecosystem | Hero pops big in the centre, lifts, logos shoot out on spokes and the orbit keeps turning; tick ring and dotted halo fill clockwise. Props: `hero`, `logos` (6–8 reads best). Default 5 s (`len`). | OrbitingCircles = calm ongoing ecosystem; OrbitRing = the moment of connection plus scale. Not for data direction (IntegrationBeam). |
| 4 | **ModelSwitcher** | Automatic switching / fallback / trying many options before one wins ("when your limit runs out it switches model automatically"); how it works | App-icon tiles in a long row; the selection frame scrolls through several with a short beat on each, then settles green with a check. Props: `logos` (8–10), `stops` (indices visited; last = winner), `hold` frames per stop. Default 5 s (`len`). | AnimatedTabs = the user choosing among a few; ModelSwitcher = the system cycling automatically. |
| 5 | **SwitcherCards** | Handing off to the next model / stepping to the next option, a few times; how it works | Portrait cards with centred logos; frame steps ahead, the row slides to catch up, 3×, then turns green. Props: `logos`, `start` index, `steps`. Default 5 s (`len`). | Calmer, card-style sibling of ModelSwitcher; pick one per video, not both. |
| 6 | **NumberedFanIn** | Opening a numbered listicle ("these 5 free plugins"), N things for one tool; hook | Numbers 1..N arc in, arrows draw into the hero mark, the mark spins in, keeps turning and kicks as each arrow lands; install bar fills, then a slow push to the cut. Props: `hero`, `count`, `barLabel` (default INSTALLING), `bg` (default beige). Default 5 s (`len`). | Only when a count is the promise. One per video, at the top. |
| 7 | **ScreenFocus** | "Look at this part" of a real screenshot/README/settings page; proof/explanation | Screenshot floats over its own blur, accent box draws round the region, gentle push-in (zoom 1.08). Props: `src` (public path), `imgW`, `imgH`, `focus {x,y,w,h}` in image px, `accent`, `zoom`. Default 5 s (`len`). | DrawnEmphasis = hand-drawn circle on an existing frame; ScreenFocus = rectangular region + push-in with its own blurred ground. |
| 8 | **TerminalCounter** | You type one prompt and an agent searches/installs from a large library ("searches 100,000 skills and installs the best ones"); how-to/proof | Narrow dark terminal: prompt types, "Starting agent…", scan line counts up with a bar, green result line; the window slowly scales up in place. Props: `prompt`, `scanLabel`, `countTo`, `result`, `title`. Default 5 s (`len`). | This is an agent scanning at scale, not the rejected single-command terminal demo. Use a real capture when the CLI UI itself is the subject. |
| 9 | **FilesToDoc** | Several input formats become one clean output ("turns PowerPoint, Excel and Word into clean markdown"); transformation | Source logo tiles appear centred, dashed brand-coloured connectors draw down into a document whose lines fill in, while the whole scene lifts; strong expo ease. Props: `sources [{logo, color}]` (2–4), optional `lines` widths. Default 5 s (`len`). | IntegrationBeam = ongoing data flow between tools; AssetRelay = one asset through tools; FilesToDoc = many formats → one file. |
| 10 | **TableScroll** | A reference list/table where one entry matters ("covers the whole dev cycle… this one handles TDD"); proof | Dark table card (centred) scrolls up; an accent frame draws around `focusRow`. Props: `headers` (3), `rows` (3-col), `focusRow`, `accent`, optional blurred `ground` image. Default 5 s (`len`). | Use ScreenFocus when you have a real screenshot rather than table data; TokenStat when the whole doc is the payoff. |

**Fast tie-breaks (reel templates)**
- "It has a huge free allowance" → TokenStat. "It connects to hundreds of models" → OrbitRing.
  "It supports ChatGPT, Gemini, Kimi…" (named one by one) → LogoRoster.
- "When one runs out it switches automatically" → ModelSwitcher (fast, many) or SwitcherCards
  (calm, a few). "You pick which one" → AnimatedTabs.
- "These N free tools" at the top → NumberedFanIn, then one scene per item.
- "Turns your files into X" → FilesToDoc. "You type one line and it finds/installs the best
  ones" → TerminalCounter. "This part of the page" → ScreenFocus. "This entry in the list" → TableScroll.
