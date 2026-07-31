<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatIconDisplayName } from '@/icons/formatIconName';
import { renderIconHtml } from '@/icons/renderIconHtml';
import type { IconDisplayParams, IconRegistryEntry } from '@/icons/types';
import styles from './IconGridItem.module.css';

const props = defineProps<{
  entry: IconRegistryEntry;
  params: IconDisplayParams;
  selected?: boolean;
  batchMode?: boolean;
  batchSelected?: boolean;
}>();

const emit = defineEmits<{
  select: [entry: IconRegistryEntry];
  startBatch: [entry: IconRegistryEntry];
  toggleBatch: [entry: IconRegistryEntry];
}>();

const hovered = ref(false);

const previewHtml = computed(() => renderIconHtml(props.entry, props.params));
const displayName = computed(() => formatIconDisplayName(props.entry.name));
const showCheckbox = computed(() => hovered.value || props.batchMode);

function onTileClick() {
  if (props.batchMode) {
    emit('toggleBatch', props.entry);
    return;
  }

  emit('select', props.entry);
}

function onCheckboxClick() {
  if (!props.batchMode) {
    emit('startBatch', props.entry);
    return;
  }

  emit('toggleBatch', props.entry);
}

function onTileKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  event.preventDefault();
  onTileClick();
}
</script>

<template>
  <div
    :class="[
      styles.gridItem,
    ]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div
      :class="[
        styles.tile,
        ((!batchMode && selected) || (batchMode && batchSelected)) && styles.tileActive,
      ]"
      role="button"
      tabindex="0"
      :aria-label="displayName"
      :aria-pressed="batchMode ? batchSelected : selected"
      @click="onTileClick"
      @keydown="onTileKeydown"
    >
      <span
        :class="styles.preview"
        aria-hidden="true"
        v-html="previewHtml"
      />

      <button
        v-if="showCheckbox"
        type="button"
        :class="[
          styles.batchCheckbox,
          batchSelected && styles.batchCheckboxChecked,
        ]"
        :aria-label="batchSelected ? `取消选择 ${displayName}` : `批量选择 ${displayName}`"
        :aria-pressed="batchSelected"
        @click.stop="onCheckboxClick"
      >
        <svg
          v-if="batchSelected"
          :class="styles.batchCheckIcon"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <span :class="styles.name">{{ displayName }}</span>
  </div>
</template>
