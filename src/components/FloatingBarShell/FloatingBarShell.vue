<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';
import { useFloatingBarLiquidGlass } from '@/composables/useFloatingBarLiquidGlass';
import styles from './FloatingBarShell.module.css';

withDefaults(
  defineProps<{
    tag?: 'div' | 'section';
    rootClass?: string | string[] | Record<string, boolean>;
    style?: CSSProperties;
    ariaLabel?: string;
    layout?: 'row' | 'column';
  }>(),
  {
    tag: 'div',
    layout: 'row',
  },
);

const barRef = ref<HTMLElement | null>(null);

useFloatingBarLiquidGlass(barRef);
</script>

<template>
  <component
    :is="tag"
    ref="barRef"
    :class="[
      styles.bar,
      layout === 'column' && styles.barColumn,
      rootClass,
    ]"
    data-no-corner-smoothing
    :style="style"
    :aria-label="ariaLabel"
  >
    <slot />
  </component>
</template>
