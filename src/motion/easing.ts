export type EasingFn = (progress: number) => number;

/** Standard cubic-bezier solver for JS-driven animations. */
export function createCubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): EasingFn {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    let t = x;

    for (let i = 0; i < 8; i++) {
      const currentX = sampleCurveX(t) - x;
      if (Math.abs(currentX) < 1e-6) {
        break;
      }

      const derivative = sampleCurveDerivativeX(t);
      if (Math.abs(derivative) < 1e-6) {
        break;
      }

      t -= currentX / derivative;
    }

    return sampleCurveY(t);
  };
}

/** Curved panel expand/collapse — inspired by Awwwards curved menu. */
export const easeCurvedPanel = createCubicBezier(0.76, 0, 0.24, 1);

/** CSS `cubic-bezier(0.76, 0, 0.24, 1)` */
export const EASE_CURVED_PANEL_CSS = 'cubic-bezier(0.76, 0, 0.24, 1)';

/** CSS `cubic-bezier(0.4, 0, 0.2, 1)` — slide indicators, layout shifts. */
export const EASE_STANDARD_CSS = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** CSS `cubic-bezier(0, 0, 0.2, 1)` — page enter decelerate (fast in, slow settle). */
export const EASE_PAGE_ENTER_CSS = 'cubic-bezier(0, 0, 0.2, 1)';

export const easePageEnter = createCubicBezier(0, 0, 0.2, 1);
