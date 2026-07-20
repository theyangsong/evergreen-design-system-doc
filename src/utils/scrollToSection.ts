export const DOC_SCROLL_SELECTOR = '[data-doc-scroll]';

const SCROLL_DURATION_MS = 640;
const SPRING_STIFFNESS = 520;
const SPRING_DAMPING = 36;
const WHEEL_IMPULSE = 18;
const WHEEL_IMMEDIATE_RATIO = 0.62;

const activeScrollFrames = new WeakMap<HTMLElement, number>();

interface SpringScrollState {
  target: number;
  velocity: number;
  lastTime: number;
}

const springScrollStates = new WeakMap<HTMLElement, SpringScrollState>();

export function getContainerMaxScrollTop(container: HTMLElement): number {
  return Math.max(0, container.scrollHeight - container.clientHeight);
}

export function clampContainerScrollTop(container: HTMLElement, value: number): number {
  return Math.max(0, Math.min(getContainerMaxScrollTop(container), value));
}

export function cancelContainerScrollAnimation(container: HTMLElement): void {
  const frame = activeScrollFrames.get(container);
  if (frame) {
    cancelAnimationFrame(frame);
    activeScrollFrames.delete(container);
  }
  springScrollStates.delete(container);
}

export function cancelDocScrollAnimation(): void {
  const container = getDocScrollContainer();
  if (container) {
    cancelContainerScrollAnimation(container);
  }
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
    cancelContainerScrollAnimation(container);
    container.scrollTop = top;
    return;
  }

  cancelContainerScrollAnimation(container);

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
      activeScrollFrames.set(container, requestAnimationFrame(step));
    } else {
      activeScrollFrames.delete(container);
    }
  }

  activeScrollFrames.set(container, requestAnimationFrame(step));
}

function runSpringScrollFrame(container: HTMLElement, now: number): void {
  const state = springScrollStates.get(container);
  if (!state) {
    return;
  }

  const dt = Math.min((now - state.lastTime) / 1000, 0.032);
  state.lastTime = now;

  const displacement = state.target - container.scrollTop;
  const acceleration = SPRING_STIFFNESS * displacement - SPRING_DAMPING * state.velocity;
  state.velocity += acceleration * dt;
  container.scrollTop += state.velocity * dt;

  if (Math.abs(displacement) < 0.5 && Math.abs(state.velocity) < 0.5) {
    container.scrollTop = state.target <= 0 ? 0 : state.target;
    springScrollStates.delete(container);
    activeScrollFrames.delete(container);
    return;
  }

  activeScrollFrames.set(
    container,
    requestAnimationFrame((time) => runSpringScrollFrame(container, time)),
  );
}

function ensureSpringScrollState(
  container: HTMLElement,
  targetTop: number,
): SpringScrollState {
  const target = clampContainerScrollTop(container, targetTop);
  const existing = springScrollStates.get(container);

  if (existing) {
    existing.target = target;
    return existing;
  }

  const state: SpringScrollState = {
    target,
    velocity: 0,
    lastTime: performance.now(),
  };
  springScrollStates.set(container, state);
  activeScrollFrames.set(
    container,
    requestAnimationFrame((time) => runSpringScrollFrame(container, time)),
  );
  return state;
}

export function scrollContainerToSpring(
  container: HTMLElement,
  targetTop: number,
): void {
  cancelContainerScrollAnimation(container);
  const target = clampContainerScrollTop(container, targetTop);

  if (target <= 0) {
    container.scrollTop = 0;
    return;
  }

  ensureSpringScrollState(container, target);
}

export function applySpringScrollDelta(
  container: HTMLElement,
  deltaY: number,
): void {
  const frame = activeScrollFrames.get(container);
  if (frame && !springScrollStates.has(container)) {
    cancelAnimationFrame(frame);
    activeScrollFrames.delete(container);
  }

  const existing = springScrollStates.get(container);
  const currentTop = existing?.target ?? container.scrollTop;
  const target = clampContainerScrollTop(container, currentTop + deltaY);

  if (existing) {
    existing.target = target;
    existing.velocity += deltaY * WHEEL_IMPULSE;
    return;
  }

  container.scrollTop = clampContainerScrollTop(
    container,
    container.scrollTop + deltaY * WHEEL_IMMEDIATE_RATIO,
  );

  const state: SpringScrollState = {
    target,
    velocity: deltaY * WHEEL_IMPULSE,
    lastTime: performance.now(),
  };
  springScrollStates.set(container, state);
  activeScrollFrames.set(
    container,
    requestAnimationFrame((time) => runSpringScrollFrame(container, time)),
  );
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
