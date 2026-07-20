<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pageHeaderIcons } from '@/assets/icons';
import EdsIcon from '@/components/EdsIcon/EdsIcon.vue';
import type { DocMode } from '@/content/docPage';
import { useScrollSpy } from '@/composables/useScrollSpy';
import { useSpringScrollContainer } from '@/composables/useSpringScrollContainer';
import { waitForIndicatorPaint } from '@/motion/waitForIndicatorPaint';
import { scrollContainerToSpring, cancelContainerScrollAnimation, getDocScrollContainer, isScrollAtBottom, scrollToSectionById } from '@/utils/scrollToSection';
import styles from './PageToc.module.css';

const props = defineProps<{
  items: Array<{ id: string; label: string; depth?: 1 | 2 }>;
}>();

const mode = defineModel<DocMode>('mode', { default: 'design' });

const route = useRoute();
const router = useRouter();

const sectionIds = computed(() => props.items.map((item) => item.id));
const { activeId, resetActive, refresh } = useScrollSpy(sectionIds);

const listRef = ref<HTMLElement | null>(null);
const tocScrollRef = ref<HTMLElement | null>(null);
const modeToggleRef = ref<HTMLElement | null>(null);
const designButtonRef = ref<HTMLElement | null>(null);
const developButtonRef = ref<HTMLElement | null>(null);

const isTocOverflow = ref(false);
const isTocScrolled = ref(false);
const isTocAtBottom = ref(true);
let suppressTocFollowUntil = 0;
let tocUserScrollTimer = 0;

function shouldAutoFollowToc() {
  return performance.now() >= suppressTocFollowUntil;
}

function markTocUserScrollIntent() {
  const container = tocScrollRef.value;
  if (container) {
    cancelContainerScrollAnimation(container);
  }

  suppressTocFollowUntil = performance.now() + 2000;
  window.clearTimeout(tocUserScrollTimer);
  tocUserScrollTimer = window.setTimeout(() => {
    suppressTocFollowUntil = 0;
  }, 2000);
}

function onTocUserScrollIntent() {
  markTocUserScrollIntent();
}

function bindTocUserScrollIntentListeners() {
  const element = tocScrollRef.value;
  if (!element) {
    return;
  }

  element.removeEventListener('touchstart', onTocUserScrollIntent);
  element.removeEventListener('pointerdown', onTocUserScrollIntent);
  element.removeEventListener('keydown', onTocUserScrollIntent);

  element.addEventListener('touchstart', onTocUserScrollIntent, { passive: true });
  element.addEventListener('pointerdown', onTocUserScrollIntent);
  element.addEventListener('keydown', onTocUserScrollIntent);
}

function updateTocScrollState() {
  const element = tocScrollRef.value;
  if (!element) {
    isTocOverflow.value = false;
    isTocScrolled.value = false;
    isTocAtBottom.value = true;
    return;
  }

  isTocOverflow.value = element.scrollHeight > element.clientHeight + 1;

  if (element.scrollTop > 0 && element.scrollTop < 1) {
    element.scrollTop = 0;
  }

  isTocScrolled.value = element.scrollTop >= 1;
  isTocAtBottom.value =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
}

function scrollTocToTop(container: HTMLElement) {
  cancelContainerScrollAnimation(container);
  container.scrollTop = 0;
  updateTocScrollState();
}

function ensureTocLinkVisible(container: HTMLElement, link: HTMLElement) {
  const edgeInset = 12;
  const containerRect = container.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  if (linkRect.top < containerRect.top + edgeInset) {
    const nextScrollTop =
      container.scrollTop + (linkRect.top - containerRect.top - edgeInset);

    if (nextScrollTop < 1) {
      scrollTocToTop(container);
      return;
    }

    scrollContainerToSpring(container, nextScrollTop);
    return;
  }

  if (linkRect.bottom > containerRect.bottom - edgeInset) {
    scrollContainerToSpring(
      container,
      container.scrollTop + (linkRect.bottom - containerRect.bottom + edgeInset),
    );
  }
}

function bindTocScrollListener() {
  const element = tocScrollRef.value;
  if (!element) {
    return;
  }

  element.removeEventListener('scroll', updateTocScrollState);
  element.addEventListener('scroll', updateTocScrollState, { passive: true });
  updateTocScrollState();
}

function scrollActiveTocLinkIntoView(id: string) {
  if (!shouldAutoFollowToc()) {
    return;
  }

  const container = tocScrollRef.value;
  const link = linkRefs.get(id);

  if (!container || !link) {
    return;
  }

  const linkIndex = props.items.findIndex((item) => item.id === id);

  if (linkIndex === 0) {
    scrollTocToTop(container);
    return;
  }

  ensureTocLinkVisible(container, link);
  updateTocScrollState();
}

