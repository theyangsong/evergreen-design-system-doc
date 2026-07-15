import { onBeforeUnmount, ref } from 'vue';
import {
  MOTION_CURVED_PANEL_BULGE_FACTOR,
  MOTION_CURVED_PANEL_CLOSE_MS,
  MOTION_CURVED_PANEL_OPEN_MS,
  MOTION_CURVED_PANEL_WIDTH_PX,
} from '@/motion/durations';
import { easeCurvedPanel } from '@/motion/easing';
import { getPrefersReducedMotion } from '@/motion/prefersReducedMotion';

export const sectionNavCurveWidth = MOTION_CURVED_PANEL_WIDTH_PX;

export function useCurvedPanelTransition(initialOpen = false) {
  const progress = ref(initialOpen ? 1 : 0);
  const isAnimating = ref(false);
  const prefersReducedMotion = ref(getPrefersReducedMotion());

  let frameId = 0;
  let startTime = 0;
  let startProgress = 0;
  let targetProgress = initialOpen ? 1 : 0;
  let durationMs = MOTION_CURVED_PANEL_OPEN_MS;

  function cancelAnimation() {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function setProgressImmediate(value: number) {
    cancelAnimation();
    isAnimating.value = false;
    progress.value = value;
    targetProgress = value;
  }

  function animateTo(open: boolean) {
    const nextTarget = open ? 1 : 0;

    if (prefersReducedMotion.value) {
      setProgressImmediate(nextTarget);
      return;
    }

    if (nextTarget === targetProgress && !isAnimating.value) {
      return;
    }

    cancelAnimation();
    startProgress = progress.value;
    targetProgress = nextTarget;
    durationMs = open
      ? MOTION_CURVED_PANEL_OPEN_MS
      : MOTION_CURVED_PANEL_CLOSE_MS;
    startTime = performance.now();
    isAnimating.value = true;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / durationMs, 1);
      const easedT = easeCurvedPanel(rawT);
      progress.value =
        startProgress + (targetProgress - startProgress) * easedT;

      if (rawT < 1) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      progress.value = targetProgress;
      isAnimating.value = false;
      frameId = 0;
    };

    frameId = requestAnimationFrame(tick);
  }

  onBeforeUnmount(() => {
    cancelAnimation();
  });

  return {
    progress,
    isAnimating,
    animateTo,
    setProgressImmediate,
  };
}

/** Outward bulge padding added to the grid column while animating. */
export function getCurvedPanelBulge(
  progress: number,
  animating: boolean,
  curveWidth = sectionNavCurveWidth,
) {
  if (!animating) {
    return 0;
  }

  return (
    curveWidth * MOTION_CURVED_PANEL_BULGE_FACTOR * Math.sin(progress * Math.PI)
  );
}

/** @deprecated Use getCurvedPanelBulge */
export const getSectionNavBulge = getCurvedPanelBulge;

/**
 * Clip path with a curved leading edge for panel reveal animations.
 */
export function getCurvedPanelClipPath(
  height: number,
  edgeX: number,
  progress: number,
  curveWidth = sectionNavCurveWidth,
) {
  const safeHeight = Math.max(height, 1);
  const width = Math.max(edgeX, 0);

  if (width <= 0) {
    return 'none';
  }

  const controlX = width + curveWidth * Math.sin(progress * Math.PI);

  return `path('M 0 0 L ${width} 0 Q ${controlX} ${safeHeight / 2} ${width} ${safeHeight} L 0 ${safeHeight} Z')`;
}

/** @deprecated Use getCurvedPanelClipPath */
export const getSectionNavClipPath = getCurvedPanelClipPath;

/** @deprecated Overlay SVG — use getCurvedPanelClipPath instead */
export function getSectionNavCurvePath(
  height: number,
  progress: number,
  curveWidth = sectionNavCurveWidth,
) {
  const safeHeight = Math.max(height, 1);
  const controlX = -curveWidth + progress * curveWidth * 2;

  return `M0 0 L0 ${safeHeight} Q${controlX} ${safeHeight / 2} 0 0 Z`;
}
