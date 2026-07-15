<script setup lang="ts">
import styles from './DocContentBlock.module.css';

defineProps<{
  label: string;
}>();
</script>

<template>
  <section :class="styles.block">
    <span :class="styles.label">{{ label }}</span>
    <div :class="styles.content">
      <slot />
    </div>
  </section>
</template>