useSpringScrollContainer(tocScrollRef, { onUserScroll: markTocUserScrollIntent });

const linkRefs = new Map<string, HTMLElement>();
const indicatorTop = ref(0);
const indicatorHeight = ref(0);
const indicatorVisible = ref(false);
const indicatorMoveTransition = ref(true);
const modeIndicatorLeft = ref(0);
const modeIndicatorWidth = ref(0);
const modeIndicatorVisible = ref(false);
const modeIndicatorMoveTransition = ref(true);
let resizeObserver: ResizeObserver | undefined;
let modeToggleResizeObserver: ResizeObserver | undefined;
let pageScrollStopTimer = 0;
let pageScrollContainer: HTMLElement | null = null;
let tocFollowTimer = 0;

function setLinkRef(id: string, element: Element | null) {
  if (element instanceof HTMLElement) {
    linkRefs.set(id, element);
    return;
  }

  linkRefs.delete(id);
}

function syncIndicatorPosition() {
  const list = listRef.value;
  const link = activeId.value ? linkRefs.get(activeId.value) : undefined;

  if (!list || !link) {
    indicatorVisible.value = false;
    return;
  }

  indicatorTop.value = link.offsetTop;
  indicatorHeight.value = link.offsetHeight;
  indicatorVisible.value = true;
}

function syncIndicatorWithAnimation(previousActiveId = '') {
  if (!activeId.value) {
    indicatorMoveTransition.value = false;
    indicatorVisible.value = false;
    return;
  }

  indicatorMoveTransition.value = Boolean(previousActiveId);
  syncIndicatorPosition();
  indicatorVisible.value = true;
}

function scheduleTocFollow(id: string) {
  window.clearTimeout(tocFollowTimer);
  tocFollowTimer = window.setTimeout(() => {
    scrollActiveTocLinkIntoView(id);
  }, 120);
}

function bindPageScrollListener() {
  pageScrollContainer?.removeEventListener('scroll', onPageScroll);
  pageScrollContainer = getDocScrollContainer();
  pageScrollContainer?.addEventListener('scroll', onPageScroll, { passive: true });
}

function onPageScroll() {
  const pageContainer = getDocScrollContainer();

  if (
    pageContainer &&
    isScrollAtBottom(pageContainer) &&
    shouldAutoFollowToc() &&
    activeId.value
  ) {
    scrollActiveTocLinkIntoView(activeId.value);
  }

  window.clearTimeout(pageScrollStopTimer);
  pageScrollStopTimer = window.setTimeout(() => {
    if (activeId.value) {
      scrollActiveTocLinkIntoView(activeId.value);
    }
  }, 120);
}

function getActiveModeButton() {
  return mode.value === 'design' ? designButtonRef.value : developButtonRef.value;
}

function syncModeIndicatorPosition() {
  const button = getActiveModeButton();

  if (!button) {
    modeIndicatorVisible.value = false;
    return;
  }

  modeIndicatorLeft.value = button.offsetLeft;
  modeIndicatorWidth.value = button.offsetWidth;
  modeIndicatorVisible.value = true;
}

async function updateModeIndicator(
  options: { animateMove?: boolean; previousMode?: DocMode | '' } = {},
) {
  const { animateMove = true, previousMode = '' } = options;

  await nextTick();

  if (!getActiveModeButton()) {
    modeIndicatorMoveTransition.value = false;
    modeIndicatorVisible.value = false;
    return;
  }

  const isFirstAppearance = !previousMode;

  modeIndicatorMoveTransition.value = animateMove && !isFirstAppearance;

  if (modeIndicatorMoveTransition.value) {
    await nextTick();
    await waitForIndicatorPaint();
  }

  syncModeIndicatorPosition();

  if (isFirstAppearance) {
    modeIndicatorVisible.value = false;
    await nextTick();
    modeIndicatorVisible.value = true;
    return;
  }

  modeIndicatorVisible.value = true;
}

function scrollToSection(event: MouseEvent, id: string) {
  event.preventDefault();

  const hash = `#${id}`;

  if (route.hash === hash) {
    scrollToSectionById(id, 'smooth');
    return;
  }

  router.replace({ path: route.path, hash }).catch(() => undefined);
}

watch(mode, (_nextMode, previousMode) => {
  resetActive();
  indicatorVisible.value = false;
  void refresh();
  void updateModeIndicator({
    animateMove: Boolean(previousMode),
    previousMode: previousMode ?? '',
  });
});

watch(activeId, (nextId, previousId) => {
  syncIndicatorWithAnimation(previousId);

  if (nextId) {
    scheduleTocFollow(nextId);
  }
}, { flush: 'sync' });

