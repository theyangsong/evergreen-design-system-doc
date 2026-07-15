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
import { useScrollSpy } from '@/composables/useScrollSpy';
import { usePreventScrollChaining } from '@/composables/usePreventScrollChaining';
import { waitForIndicatorPaint } from '@/motion/waitForIndicatorPaint';
import { scrollToSectionById } from '@/utils/scrollToSection';
import styles from './PageToc.module.css';

const props = defineProps<{
  items: Array<{ id: string; label: string }>;
}>();

const mode = defineModel<'design' | 'develop'>('mode', { default: 'design' });

const route = useRoute();
const router = useRouter();

const sectionIds = computed(() => props.items.map((item) => item.id));
const { activeId, resetActive } = useScrollSpy(sectionIds);

const listRef = ref<HTMLElement | null>(null);
const tocBlockRef = ref<HTMLElement | null>(null);
const toggleRef = ref<HTMLElement | null>(null);
const designButtonRef = ref<HTMLElement | null>(null);
const developButtonRef = ref<HTMLElement | null>(null);

usePreventScrollChaining(tocBlockRef);

const linkRefs = new Map<string, HTMLElement>();
const indicatorTop = ref(0);
const indicatorHeight = ref(0);
const indicatorVisible = ref(false);
const indicatorMoveTransition = ref(true);
const toggleIndicatorLeft = ref(0);
const toggleIndicatorWidth = ref(0);
const toggleIndicatorVisible = ref(false);
const toggleIndicatorMoveTransition = ref(true);
let resizeObserver: ResizeObserver | undefined;
let toggleResizeObserver: ResizeObserver | undefined;

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

async function updateIndicator(
  options: { animateMove?: boolean; previousActiveId?: string } = {},
) {
  const { animateMove = true, previousActiveId = '' } = options;

  await nextTick();

  if (!activeId.value) {
    indicatorMoveTransition.value = false;
    indicatorVisible.value = false;
    return;
  }

  const isFirstAppearance = !previousActiveId;

  indicatorMoveTransition.value = animateMove && !isFirstAppearance;

  if (indicatorMoveTransition.value) {
    await nextTick();
    await waitForIndicatorPaint();
  }

  syncIndicatorPosition();

  if (isFirstAppearance) {
    indicatorVisible.value = false;
    await nextTick();
    indicatorVisible.value = true;
    return;
  }

  indicatorVisible.value = true;
}

function getActiveToggleButton() {
  return mode.value === 'design' ? designButtonRef.value : developButtonRef.value;
}

function syncToggleIndicatorPosition() {
  const button = getActiveToggleButton();

  if (!button) {
    toggleIndicatorVisible.value = false;
    return;
  }

  toggleIndicatorLeft.value = button.offsetLeft;
  toggleIndicatorWidth.value = button.offsetWidth;
  toggleIndicatorVisible.value = true;
}

async function updateToggleIndicator(
  options: { animateMove?: boolean; previousMode?: 'design' | 'develop' | '' } = {},
) {
  const { animateMove = true, previousMode = '' } = options;

  await nextTick();

  if (!getActiveToggleButton()) {
    toggleIndicatorMoveTransition.value = false;
    toggleIndicatorVisible.value = false;
    return;
  }

  const isFirstAppearance = !previousMode;

  toggleIndicatorMoveTransition.value = animateMove && !isFirstAppearance;

  if (toggleIndicatorMoveTransition.value) {
    await nextTick();
    await waitForIndicatorPaint();
  }

  syncToggleIndicatorPosition();

  if (isFirstAppearance) {
    toggleIndicatorVisible.value = false;
    await nextTick();
    toggleIndicatorVisible.value = true;
    return;
  }

  toggleIndicatorVisible.value = true;
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
  void updateToggleIndicator({
    animateMove: Boolean(previousMode),
    previousMode: previousMode ?? '',
  });
});

watch(activeId, (nextId, previousId) => {
  void updateIndicator({
    animateMove: Boolean(nextId && previousId),
    previousActiveId: previousId,
  });
});

watch(
  () => props.items,
  () => {
    void updateIndicator({ animateMove: false, previousActiveId: '' });
  },
);

onMounted(() => {
  void updateIndicator({ animateMove: false, previousActiveId: '' });
  void updateToggleIndicator({ animateMove: false, previousMode: '' });

  if (listRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncIndicatorPosition();
    });
    resizeObserver.observe(listRef.value);
  }

  if (toggleRef.value) {
    toggleResizeObserver = new ResizeObserver(() => {
      syncToggleIndicatorPosition();
    });
    toggleResizeObserver.observe(toggleRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  toggleResizeObserver?.disconnect();
});
</script>

<template>
  <aside :class="styles.sidebar" aria-label="Page sidebar">
    <div
      ref="toggleRef"
      :class="styles.toggle"
      role="tablist"
      aria-label="Content mode"
    >
      <div
        :class="[
          styles.toggleIndicator,
          toggleIndicatorVisible && styles.toggleIndicatorVisible,
          toggleIndicatorMoveTransition && styles.toggleIndicatorMove,
        ]"
        :style="{
          transform: `translateX(${toggleIndicatorLeft}px)`,
          width: `${toggleIndicatorWidth}px`,
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

    <div v-if="items.length" ref="tocBlockRef" :class="styles.tocBlock">
      <p :class="styles.label">On this page</p>

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
          :class="[styles.link, activeId === item.id && styles.linkActive]"
          @click="scrollToSection($event, item.id)"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>
  </aside>
</template>
