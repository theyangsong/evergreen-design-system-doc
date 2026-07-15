export const DOC_SCROLL_SELECTOR = '[data-doc-scroll]';

const SCROLL_DURATION_MS = 480;

let activeScrollFrame = 0;

export function cancelDocScrollAnimation(): void {
  cancelAnimationFrame(activeScrollFrame);
  activeScrollFrame = 0;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function getDocScrollContainer(): HTMLElement | null {
  return document.querySelector(DOC_SCROLL_SELECTOR);
}

export function getDocScrollTopOffset(container: HTMLElement): number {
  const { scrollPaddingTop } = getComputedStyle(container);
  return Number.parseFloat(scrollPaddingTop) || container.clientHeight * 0.03;
}

export function scrollContainerTo(
  container: HTMLElement,
  targetTop: number,
  behavior: ScrollBehavior = 'smooth',
): void {
  const top = Math.max(0, targetTop);

  if (behavior === 'auto') {
    cancelAnimationFrame(activeScrollFrame);
    container.scrollTop = top;
    return;
  }

  cancelAnimationFrame(activeScrollFrame);

  const startTop = container.scrollTop;
  const distance = top - startTop;

  if (Math.abs(distance) < 1) {
    container.scrollTop = top;
    return;
  }

  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / SCROLL_DURATION_MS, 1);
    container.scrollTop = startTop + distance * easeInOutCubic(progress);

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
    }
  }

  activeScrollFrame = requestAnimationFrame(step);
}

export function scrollToSectionById(
  id: string,
  behavior: ScrollBehavior = 'smooth',
): boolean {
  const element = document.getElementById(id);
  const container = getDocScrollContainer();

  if (!element || !container) {
    return false;
  }

  const topOffset = getDocScrollTopOffset(container);
  const top =
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop -
    topOffset;

  scrollContainerTo(container, top, behavior);
  return true;
}
