/**
 * Reel templates — approved 2026-09-25 (Tyler), ported from two reference reels.
 * Full-frame scenes: each paints its own ground and reads the beat-local frame with
 * useCurrentFrame(). Selection guide: references/template-selection.md ("Reel templates").
 */
export {NumberedFanIn, ScreenFocus, TerminalCounter, FilesToDoc, TableScroll} from './scenes-a';
export type {NumberedFanInProps, ScreenFocusProps, TerminalCounterProps, FilesToDocProps, TableScrollProps} from './scenes-a';
export {TokenStat, LogoRoster, OrbitRing, ModelSwitcher, SwitcherCards} from './scenes-b';
export type {TokenStatProps, LogoRosterProps, OrbitRingProps, ModelSwitcherProps, SwitcherCardsProps} from './scenes-b';
export {PRESETS as REEL_TEMPLATE_PRESETS} from './presets';
