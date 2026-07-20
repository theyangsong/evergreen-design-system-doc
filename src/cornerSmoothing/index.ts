import {
  initCornerSmoothing as initCornerSmoothingEngine,
  rescanCornerSmoothing as rescanCornerSmoothingEngine,
} from '@evergreen/tokens/corner-smoothing';

export {
  attachCornerSmoothing,
  detachCornerSmoothing,
} from '@evergreen/tokens/corner-smoothing';

/** Doc-site entry: global squircle scanner (call once from `main.ts`). */
export function initDocCornerSmoothing(): void {
  initCornerSmoothingEngine();
}

/** Rescan a subtree after Teleport / v-if mount when layout is ready. */
export function rescanCornerSmoothingSubtree(
  root: HTMLElement | null | undefined,
): void {
  if (root) {
    rescanCornerSmoothingEngine(root);
  }
}

/** Re-export for advanced use (prefer `useCornerSmoothingRescan` in Vue). */
export function rescanCornerSmoothing(root?: HTMLElement): unknown[] {
  return rescanCornerSmoothingEngine(root);
}
