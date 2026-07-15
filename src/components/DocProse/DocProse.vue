<script setup lang="ts">
import styles from './DocProse.module.css';
</script>

<template>
  <div :class="styles.prose">
    <slot />
  </div>
</template>
