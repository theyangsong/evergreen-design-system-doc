<script setup lang="ts">
import { computed } from 'vue';
import type { EdsIconName } from '@/assets/icons';
import { edsIcons } from '@/assets/icons';
import styles from './EdsIcon.module.css';

const props = defineProps<{
  name: EdsIconName;
  class?: string;
}>();

const icon = computed(() => edsIcons[props.name]);
</script>

<template>
  <span
    :class="[styles.icon, styles[icon.variant], props.class]"
    aria-hidden="true"
    v-html="icon.content"
  />
</template>
