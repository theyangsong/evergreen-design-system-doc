<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Doc } from '@blocksuite/store';
import type { PageEditor } from '@blocksuite/presets';
import {
  createPageEditor,
  ensureBlockSuiteEffects,
  extractHeadings,
  loadDoc,
  saveDocSnapshot,
  subscribeDocChanges,
  clearDocSnapshot,
} from './blocksuite';
import styles from './DocEditor.module.css';

const props = defineProps<{
  pagePath: string;
}>();

const emit = defineEmits<{
  headingsChange: [items: Array<{ id: string; label: string }>];
  ready: [];
  error: [message: string];
}>();

const hostRef = ref<HTMLDivElement>();
const status = ref<'loading' | 'ready' | 'error'>('loading');
const errorMessage = ref('');

let doc: Doc | null = null;
let editor: PageEditor | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;

function scheduleSave() {
  if (!doc) {
    return;
  }

  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    if (doc) {
      saveDocSnapshot(props.pagePath, doc);
    }
  }, 400);
}

function handleDocChange() {
  if (!doc) {
    return;
  }

  emit('headingsChange', extractHeadings(doc));
  scheduleSave();
}

function teardown() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  unsubscribe?.();
  unsubscribe = null;

  if (doc) {
    saveDocSnapshot(props.pagePath, doc);
  }

  editor?.remove();
  editor = null;
  doc = null;
}

async function mountEditor() {
  status.value = 'loading';
  errorMessage.value = '';

  try {
    ensureBlockSuiteEffects();
    doc = await loadDoc(props.pagePath);
    editor = createPageEditor(doc);

    await nextTick();

    if (!hostRef.value) {
      throw new Error('Editor container is not mounted.');
    }

    hostRef.value.replaceChildren(editor);
    emit('headingsChange', extractHeadings(doc));
    unsubscribe = subscribeDocChanges(doc, handleDocChange);

    await editor.updateComplete;

    status.value = 'ready';
    emit('ready');
  } catch (error) {
    clearDocSnapshot(props.pagePath);

    const message =
      error instanceof Error ? error.message : 'Failed to load BlockSuite editor.';
    status.value = 'error';
    errorMessage.value = message;
    emit('error', message);
    console.error('[DocEditor]', error);
  }
}

onMounted(() => {
  void mountEditor();
});

onBeforeUnmount(teardown);

watch(
  () => props.pagePath,
  async () => {
    teardown();
    await mountEditor();
  },
);
</script>

<template>
  <div :class="styles.shell">
    <p v-if="status === 'loading'" :class="styles.status">Loading editor…</p>
    <p v-else-if="status === 'error'" :class="styles.error">
      Editor failed to load: {{ errorMessage }}
    </p>
    <div ref="hostRef" :class="styles.editor" />
  </div>
</template>
