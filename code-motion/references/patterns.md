# Proven beat moves (from the approved Jev build)

Each is a starting idea, not a template — rewrite it for the new script's meaning and the new
brand. Line refs are the `/* Bn … */` blocks in `examples/jev-20260926/index.html`.

| Move | Use when the VO says… | How it's built | Block |
|---|---|---|---|
| **Brand loader** | "someone just gave this new AI…" — an arrival | the product's own loading window, stepped progress blocks + % count | B1 |
| **Halftone → photo resolve** | a named person | `halftoneImage()` with cell size 46→12 over 18f, then mosaic 12→1 over 8f, then the real frame | B2 |
| **Logo burst into a wall** | "their entire Instagram / channel / catalogue" | the mark alone at centre; 30 real thumbnails fly out from it, delay ∝ distance from centre | B3 |
| **Edit timeline, bladed** | "broke down every hook / structure", editing, cutting | preview monitor + filmstrip (14 real frames via yt-dlp + ffmpeg `fps=14/dur`) + waveform (peaks from `ffmpeg -ac 1 -ar 2000 -f s16le`); playhead sweep drives the monitor; blade lines, the hook segment lifts ×1.8, the rest spreads into 3 | B4 |
| **Receipt print** | a price / "for 17 cents" | paper strip translating out of a slot window, total counts `$0.00→$0.17` | B5 |
| **Name typed under the mark** | "it's called X" | real mark + crop marks (from the og-image), name typed with a block caret | B6 |
| **Prose vs typed answer** | "different from a regular AI" | top window pours grey lines forever; bottom window snaps one accent chip + confidence | B7 |
| **Sorter bins** | "sorts into categories" | real cards drop from a gate on an arc into three labelled bins, stacking | B8 |
| **Two-bar price gap** | "that's why it's so cheap" | the brand's own comparison numbers as two bars; the tiny one is the accent | B9 |
| **Drag and drop** | "just give it any…" | cursor grabs a fanned stack, drags (inOut), drops into a dashed zone that fills | B10 |
| **Labels land in sequence** | "labels every one" | grid of real items, a tag stamps onto each every 6f (scale 1.8→1) | B11 |
| **Choice fields lock** | "the topic, the hook and the structure" | three dropdown fields flick through options then lock accent, each on its spoken word, confidence bar fills | B12 |
| **Strike the old way** | "doesn't just hand you a spreadsheet" | sheet cells fill fast, an accent SVG line draws across it (`stroke-dashoffset`) on the noun | B13 |
| **Chart from the items** | "a chart of how every reel performed" | bars grow from real thumbnails, sqrt scale, unsorted, winner in accent | B14 |
| **Click the winner** | "see which ideas actually win" | three cards, cursor travels + clicks the centre one, ring lands, views count up, sides desaturate | B15 |
| **Type your handle** | "point it at your own account" | field types `@yourhandle` with caret, cursor clicks Analyze, button flips to accent | B16 |
| **Self-sorting grid** | "which of your videos performed best" | 9 tiles FLIP-travel to their rank positions (inOut, #1 arcs up), #1 badge + accent border | B17 |
| **Scrub to the reason** | "understand the reason behind it" | waveform bars fill accent up to the hook segment as the playhead scrubs, tag + "94% sure" | B18 |
| **⌘C duplicate** | "wanna copy it?" | two keycaps press (translateY + shadow shrink), the card duplicates out on a diagonal | B19 |

## Craft notes that cost a pass

- Background-image URLs are not in `document.images` — list them in `CM.preload([...])` or
  the first frames render blank.
- Adjacent beats sharing a frame: the later one wins (hard cut); keep `end` = next `start`.
- Put `cursor` press frames where the sound lands; SFX then follow the same numbers.
- Text inside windows ≥ 28px; tags 34–56px mono bold. Anything smaller vanishes on a phone.
- A small hero (a 57px timeline clip) must grow when it becomes the subject (lift + ×1.8).
- Real Shorts frames carry burned captions — fine for "their reel" objects, not as footage.
