import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { getDocScrollContainer } from '@/utils/scrollToSection';

export function useArticleAlignedDock(
  anchorRef: Ref<HTMLElement | null | undefined>,
) {
  const dockStyle = ref<{ left: string; width: string; bottom: string }>({
    left: '0px',
    width: '100%',
    bottom: 'var(--spacing-4)',
  });

  let resizeObserver: ResizeObserver | undefined;
  let scrollContainer: HTMLElement | null = null;
  let rafId = 0;

  function syncPosition() {
    const anchor = anchorRef.value;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    dockStyle.value = {
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      bottom: 'var(--spacing-4)',
    };
  }

  function scheduleSyncPosition() {
    window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(syncPosition);
  }

  function bindScrollListener() {
    scrollContainer?.removeEventListener('scroll', scheduleSyncPosition);
    scrollContainer = getDocScrollContainer();
    scrollContainer?.addEventListener('scroll', scheduleSyncPosition, {
      passive: true,
    });
  }

  function bindObserver() {
    resizeObserver?.disconnect();
    resizeObserver = undefined;

    if (!anchorRef.value) {
      return;
    }

    resizeObserver = new ResizeObserver(scheduleSyncPosition);
    resizeObserver.observe(anchorRef.value);
    scheduleSyncPosition();
  }

  onMounted(() => {
    bindObserver();
    bindScrollListener();
    window.addEventListener('resize', scheduleSyncPosition);
  });

  watch(anchorRef, () => {
    bindObserver();
    bindScrollListener();
  });

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', scheduleSyncPosition);
    scrollContainer?.removeEventListener('scroll', scheduleSyncPosition);
    resizeObserver?.disconnect();
  });

  return { dockStyle, syncPosition: scheduleSyncPosition };
}
