<script setup lang="ts">
import styles from './PageHeader.module.css';

defineProps<{
  description: string;
}>();
</script>

<template>
  <header :class="styles.header">
    <p :class="styles.description">{{ description }}</p>
  </header>
</template>
