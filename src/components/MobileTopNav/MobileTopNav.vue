<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { appRailIcons } from '@/assets/icons';
import EdsIcon from '@/components/EdsIcon/EdsIcon.vue';
import { useThemeProvider } from '@/composables/useThemeProvider';
import {
  primaryNav,
  sectionNavById,
} from '@/config/navigation';
import styles from './MobileTopNav.module.css';

const props = defineProps<{
  activeSectionId?: string;
}>();

const route = useRoute();
const { theme, toggleTheme } = useThemeProvider();
const isOpen = ref(false);
const mobileSectionId = ref<string | undefined>(props.activeSectionId);

const navLinks = computed(() =>
  primaryNav.filter((item): item is Extract<typeof item, { type: 'link' }> => item.type === 'link'),
);

const mobileSectionNav = computed(() =>
  mobileSectionId.value ? sectionNavById[mobileSectionId.value] : undefined,
);

const mobileSectionLinks = computed(
  () => mobileSectionNav.value?.groups.flatMap((group) => group.items) ?? [],
);

function hasSectionNav(itemId: string): boolean {
  return itemId in sectionNavById;
}

function selectSection(itemId: string) {
  mobileSectionId.value = itemId;
}

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

function setBodyScrollLocked(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

watch(
  () => props.activeSectionId,
  (sectionId) => {
    mobileSectionId.value = sectionId;
  },
);

watch(isOpen, (open) => {
  setBodyScrollLocked(open);

  if (open) {
    mobileSectionId.value = props.activeSectionId;
  }
});

watch(
  () => route.path,
  () => {
    closeMenu();
  },
);

onBeforeUnmount(() => {
  setBodyScrollLocked(false);
});
</script>

<template>
  <header :class="styles.header" aria-label="Mobile navigation">
    <div :class="styles.bar">
      <RouterLink to="/" :class="styles.logo" aria-label="返回首页" @click="closeMenu">
        <img :src="appRailIcons.logo" alt="" :class="styles.logoImage" />
      </RouterLink>

      <button
        type="button"
        :class="styles.menuToggle"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? '关闭' : '菜单'"
        aria-controls="mobile-nav-panel"
        @click="toggleMenu"
      >
        <span :class="[styles.burger, isOpen && styles.burgerActive]" aria-hidden="true" />
      </button>

      <div :class="styles.actions">
        <button
          type="button"
          :class="styles.themeButton"
          :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
          @click="toggleTheme"
        >
          <EdsIcon name="thematic" :class="styles.themeIcon" />
        </button>
      </div>
    </div>

    <div
      :class="[styles.backdrop, isOpen && styles.backdropVisible]"
      aria-hidden="true"
      @click="closeMenu"
    />

    <nav
      id="mobile-nav-panel"
      :class="[styles.panel, isOpen && styles.panelOpen]"
      :aria-hidden="!isOpen"
    >
      <div :class="styles.panelInner">
        <ul :class="styles.primaryList">
          <li v-for="item in navLinks" :key="item.id">
            <button
              v-if="hasSectionNav(item.id)"
              type="button"
              :class="[
                styles.primaryLink,
                mobileSectionId === item.id && styles.primaryLinkActive,
              ]"
              @click="selectSection(item.id)"
            >
              {{ item.label }}
            </button>
            <RouterLink
              v-else
              :to="item.to"
              :class="styles.primaryLink"
              @click="closeMenu"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>

        <div v-if="mobileSectionLinks.length" :class="styles.sectionBlock">
          <p v-if="mobileSectionNav" :class="styles.sectionTitle">{{ mobileSectionNav.title }}</p>
          <ul :class="styles.sectionList">
            <li v-for="item in mobileSectionLinks" :key="item.to">
              <RouterLink
                :to="item.to"
                :class="[styles.sectionLink, route.path === item.to && styles.sectionLinkActive]"
                @click="closeMenu"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
