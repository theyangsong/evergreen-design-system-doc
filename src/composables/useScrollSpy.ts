import { onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import { getDocScrollContainer, getDocScrollTopOffset } from '@/utils/scrollToSection';

export function useScrollSpy(sectionIds: Ref<string[]> | ComputedRef<string[]>) {
  const activeId = ref('');
  let scrollContainer: HTMLElement | null = null;

  function updateActive() {
    const ids = sectionIds.value.filter(Boolean);
    if (!ids.length) {
      activeId.value = '';
      return;
    }

    const container = scrollContainer ?? getDocScrollContainer();
    const topOffset = container
      ? getDocScrollTopOffset(container)
      : window.innerHeight * 0.03;
    const threshold =
      (container?.getBoundingClientRect().top ?? 0) + topOffset;

    let current = '';
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= threshold + 1) {
        current = id;
      }
    }

    activeId.value = current;
  }

  onMounted(() => {
    updateActive();

    scrollContainer = getDocScrollContainer();
    scrollContainer?.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
  });

  watch(sectionIds, () => {
    activeId.value = '';
  });

  onBeforeUnmount(() => {
    scrollContainer?.removeEventListener('scroll', updateActive);
    window.removeEventListener('resize', updateActive);
  });

  function resetActive() {
    activeId.value = '';
  }

  return { activeId, resetActive };
}
