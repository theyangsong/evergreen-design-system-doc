<script setup lang="ts">
import IconGridItem from '@/components/IconWorkbench/IconGridItem.vue';
import type { IconCategoryId } from '@/icons/categories';
import { categorySectionId } from '@/icons/categories';
import type { IconDisplayParams, IconRegistryEntry } from '@/icons/types';
import styles from './IconGridSection.module.css';

defineProps<{
  categoryId: IconCategoryId;
  categoryLabel: string;
  icons: IconRegistryEntry[];
  params: IconDisplayParams;
  selectedName?: string | null;
  batchMode?: boolean;
  batchSelectedNames?: Set<string>;
}>();

const emit = defineEmits<{
  select: [entry: IconRegistryEntry];
  startBatch: [entry: IconRegistryEntry];
  toggleBatch: [entry: IconRegistryEntry];
}>();
</script>

<template>
  <section
    :id="categorySectionId(categoryId)"
    :class="styles.section"
  >
    <p :class="styles.sectionTitle">{{ categoryLabel }}</p>

    <div v-if="icons.length" :class="styles.grid">
      <IconGridItem
        v-for="entry in icons"
        :key="entry.name"
        :entry="entry"
        :params="params"
        :selected="selectedName === entry.name"
        :batch-mode="batchMode"
        :batch-selected="batchSelectedNames?.has(entry.name)"
        @select="emit('select', $event)"
        @start-batch="emit('startBatch', $event)"
        @toggle-batch="emit('toggleBatch', $event)"
      />
    </div>

    <p v-else :class="styles.empty">该分类下暂无匹配图标。</p>
  </section>
</template>
