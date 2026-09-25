# Premium UI sourcing — 21st.dev and Refero

Two libraries feed the device catalogue. **21st.dev** (Magic UI / shadcn-class React
components, via the installed `21st` CLI) supplies *mechanisms* — beams, border lights, shimmer,
streaming rows, number tickers, dock/menu geometry. **Refero** (refero.design — real product
screens and its Styles library) supplies *layouts and taste* — how a premium landing page, a
pricing table, a composer, a settings menu actually looks in 2026. Neither is ever copied as-is;
both are raw material for the Trial system.

Never reference the sites *as sites* in a build unless the script names them. Reference the
components and layouts inside them.

## When to reach for them

Only when new sourcing is requested. First select using `template-selection.md`; routine
reuse does not require opening catalogue previews. Check the approved catalogue first — the reference
build needed exactly three ports (Beam, Menu, SiteMock) for 26 beats. Sourcing a component
costs tokens and a metered retrieval; reusing one costs nothing.

## 21st.dev — via the CLI (installed, `21st`)

Account is **free tier: 2 code retrievals/day, AI generation off**. Search is unmetered.
Never paste the API key anywhere; never run `21st generate`; never scrape pages.

```bash
21st usage --json                                   # freeRetrievalsRemaining before any `get`
21st search "animated beam integration" --type c --limit 6 --free --json
21st search "number ticker count up" --type c --limit 6 --free --json
21st search "border beam glow card light" --type c --limit 6 --free --json
21st get <id> --json                                # metered — only for the one finalist
21st logo "<brand>" --json                          # free svgl marks (fetch_logo.sh wraps it)
```

Search by the **visible action**, not the narration: "connect" → beam; "streams in" →
streaming rows / text shimmer; "one of many" → marquee / dock; "chooses" → command menu.
Shortlist ≤ 3, open the `previewUrl` (a still — cheap to look at), retrieve one.

Reject before retrieving when the component: needs a headline to make sense · is hover-only ·
is particles/decoration · goes small in 9:16 · demands a dark full-frame · adds a second idea.

Proven sources in the catalogue: **#919 Animated Beam** (dillionverma / Magic UI) → `Beam`;
Magic UI Number Ticker pattern → `Counter`+`countTo`; Border Beam → not yet ported (use for
"selected / live" card states if a beat needs one).

### Porting contract (React component → Trial device)

1. Keep **one mechanism**; drop the demo copy, badges, headings.
2. Time it with `useCurrentFrame()` → `tw()`. Replace `useEffect`/`requestAnimationFrame`/
   Framer Motion/CSS keyframes with frame math. Loops become `(f - start) % period`.
3. Replace Tailwind classes with inline styles using kit tokens (`C.*`, `cardShadow`, `UI`).
4. Replace `Math.random` with `rnd(i, k)`.
5. Recompose vertical: one big object at `HERO_Y`, 60px side margins.
6. Flat. Strip `perspective`, `rotateX/Y`, `translateZ`, blur-depth.
7. Add to `starter/src/devices/index.tsx` + a row in `devices.md` + a SOURCES line
   (`component name, id, author, license, what was borrowed`).

## Refero — via the browser (Chrome tools)

No API. Use `mcp__claude-in-chrome__*` only when a beat needs a layout the catalogue lacks:

- `refero.design` → search the pattern ("pricing", "onboarding", "AI chat composer",
  "empty state") → look at 3–5 real screens; note the geometry (column split, hero ratio,
  radius, button pairing). **Do not download their screenshots into a build** — they are
  other companies' UI. Draw the geometry with the kit.
- `styles.refero.design` (the Styles library) → when the script is about *aesthetic
  direction* (fonts, palettes, "make it not look like AI slop"), it is the vocabulary for
  `SiteMock` specs: a serif display headline, an ink pill CTA, a stat row, a media card right.

What Refero taught `SiteMock`: nav with a single dark pill CTA · 70px serif display line ·
a 22px muted sub ≤ 400px wide · primary dark + secondary outline buttons · media card
right at ~37% width · 3 equal stat tiles. Change the words, keep the proportions.

## Real product UI beats both

If the beat is about a *specific* product (ChatGPT's composer, Cursor's sidebar, a GitHub
repo page), neither library applies — capture the real screen (`asset-sourcing.md`) and
frame it in `Win`/`Cap`. The reference build's most convincing beats are painted-over
screenshots of the real Codex composer, not drawn composers.

## the user’s reusable-template selection — 2026-09-24

Prefer instantly legible visual mechanisms with replaceable logos, images, clips or a single
large value. Approved examples: Shine Border, Animated Tabs, Orbiting Circles. Reject
text-heavy agent plans, notification lists and the Dot Loader for Jack’s motion library.
When code retrieval quota is exhausted, use the author’s independently public repository
when available, recording original source and license. Never reconstruct from screenshots
just to avoid retrieving source. Keep audition candidates separate until the user approves them.


### Final audition feedback — 2026-09-24

The user ended the component audition process. Reuse the explicit approvals in
`template-library.json`; do not revive unapproved or rejected candidates. The objective is
engaging short-form b-roll. Merely animating a generic UI interaction (uploads, cropping,
sorting, colour picking, recording, file trees, trimming, menus, scheduling or export
steps) did not meet that objective. Evaluate whether the visual actually makes good
b-roll before sourcing more components, and only resume auditions on a new request.
