<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import type { SectionNavConfig } from '@/config/navigation';
import { usePreventScrollChaining } from '@/composables/usePreventScrollChaining';
import { waitForIndicatorPaint } from '@/motion/waitForIndicatorPaint';
import styles from './SectionNav.module.css';

const props = defineProps<{
  config: SectionNavConfig;
  collapsed?: boolean;
  instant?: boolean;
  revealProgress?: number;
}>();

const route = useRoute();
const groupsRef = ref<HTMLElement | null>(null);
const isGroupsScrolled = ref(false);

usePreventScrollChaining(groupsRef);

const linkRefs = new Map<string, HTMLElement>();
const indicatorTop = ref(0);
const indicatorHeight = ref(0);
const indicatorVisible = ref(false);
const indicatorMoveTransition = ref(true);
let resizeObserver: ResizeObserver | undefined;

function setLinkRef(path: string, element: Element | null) {
  if (element instanceof HTMLElement) {
    linkRefs.set(path, element);
    return;
  }

  linkRefs.delete(path);
}

function getActiveLink() {
  return linkRefs.get(route.path);
}

function syncIndicatorPosition() {
  const container = groupsRef.value;
  const link = getActiveLink();

  if (!container || !link) {
    indicatorVisible.value = false;
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  indicatorTop.value =
    linkRect.top - containerRect.top + container.scrollTop;
  indicatorHeight.value = link.offsetHeight;
  indicatorVisible.value = true;
}

async function updateIndicator(
  options: { animateMove?: boolean; previousActivePath?: string } = {},
) {
  const { animateMove = true, previousActivePath = '' } = options;

  await nextTick();

  if (!getActiveLink()) {
    indicatorMoveTransition.value = false;
    indicatorVisible.value = false;
    return;
  }

  const isFirstAppearance = !previousActivePath;

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

function updateGroupsScrollState() {
  const element = groupsRef.value;
  if (!element) {
    isGroupsScrolled.value = false;
    return;
  }

  isGroupsScrolled.value = element.scrollTop > 4;
}

function handleGroupsScroll() {
  updateGroupsScrollState();

  if (indicatorVisible.value) {
    syncIndicatorPosition();
  }
}

watch(
  () => route.path,
  (nextPath, previousPath) => {
    const hasActiveItem = props.config.groups.some((group) =>
      group.items.some((item) => item.to === nextPath),
    );

    if (!hasActiveItem) {
      indicatorVisible.value = false;
      return;
    }

    void updateIndicator({
      animateMove: Boolean(previousPath),
      previousActivePath: previousPath,
    });
  },
);

watch(
  () => props.config,
  () => {
    void updateIndicator({ animateMove: false, previousActivePath: '' });
  },
  { deep: true },
);

onMounted(() => {
  updateGroupsScrollState();
  void updateIndicator({ animateMove: false, previousActivePath: '' });

  if (groupsRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncIndicatorPosition();
      updateGroupsScrollState();
    });
    resizeObserver.observe(groupsRef.value);
    groupsRef.value.addEventListener('scroll', handleGroupsScroll, {
      passive: true,
    });
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  groupsRef.value?.removeEventListener('scroll', handleGroupsScroll);
});
</script>

<template>
  <aside
    :class="[
      styles.nav,
      collapsed && styles.navCollapsed,
      instant && styles.navInstant,
    ]"
    :style="{
      '--section-nav-reveal-progress': String(revealProgress ?? 1),
    }"
    :aria-label="`${config.title} section navigation`"
    :aria-hidden="collapsed"
  >
    <div :class="styles.navContent">
      <h2 :class="styles.title">{{ config.title }}</h2>

      <div
        ref="groupsRef"
        :class="[styles.groups, isGroupsScrolled && styles.groupsScrolled]"
      >
        <div :class="styles.groupsScrollFade" aria-hidden="true" />

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

        <section v-for="(group, index) in config.groups" :key="index">
          <p v-if="group.title" :class="styles.groupTitle">{{ group.title }}</p>

          <div :class="styles.list">
            <RouterLink
              v-for="item in group.items"
              :key="item.to"
              v-slot="{ href, navigate, isActive }"
              :to="item.to"
              custom
            >
              <a
                :ref="(element) => setLinkRef(item.to, element as Element | null)"
                :href="href"
                :class="[styles.link, isActive && styles.linkActive]"
                @click="navigate"
              >
                {{ item.label }}
              </a>
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </aside>
</template>
