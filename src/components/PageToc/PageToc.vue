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
import { usePreventScrollChaining } from '@/composables/usePreventScrollChaining';
import { waitForIndicatorPaint } from '@/motion/waitForIndicatorPaint';
import { scrollToSectionById } from '@/utils/scrollToSection';
import styles from './PageToc.module.css';

const props = defineProps<{
  items: Array<{ id: string; label: string }>;
}>();

const mode = defineModel<DocMode>('mode', { default: 'design' });

const route = useRoute();
const router = useRouter();

const sectionIds = computed(() => props.items.map((item) => item.id));
const { activeId, resetActive } = useScrollSpy(sectionIds);

const listRef = ref<HTMLElement | null>(null);
const tocBlockRef = ref<HTMLElement | null>(null);
const modeToggleRef = ref<HTMLElement | null>(null);
const designButtonRef = ref<HTMLElement | null>(null);
const developButtonRef = ref<HTMLElement | null>(null);

usePreventScrollChaining(tocBlockRef);

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
  void updateModeIndicator({
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
  void updateModeIndicator({ animateMove: false, previousMode: '' });

  if (listRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncIndicatorPosition();
    });
    resizeObserver.observe(listRef.value);
  }

  if (modeToggleRef.value) {
    modeToggleResizeObserver = new ResizeObserver(() => {
      syncModeIndicatorPosition();
    });
    modeToggleResizeObserver.observe(modeToggleRef.value);
  }
});

onBeforeUnmount(() => {
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
