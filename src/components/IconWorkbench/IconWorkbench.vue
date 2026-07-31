<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue';
import IconSearchField from '@/components/IconWorkbench/IconSearchField.vue';
import IconBatchDetailPanel from '@/components/IconWorkbench/IconBatchDetailPanel.vue';
import IconDetailPanel from '@/components/IconWorkbench/IconDetailPanel.vue';
import IconGridSection from '@/components/IconWorkbench/IconGridSection.vue';
import { useArticleAlignedDock } from '@/composables/useArticleAlignedDock';
import { ICON_CATEGORIES } from '@/icons/categories';
import { downloadIconsZip } from '@/icons/downloadZip';
import { iconRegistry } from '@/icons/registry';
import { renderIconHtml } from '@/icons/renderIconHtml';
import { filterIcons } from '@/icons/search';
import { DEFAULT_ICON_PARAMS } from '@/icons/types';
import type { IconRegistryEntry } from '@/icons/types';
import styles from './IconWorkbench.module.css';

const searchQuery = defineModel<string>('searchQuery', { required: true });

const props = defineProps<{
  anchorElement?: HTMLElement | null;
}>();

const anchorRef = toRef(props, 'anchorElement');
const { dockStyle, syncPosition } = useArticleAlignedDock(anchorRef);

const gridParams = DEFAULT_ICON_PARAMS;
const detailParams = ref({ ...DEFAULT_ICON_PARAMS });
const batchParams = ref({ ...DEFAULT_ICON_PARAMS });
const batchMode = ref(false);
const batchSelectedNames = ref<Set<string>>(new Set());
const selectedEntry = ref<IconRegistryEntry | null>(null);

const filteredIcons = computed(() =>
  filterIcons(iconRegistry, searchQuery.value),
);

const visibleCategories = computed(() =>
  ICON_CATEGORIES.map((category) => ({
    ...category,
    icons: filteredIcons.value.filter((entry) => entry.category === category.id),
  })).filter((category) => category.icons.length > 0),
);

const batchSelectedEntries = computed(() =>
  iconRegistry.filter((entry) => batchSelectedNames.value.has(entry.name)),
);

const showDetailDock = computed(
  () => Boolean(selectedEntry.value) && !batchMode.value,
);

const showBatchDock = computed(
  () => batchMode.value && batchSelectedNames.value.size > 0,
);

const showDock = computed(() => showDetailDock.value || showBatchDock.value);

watch(batchMode, (enabled) => {
  if (!enabled) {
    batchSelectedNames.value = new Set();
  } else {
    selectedEntry.value = null;
  }
});

watch(showDock, (visible) => {
  if (visible) {
    nextTick(() => {
      syncPosition();
    });
  }
});

function onSelect(entry: IconRegistryEntry) {
  selectedEntry.value = entry;
}

function onStartBatch(entry: IconRegistryEntry) {
  selectedEntry.value = null;
  batchMode.value = true;
  batchSelectedNames.value = new Set([entry.name]);
}

function onToggleBatch(entry: IconRegistryEntry) {
  const next = new Set(batchSelectedNames.value);

  if (next.has(entry.name)) {
    next.delete(entry.name);
  } else {
    next.add(entry.name);
  }

  batchSelectedNames.value = next;

  if (next.size === 0) {
    batchMode.value = false;
  }
}

function exitBatchMode() {
  batchMode.value = false;
  batchSelectedNames.value = new Set();
}

function onBatchDownload() {
  if (!batchSelectedEntries.value.length) {
    return;
  }

  downloadIconsZip(
    batchSelectedEntries.value,
    batchParams.value,
    renderIconHtml,
    'evergreen-icons.zip',
  );
}

function closeDetail() {
  selectedEntry.value = null;
}
</script>

<template>
  <div
    :class="[
      styles.workbench,
      showDock && styles.workbenchWithDock,
    ]"
  >
    <div v-if="filteredIcons.length" :class="styles.sections">
      <IconGridSection
        v-for="category in visibleCategories"
        :key="category.id"
        :category-id="category.id"
        :category-label="category.label"
        :icons="category.icons"
        :params="gridParams"
        :selected-name="selectedEntry?.name"
        :batch-mode="batchMode"
        :batch-selected-names="batchSelectedNames"
        @select="onSelect"
        @start-batch="onStartBatch"
        @toggle-batch="onToggleBatch"
      />
    </div>

    <p v-else :class="styles.emptyState">
      未找到匹配图标，请尝试其他关键词。
    </p>

    <IconDetailPanel
      v-if="showDetailDock && selectedEntry"
      v-model:params="detailParams"
      :entry="selectedEntry"
      :dock-style="dockStyle"
      @close="closeDetail"
    />

    <IconBatchDetailPanel
      v-if="showBatchDock"
      v-model:params="batchParams"
      :selected-count="batchSelectedNames.size"
      :dock-style="dockStyle"
      @download="onBatchDownload"
      @close="exitBatchMode"
    />
  </div>
</template>
