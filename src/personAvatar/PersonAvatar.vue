<script setup lang="ts">
import { computed } from 'vue';
import { getAvatarColor, getPersonInitial } from './personAvatar';
import styles from './PersonAvatar.module.css';

const props = defineProps<{
  name: string;
  /** Shifts palette index when multiple people share one meta row. */
  paletteOffset?: number;
}>();

const initial = computed(() => getPersonInitial(props.name));
const backgroundColor = computed(() =>
  getAvatarColor(props.name, props.paletteOffset ?? 0),
);
</script>

<template>
  <span
    :class="styles.avatar"
    :style="{ backgroundColor }"
    role="img"
    :aria-label="`${name} avatar`"
  >
    <span :class="styles.initial">{{ initial }}</span>
  </span>
</template>
