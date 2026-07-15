<script setup lang="ts">
import { RouterLink } from 'vue-router';
import styles from './NotFoundView.module.css';
</script>

<template>
  <section :class="styles.notFound">
    <h1 :class="styles.title">Page not found</h1>
    <p :class="styles.body">
      该页面尚未配置。
      <RouterLink to="/atoms/color-system" :class="styles.link">
        返回 Color System
      </RouterLink>
    </p>
  </section>
</template>
