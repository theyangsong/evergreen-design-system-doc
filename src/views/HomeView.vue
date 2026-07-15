<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useLiquidGlassBubbles } from '@/composables/useLiquidGlassBubbles';
import edsLogoWhite from '@/assets/icons/eds-logo-white.svg';
import { siteConfig } from '@/config/site';
import styles from './HomeView.module.css';

const docsEntry = '/explore';
const canvasHost = ref<HTMLElement | null>(null);

useLiquidGlassBubbles(canvasHost, {
  title: 'EDS.',
  subtitle: 'EverGreen Ecosystem Builder',
});
</script>

<template>
  <div :class="styles.page">
    <div ref="canvasHost" :class="styles.canvasHost" />

    <img
      :src="edsLogoWhite"
      alt="EDS"
      :class="styles.brandLogo"
      width="56"
      height="56"
    />

    <div :class="styles.overlay">
      <RouterLink :to="docsEntry" :class="styles.entry">
        Get Started
        <span :class="styles.entryHint">Version 1.0</span>
      </RouterLink>
    </div>

    <footer :class="styles.footer">
      <p :class="styles.footerTagline">{{ siteConfig.footer.tagline }}</p>
      <div :class="styles.footerLinks">
        <a
          v-for="link in siteConfig.footer.links"
          :key="link.label"
          :href="link.href"
          :class="styles.footerLink"
        >
          {{ link.label }}
        </a>
      </div>
    </footer>
  </div>
</template>
