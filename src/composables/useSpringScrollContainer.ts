import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';
import {
  applySpringScrollDelta,
  clampContainerScrollTop,
  getContainerMaxScrollTop,
} from '@/utils/scrollToSection';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useSpringScrollContainer(
  elementRef: Ref<HTMLElement | null | undefined>,
  options: { onUserScroll?: () => void } = {},
) {
  let element: HTMLElement | null = null;

  function onWheel(event: WheelEvent) {
    if (!element) {
      return;
    }

    const maxScrollTop = getContainerMaxScrollTop(element);

    if (maxScrollTop <= 1) {
      event.preventDefault();
      return;
    }

    const { scrollTop } = element;
    const scrollingDown = event.deltaY > 0;
    const scrollingUp = event.deltaY < 0;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop >= maxScrollTop - 1;

    if ((scrollingDown && atBottom) || (scrollingUp && atTop)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    options.onUserScroll?.();

    if (prefersReducedMotion()) {
      element.scrollTop = clampContainerScrollTop(
        element,
        element.scrollTop + event.deltaY,
      );
      return;
    }

    applySpringScrollDelta(element, event.deltaY);
  }

  function bind(nextElement: HTMLElement | null | undefined) {
    element?.removeEventListener('wheel', onWheel);
    element = nextElement ?? null;
    element?.addEventListener('wheel', onWheel, { passive: false });
  }

  onMounted(() => {
    bind(elementRef.value);
  });

  watch(elementRef, (nextElement) => {
    bind(nextElement);
  });

  onBeforeUnmount(() => {
    bind(null);
  });
}
