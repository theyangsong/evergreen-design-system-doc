import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

export function usePreventScrollChaining(
  elementRef: Ref<HTMLElement | null | undefined>,
) {
  let element: HTMLElement | null = null;

  function onWheel(event: WheelEvent) {
    if (!element) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;
    const deltaY = event.deltaY;
    const canScroll = scrollHeight > clientHeight + 1;

    if (!canScroll) {
      event.preventDefault();
      return;
    }

    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
      event.preventDefault();
    }
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
