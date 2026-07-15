<script setup lang="ts">
import { siteConfig } from '@/config/site';
import styles from './DocPageFooter.module.css';
</script>

<template>
  <footer :class="styles.footer">
    <p :class="[styles.line, styles.emphasis]">{{ siteConfig.footer.tagline }}</p>
    <p :class="[styles.line, styles.links]">
      <a
        v-for="link in siteConfig.footer.links"
        :key="link.label"
        :href="link.href"
        :class="styles.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.label }}
      </a>
    </p>
    <p :class="[styles.line, styles.copyright, styles.emphasis]">{{ siteConfig.footer.copyright }}</p>
  </footer>
</template>
