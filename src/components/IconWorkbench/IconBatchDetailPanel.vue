<script setup lang="ts">
import { type CSSProperties } from 'vue';
import FloatingBarShell from '@/components/FloatingBarShell/FloatingBarShell.vue';
import IconParamControls from '@/components/IconWorkbench/IconParamControls.vue';
import type { IconDisplayParams } from '@/icons/types';
import styles from './IconDetailPanel.module.css';

defineProps<{
  selectedCount: number;
  dockStyle: CSSProperties;
}>();

const paramsModel = defineModel<IconDisplayParams>('params', { required: true });

const emit = defineEmits<{
  download: [];
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <FloatingBarShell
      tag="section"
      :root-class="styles.detailDock"
      :style="dockStyle"
      aria-label="批量导出"
    >
      <div :class="styles.body">
        <div :class="styles.titleGroup">
          <h3 :class="styles.title">已选 {{ selectedCount }} 个图标</h3>
          <p :class="styles.subtitle">调整参数后批量下载 SVG</p>
        </div>

        <div :class="styles.actions">
          <button
            type="button"
            :class="styles.actionButton"
            @click="emit('download')"
          >
            下载 ZIP
          </button>
          <button
            type="button"
            :class="styles.closeButton"
            aria-label="关闭批量选择"
            @click="emit('close')"
          >
            ×
          </button>
        </div>
      </div>

      <IconParamControls v-model:params="paramsModel" />
    </FloatingBarShell>
  </Teleport>
</template>
