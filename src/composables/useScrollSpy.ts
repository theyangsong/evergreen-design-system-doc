import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';
import { getDocScrollContainer, getDocScrollTopOffset } from '@/utils/scrollToSection';

export function useScrollSpy(sectionIds: Ref<string[]> | ComputedRef<string[]>) {
  const activeId = ref('');
  let scrollContainer: HTMLElement | null = null;
  let rafId = 0;
  let observer: IntersectionObserver | null = null;

  function computeActiveId(): string {
    const ids = sectionIds.value.filter(Boolean);
    if (!ids.length) {
      return '';
    }

    const container = scrollContainer ?? getDocScrollContainer();
    if (!container) {
      return ids[0] ?? '';
    }

    const topOffset = getDocScrollTopOffset(container);
    const threshold = container.getBoundingClientRect().top + topOffset;

    let current = ids[0];
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= threshold + 1) {
        current = id;
      }
    }

    return current;
  }

  function applyActiveId() {
    const nextId = computeActiveId();
    if (activeId.value !== nextId) {
      activeId.value = nextId;
    }
  }

  function bindScrollContainer() {
    scrollContainer?.removeEventListener('scroll', applyActiveId);
    scrollContainer = getDocScrollContainer();
    scrollContainer?.addEventListener('scroll', applyActiveId, { passive: true });
  }

  function setupIntersectionObserver() {
    observer?.disconnect();
    observer = null;

    const container = scrollContainer ?? getDocScrollContainer();
    if (!container) {
      return;
    }

    const topOffset = getDocScrollTopOffset(container);
    observer = new IntersectionObserver(
      () => {
        applyActiveId();
      },
      {
        root: container,
        rootMargin: `-${topOffset}px 0px -60% 0px`,
        threshold: [0, 0.01, 0.25, 0.5, 1],
      },
    );

    for (const id of sectionIds.value) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }
  }

  function tick() {
    applyActiveId();
    rafId = requestAnimationFrame(tick);
  }

  async function refresh() {
    bindScrollContainer();
    await nextTick();
    requestAnimationFrame(() => {
      setupIntersectionObserver();
      applyActiveId();
    });
  }

  onMounted(() => {
    bindScrollContainer();
    void refresh();
    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', applyActiveId, { passive: true });
  });

  watch(sectionIds, () => {
    void refresh();
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId);
    observer?.disconnect();
    scrollContainer?.removeEventListener('scroll', applyActiveId);
    window.removeEventListener('resize', applyActiveId);
  });

  function resetActive() {
    activeId.value = '';
  }

  return { activeId, resetActive, refresh };
}
