import { nextTick, watch, type Ref } from 'vue';
import { rescanCornerSmoothingSubtree } from '@/cornerSmoothing';

type RootRef = Ref<HTMLElement | null | undefined>;

/**
 * Rescan squircle bindings when async UI (Teleport, v-if) becomes visible.
 * Waits for layout before calling the global corner-smoothing engine.
 */
export function useCornerSmoothingRescan(
  rootRef: RootRef,
  when: Ref<boolean>,
): void {
  watch(when, (isActive) => {
    if (!isActive) {
      return;
    }

    nextTick(() => {
      requestAnimationFrame(() => {
        rescanCornerSmoothingSubtree(rootRef.value);
      });
    });
  });
}
