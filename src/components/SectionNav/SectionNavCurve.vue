<script setup lang="ts">
import { computed } from 'vue';
import {
  getSectionNavCurvePath,
  sectionNavCurveWidth,
} from '@/motion';
import styles from './SectionNavCurve.module.css';

const props = defineProps<{
  progress: number;
  height: number;
}>();

const pathD = computed(() =>
  getSectionNavCurvePath(props.height, props.progress),
);
</script>

<template>
  <svg
    :class="styles.curve"
    :viewBox="`0 0 ${sectionNavCurveWidth} ${Math.max(height, 1)}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path :d="pathD" />
  </svg>
</template>
