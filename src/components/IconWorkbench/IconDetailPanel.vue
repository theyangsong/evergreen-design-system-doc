<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue';
import FloatingBarShell from '@/components/FloatingBarShell/FloatingBarShell.vue';
import IconParamControls from '@/components/IconWorkbench/IconParamControls.vue';
import { formatIconDisplayName } from '@/icons/formatIconName';
import { downloadSvgFile } from '@/icons/downloadZip';
import {
  buildReactSnippet,
  buildVueSnippet,
  renderIconHtml,
} from '@/icons/renderIconHtml';
import type { IconDisplayParams, IconRegistryEntry } from '@/icons/types';
import styles from './IconDetailPanel.module.css';

const props = defineProps<{
  entry: IconRegistryEntry;
  dockStyle: CSSProperties;
}>();

const paramsModel = defineModel<IconDisplayParams>('params', { required: true });

const emit = defineEmits<{
  close: [];
}>();

const copyFeedback = ref('');

const displayName = computed(() => formatIconDisplayName(props.entry.name));
const previewHtml = computed(() => renderIconHtml(props.entry, paramsModel.value));
const vueSnippet = computed(() => buildVueSnippet(props.entry.name));
const reactSnippet = computed(() => buildReactSnippet(props.entry.name));
const svgSnippet = computed(() => previewHtml.value);

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.value = `已复制 ${label}`;
  } catch {
    copyFeedback.value = `复制 ${label} 失败`;
  }

  window.setTimeout(() => {
    copyFeedback.value = '';
  }, 2000);
}

function downloadSvg() {
  downloadSvgFile(props.entry.name, svgSnippet.value);
}
</script>

<template>
  <Teleport to="body">
    <FloatingBarShell
      tag="section"
      :root-class="styles.detailDock"
      :style="dockStyle"
      aria-label="图标详情"
    >
      <div :class="styles.body">
        <span
          :class="styles.preview"
          aria-hidden="true"
          v-html="previewHtml"
        />

        <div :class="styles.titleGroup">
          <h3 :class="styles.title">{{ displayName }}</h3>
          <p v-if="entry.label" :class="styles.subtitle">
            {{ entry.label }} · {{ entry.variant }}
          </p>
        </div>

        <div :class="styles.actions">
          <button
            type="button"
            :class="styles.actionButton"
            @click="copyText(displayName, '名称')"
          >
            复制名称
          </button>
          <button
            type="button"
            :class="styles.actionButton"
            @click="copyText(vueSnippet, 'Vue 代码')"
          >
            复制 Vue
          </button>
          <button
            type="button"
            :class="styles.actionButton"
            @click="copyText(reactSnippet, 'React 代码')"
          >
            复制 React
          </button>
          <button
            type="button"
            :class="styles.actionButton"
            @click="copyText(svgSnippet, 'SVG')"
          >
            复制 SVG
          </button>
          <button
            type="button"
            :class="styles.actionButton"
            @click="downloadSvg"
          >
            下载 SVG
          </button>
          <button
            type="button"
            :class="styles.closeButton"
            aria-label="关闭详情"
            @click="emit('close')"
          >
            ×
          </button>
        </div>
      </div>

      <IconParamControls v-model:params="paramsModel" />

      <p v-if="copyFeedback" :class="styles.feedback">{{ copyFeedback }}</p>
    </FloatingBarShell>
  </Teleport>
</template>
