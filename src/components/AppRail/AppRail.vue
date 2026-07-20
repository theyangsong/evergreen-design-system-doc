<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { useThemeProvider } from '@/composables/useThemeProvider';
import { appRailIcons, type EdsIconName } from '@/assets/icons';
import EdsIcon from '@/components/EdsIcon/EdsIcon.vue';
import BrandSwitcher from '@/components/BrandSwitcher/BrandSwitcher.vue';
import { primaryNav, sectionDefaultRoute } from '@/config/navigation';
import styles from './AppRail.module.css';

const props = defineProps<{
  activeSectionId?: string;
}>();

const emit = defineEmits<{
  toggleSectionNav: [];
  openSectionNav: [];
}>();

const route = useRoute();
const { theme, toggleTheme } = useThemeProvider();

function resolveRailLink(itemId: string, fallbackTo: string): string {
  if (props.activeSectionId === itemId) {
    return route.path;
  }

  return sectionDefaultRoute[itemId] ?? fallbackTo;
}

function handleNavClick(event: MouseEvent, itemId: string) {
  if (props.activeSectionId === itemId) {
    event.preventDefault();
    emit('toggleSectionNav');
  } else {
    emit('openSectionNav');
  }
}

function iconName(id: string): EdsIconName {
  return appRailIcons[id as keyof typeof appRailIcons] as EdsIconName;
}
</script>

<template>
  <aside :class="styles.rail" aria-label="Primary navigation">
    <div :class="styles.logoShell">
      <RouterLink to="/" :class="styles.logo" aria-label="返回首页">
        <img :src="appRailIcons.logo" alt="" :class="styles.logoImage" />
      </RouterLink>
    </div>

    <nav :class="styles.navItems">
      <template v-for="item in primaryNav" :key="item.id">
        <div v-if="item.type === 'divider'" :class="styles.divider" role="separator">
          <span :class="styles.dividerLine" />
        </div>

        <RouterLink
          v-else
          :to="resolveRailLink(item.id, item.to)"
          :class="styles.item"
          @click="handleNavClick($event, item.id)"
        >
          <span
            :class="[
              styles.iconButton,
              activeSectionId === item.id && styles.iconButtonActive,
            ]"
          >
            <EdsIcon :name="iconName(item.id)" :class="styles.icon" />
          </span>
          <span :class="styles.label">{{ item.label }}</span>
        </RouterLink>
      </template>
    </nav>

    <div :class="styles.footer">
      <BrandSwitcher />
      <button
        type="button"
        :class="styles.themeButton"
        :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
        @click="toggleTheme"
      >
        <EdsIcon :name="iconName('theme')" :class="styles.themeIcon" />
      </button>
    </div>
  </aside>
</template>
