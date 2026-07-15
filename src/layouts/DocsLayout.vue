<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppRail from '@/components/AppRail/AppRail.vue';
import MobileTopNav from '@/components/MobileTopNav/MobileTopNav.vue';
import SectionNav from '@/components/SectionNav/SectionNav.vue';
import {
  getCurvedPanelBulge,
  getCurvedPanelClipPath,
  useCurvedPanelTransition,
} from '@/motion';
import { pageEnterAnimationKey } from '@/composables/usePageEnterAnimation';
import { usePreventScrollChaining } from '@/composables/usePreventScrollChaining';
import {
  getSectionIdFromPath,
  sectionNavById,
} from '@/config/navigation';
import styles from './DocsLayout.module.css';

const SECTION_NAV_WIDTH = 268;

const route = useRoute();
const contentShellRef = ref<HTMLElement | null>(null);
const sectionNavShellRef = ref<HTMLElement | null>(null);
const sectionNavShellHeight = ref(0);

usePreventScrollChaining(contentShellRef);

const sectionId = computed(() => getSectionIdFromPath(route.path));
const sectionNav = computed(() =>
  sectionId.value ? sectionNavById[sectionId.value] : undefined,
);
const sectionNavOpen = ref(false);
const pageEnterAnimationEnabled = ref(false);
const suppressNextPageEnter = ref(false);
const { progress, isAnimating, animateTo, setProgressImmediate } =
  useCurvedPanelTransition(false);

provide(pageEnterAnimationKey, pageEnterAnimationEnabled);

const isExplore = computed(() => route.name === 'explore');

const sectionNavCollapsed = computed(
  () => progress.value === 0 && !isAnimating.value,
);

const layoutStyle = computed(() => {
  const revealWidth = progress.value * SECTION_NAV_WIDTH;
  const bulge = getCurvedPanelBulge(progress.value, isAnimating.value);

  return {
    '--section-nav-current-width': sectionNav.value
      ? `${revealWidth + bulge}px`
      : '0px',
  };
});

const sectionNavShellStyle = computed(() => {
  if (!isAnimating.value) {
    return undefined;
  }

  const revealWidth = progress.value * SECTION_NAV_WIDTH;

  return {
    clipPath: getCurvedPanelClipPath(
      sectionNavShellHeight.value,
      revealWidth,
      progress.value,
    ),
  };
});

let sectionNavResizeObserver: ResizeObserver | undefined;

function syncSectionNavShellHeight() {
  sectionNavShellHeight.value = sectionNavShellRef.value?.clientHeight ?? 0;
}

function attachSectionNavResizeObserver() {
  sectionNavResizeObserver?.disconnect();

  if (!sectionNavShellRef.value) {
    return;
  }

  syncSectionNavShellHeight();
  sectionNavResizeObserver = new ResizeObserver(() => {
    syncSectionNavShellHeight();
  });
  sectionNavResizeObserver.observe(sectionNavShellRef.value);
}

async function syncSectionNavShellAfterMount() {
  await nextTick();
  attachSectionNavResizeObserver();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
  syncSectionNavShellHeight();
}

async function playSectionNavAnimation(open: boolean) {
  if (open) {
    await syncSectionNavShellAfterMount();
  }

  animateTo(open);
}

function toggleSectionNav() {
  sectionNavOpen.value = !sectionNavOpen.value;
}

function openSectionNav() {
  if (!sectionNavOpen.value) {
    suppressNextPageEnter.value = true;
  }
  sectionNavOpen.value = true;
}

watch(sectionNavOpen, (open) => {
  if (!sectionNav.value) {
    return;
  }

  void playSectionNavAnimation(open);
});

watch(
  () => sectionNav.value,
  async (nav, previousNav) => {
    if (!nav) {
      return;
    }

    const enteringFromNoSectionNav = !previousNav;

    if (enteringFromNoSectionNav && sectionNavOpen.value) {
      // Explore (or other no-nav routes): openSectionNav fires before the shell mounts.
      setProgressImmediate(0);
      await playSectionNavAnimation(true);
      return;
    }

    if (!enteringFromNoSectionNav) {
      await syncSectionNavShellAfterMount();
    }
  },
);

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (!oldPath || newPath === oldPath || isExplore.value) {
      pageEnterAnimationEnabled.value = false;
      return;
    }

    if (suppressNextPageEnter.value) {
      pageEnterAnimationEnabled.value = false;
      suppressNextPageEnter.value = false;
      return;
    }

    pageEnterAnimationEnabled.value =
      sectionNavOpen.value &&
      getSectionIdFromPath(newPath) === getSectionIdFromPath(oldPath);
  },
);

onMounted(() => {
  if (sectionNav.value) {
    void syncSectionNavShellAfterMount();
  }
});

onBeforeUnmount(() => {
  sectionNavResizeObserver?.disconnect();
});
</script>

<template>
  <div
    :class="[
      styles.layout,
      !sectionNav && styles.layoutNoSectionNav,
      isExplore && styles.layoutExplore,
      sectionNav && progress > 0 && styles.layoutSectionNavOpen,
      sectionNav && sectionNavCollapsed && styles.layoutNavCollapsed,
    ]"
    :style="layoutStyle"
  >
    <MobileTopNav
      :class="styles.showOnMobile"
      :active-section-id="sectionId"
    />

    <AppRail
      :class="styles.hideOnMobile"
      :active-section-id="sectionId"
      @toggle-section-nav="toggleSectionNav"
      @open-section-nav="openSectionNav"
    />

    <div
      v-if="sectionNav"
      ref="sectionNavShellRef"
      :class="[
        styles.sectionNavShell,
        sectionNavCollapsed && styles.sectionNavShellCollapsed,
        isAnimating && styles.sectionNavShellAnimating,
        styles.hideOnMobile,
      ]"
      :style="sectionNavShellStyle"
    >
      <SectionNav
        :key="sectionId"
        :config="sectionNav"
        :collapsed="sectionNavCollapsed"
        :reveal-progress="progress"
      />
    </div>

    <main :class="[styles.main, isExplore && styles.mainExplore]">
      <div
        v-if="!isExplore"
        ref="contentShellRef"
        data-doc-scroll
        :class="[styles.contentShell, styles.contentShellDoc, 'effect-molde-level']"
      >
        <RouterView />
      </div>
      <div v-else :class="[styles.contentShell, 'effect-molde-level']">
        <RouterView />
      </div>
    </main>
  </div>
</template>