watch(tocScrollRef, (element) => {
  if (element) {
    bindTocScrollListener();
    bindTocUserScrollIntentListeners();
  }
});

watch(
  () => props.items,
  () => {
    void refresh();
    nextTick(() => {
      syncIndicatorWithAnimation('');
      updateTocScrollState();
    });
  },
);

defineExpose({
  refreshSpy: refresh,
});

onMounted(() => {
  bindTocScrollListener();
  bindTocUserScrollIntentListeners();
  bindPageScrollListener();
  syncIndicatorWithAnimation('');
  void updateModeIndicator({ animateMove: false, previousMode: '' });

  resizeObserver = new ResizeObserver(() => {
    syncIndicatorPosition();
    updateTocScrollState();
  });

  if (listRef.value) {
    resizeObserver.observe(listRef.value);
  }

  if (tocScrollRef.value) {
    resizeObserver.observe(tocScrollRef.value);
  }

  if (modeToggleRef.value) {
    modeToggleResizeObserver = new ResizeObserver(() => {
      syncModeIndicatorPosition();
    });
    modeToggleResizeObserver.observe(modeToggleRef.value);
  }
});

onBeforeUnmount(() => {
  window.clearTimeout(pageScrollStopTimer);
  window.clearTimeout(tocFollowTimer);
  window.clearTimeout(tocUserScrollTimer);
  pageScrollContainer?.removeEventListener('scroll', onPageScroll);
  tocScrollRef.value?.removeEventListener('scroll', updateTocScrollState);
  tocScrollRef.value?.removeEventListener('touchstart', onTocUserScrollIntent);
  tocScrollRef.value?.removeEventListener('pointerdown', onTocUserScrollIntent);
  tocScrollRef.value?.removeEventListener('keydown', onTocUserScrollIntent);
  if (tocScrollRef.value) {
    cancelContainerScrollAnimation(tocScrollRef.value);
  }
  resizeObserver?.disconnect();
  modeToggleResizeObserver?.disconnect();
});
</script>

<template>
  <aside :class="styles.sidebar" aria-label="Page sidebar">
    <div
      ref="modeToggleRef"
      :class="styles.toggle"
      role="tablist"
      aria-label="Content mode"
    >
      <div
        :class="[
          styles.toggleIndicator,
          modeIndicatorVisible && styles.toggleIndicatorVisible,
          modeIndicatorMoveTransition && styles.toggleIndicatorMove,
        ]"
        :style="{
          transform: `translateX(${modeIndicatorLeft}px)`,
          width: `${modeIndicatorWidth}px`,
        }"
        aria-hidden="true"
      />

      <button
        ref="designButtonRef"
        type="button"
        role="tab"
        :aria-selected="mode === 'design'"
        :class="[
          styles.toggleButton,
          mode === 'design' && styles.toggleButtonActive,
        ]"
        @click="mode = 'design'"
      >
        <EdsIcon :name="pageHeaderIcons.design" :class="styles.toggleIcon" />
        使用规范
      </button>
      <button
        ref="developButtonRef"
        type="button"
        role="tab"
        :aria-selected="mode === 'develop'"
        :class="[
          styles.toggleButton,
          mode === 'develop' && styles.toggleButtonActive,
        ]"
        @click="mode = 'develop'"
      >
        <EdsIcon :name="pageHeaderIcons.develop" :class="styles.toggleIcon" />
        开发指南
      </button>
    </div>

    <div
      v-if="items.length"
      :class="[
        styles.tocBlock,
        isTocOverflow && styles.tocBlockOverflow,
        isTocScrolled && styles.tocBlockScrolled,
        isTocAtBottom && styles.tocBlockAtBottom,
      ]"
    >
      <p :class="styles.label">On this page</p>

      <div ref="tocScrollRef" :class="styles.listViewport">
        <nav ref="listRef" :class="styles.list">
          <div
            :class="[
              styles.activeIndicator,
              indicatorVisible && styles.activeIndicatorVisible,
              indicatorMoveTransition && styles.activeIndicatorMove,
            ]"
            :style="{
              transform: `translateY(${indicatorTop}px)`,
              height: `${indicatorHeight}px`,
            }"
            aria-hidden="true"
          />

          <a
            v-for="item in items"
            :key="item.id"
            :ref="(element) => setLinkRef(item.id, element as Element | null)"
            :href="`#${item.id}`"
            :class="[
              styles.link,
              item.depth === 2 && styles.linkNested,
              activeId === item.id && styles.linkActive,
            ]"
            @click="scrollToSection($event, item.id)"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>

      <div :class="styles.tocScrollFade" aria-hidden="true" />
      <div :class="styles.tocScrollFadeBottom" aria-hidden="true" />
    </div>
  </aside>
</template>
