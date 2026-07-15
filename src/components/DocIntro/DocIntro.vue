<script setup lang="ts">
import styles from './DocIntro.module.css';

defineProps<{
  name: string;
  description?: string;
}>();
</script>

<template>
  <div :class="styles.intro">
    <span :class="styles.pill">{{ name }}</span>
    <p v-if="description" :class="styles.description">{{ description }}</p>
  </div>
</template>
