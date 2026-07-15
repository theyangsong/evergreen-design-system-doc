<script setup lang="ts">
import { computed } from 'vue';
import { getAvatarColor, getPersonInitial } from './personAvatar';
import styles from './PersonAvatar.module.css';

const props = defineProps<{
  name: string;
}>();

const initial = computed(() => getPersonInitial(props.name));
const backgroundColor = computed(() => getAvatarColor(props.name));
</script>

<template>
  <span
    :class="styles.avatar"
    :style="{ backgroundColor }"
    role="img"
    :aria-label="`${name} avatar`"
  >
    {{ initial }}
  </span>
</template>
