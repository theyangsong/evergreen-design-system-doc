<script setup lang="ts">
import { scopeIcons, type EdsIconName } from '@/assets/icons';
import EdsIcon from '@/components/EdsIcon/EdsIcon.vue';
import type { DocMode } from '@/content/docPage';
import styles from './DocScopeToggle.module.css';

defineProps<{
  scopes: Array<{ id: string; label: string }>;
  mode: DocMode;
}>();

const scope = defineModel<string>('scope', { default: '' });

function iconName(scopeId: string): EdsIconName {
  return scopeIcons[scopeId as keyof typeof scopeIcons];
}
</script>

<template>
  <div
    :class="styles.root"
    role="tablist"
    :aria-label="mode === 'design' ? 'Design scope' : 'Develop platform'"
  >
    <span
      v-for="scopeTab in scopes"
      :key="scopeTab.id"
      :class="styles.buttonWrap"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="scope === scopeTab.id"
        :aria-label="scopeTab.label"
        :class="[
          styles.button,
          scope === scopeTab.id && styles.buttonActive,
        ]"
        @click="scope = scopeTab.id"
      >
        <EdsIcon :name="iconName(scopeTab.id)" :class="styles.icon" />
      </button>
      <span :class="styles.tooltip" role="tooltip">{{ scopeTab.label }}</span>
    </span>
  </div>
</template>
