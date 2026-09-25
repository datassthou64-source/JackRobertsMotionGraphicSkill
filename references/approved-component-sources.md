# Approved source-based components

- Shine Border — Magic UI, MIT: https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/shine-border.tsx
- Orbiting Circles — Magic UI, MIT: https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/orbiting-circles.tsx
- Animated Tabs / AnimatedBackground — Motion Primitives / ibelick: https://github.com/ibelick/motion-primitives/blob/main/components/core/animated-background.tsx

Original fetched code and available license notices are retained in
`remotion-projects/21st-component-auditions-20260924/upstream/`.
Ports replace browser timing with Remotion frame timing and remove Tailwind requirements.

Round-2 approvals: IntegrationBeam (Magic UI animated-beam), MagneticDock (Magic UI dock),
LogoConveyor (Magic UI marquee), SpotlightCard (Magic UI magic-card), ImageComparison
(Motion Primitives image-comparison). Original retrieved sources are in
`remotion-projects/21st-visual-templates-20-20260924/upstream/`. Revised approved ports and
rendered examples are in `remotion-projects/21st-visual-templates-round3-20260924/`.
Motion/event timing was adapted for 30fps frame-driven rendering. Demo photos retain their
source attribution in that project's SOURCES.md and upstream/media.json.

Round-4 approvals: AttachmentPopover (Motion Primitives image/popover mechanism),
GlareSweep (Magic UI shine/glare treatment), MosaicAssembly (Motion Primitives animated-group assembly),
DrawnEmphasis (Magic UI highlighter/rough annotation treatment). Original sources and
licenses remain in the round-3 project's `upstream/`; exact source URLs are in its
`candidates.json`. Round 4 substantially adapts motion, geometry and reusable props.
Approved implementation: `starter/src/devices/approved-visuals/media-actions.tsx`.
Current real ChatGPT composer: https://chatgpt.com/ (captured 2026-09-24); local provenance
`starter/public/ui/source.json`. Preview project keeps the full public-page reference.
This is a product screenshot, not MIT-licensed component source.
