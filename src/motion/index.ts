/**
 * EverGreen docs site motion system.
 *
 * CSS: import `@/motion/tokens.css` + `@/motion/animations.css` (wired in global.css).
 * JS:  import composables/helpers from `@/motion`.
 */

export {
  createCubicBezier,
  easeCurvedPanel,
  EASE_CURVED_PANEL_CSS,
  EASE_PAGE_ENTER_CSS,
  EASE_STANDARD_CSS,
} from '@/motion/easing';

export {
  MOTION_CHROME_FADE_MS,
  MOTION_CURVED_PANEL_BULGE_FACTOR,
  MOTION_CURVED_PANEL_CLOSE_MS,
  MOTION_CURVED_PANEL_OPEN_MS,
  MOTION_CURVED_PANEL_WIDTH_PX,
  MOTION_HOVER_MS,
  MOTION_INDICATOR_MS,
  MOTION_INDICATOR_OPACITY_MS,
  MOTION_PAGE_ENTER_MS,
} from '@/motion/durations';

export { getPrefersReducedMotion } from '@/motion/prefersReducedMotion';

export {
  getCurvedPanelBulge,
  getCurvedPanelClipPath,
  getSectionNavBulge,
  getSectionNavClipPath,
  getSectionNavCurvePath,
  sectionNavCurveWidth,
  useCurvedPanelTransition,
} from '@/motion/curvedPanel';
