<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocPageCommon from '@/components/DocPageCommon/DocPageCommon.vue';
import DocPageFooter from '@/components/DocPageFooter/DocPageFooter.vue';
import PageToc from '@/components/PageToc/PageToc.vue';
import { usePageEnterAnimation } from '@/composables/usePageEnterAnimation';
import { getDocPage } from '@/config/navigation';
import {
  docMarkdownStyles,
  renderMarkdown,
  useDocMarkdownCopy,
} from '@/markdown';
import NotFoundView from '@/views/NotFoundView.vue';
import styles from './DocPageView.module.css';

const route = useRoute();
const router = useRouter();
const mode = ref<'design' | 'develop'>('design');
const pageEnterAnimationEnabled = usePageEnterAnimation();
const { handleMarkdownBodyClick } = useDocMarkdownCopy({
  onDevelopLink: () => {
    mode.value = 'develop';
  },
});

const docPath = computed(
  () => (route.meta.docPath as string | undefined) ?? route.path,
);
const page = computed(() => getDocPage(docPath.value));

const sections = computed(() => {
  if (!page.value) {
    return [];
  }

  if (mode.value === 'develop') {
    return page.value.developSections ?? [];
  }

  return page.value.designSections ?? page.value.placeholderSections ?? [];
});

const sectionIdsByTitle = computed(() =>
  Object.fromEntries(sections.value.map((section) => [section.title, section.id])),
);

const markdownContent = computed(() => {
  if (!page.value) {
    return '';
  }

  if (mode.value === 'develop') {
    return page.value.developContent ?? page.value.defaultContent ?? '';
  }

  return page.value.designContent ?? page.value.defaultContent ?? '';
});

const devMediaCacheBust = import.meta.env.DEV
  ? String(Math.trunc(performance.timeOrigin))
  : undefined;

const renderedBodyHtml = computed(() =>
  renderMarkdown(
    markdownContent.value,
    sectionIdsByTitle.value,
    page.value?.imageAssetDir,
    devMediaCacheBust,
  ),
);

const tocItems = computed(() =>
  sections.value.map((section) => ({ id: section.id, label: section.title })),
);

watch(mode, () => {
  router.replace({ path: route.path, hash: '' }).catch(() => undefined);
});

watch(
  () => route.path,
  () => {
    mode.value = 'design';
  },
);
</script>

<template>
  <template v-if="page">
    <div
      :key="docPath"
      :class="[styles.pageShell, pageEnterAnimationEnabled && 'eds-motion-page-enter']"
    >
      <article :class="styles.content">
        <DocPageCommon
          :title="page.title"
          :meta="page.meta"
        />

        <div :class="styles.body" data-doc-body>
          <div
            v-if="renderedBodyHtml"
            :class="docMarkdownStyles.markdownBody"
            v-html="renderedBodyHtml"
            @click="handleMarkdownBodyClick"
          />
        </div>

        <DocPageFooter />
      </article>

      <PageToc
        v-model:mode="mode"
        :class="styles.tocColumn"
        :items="tocItems"
      />
    </div>
  </template>

  <NotFoundView v-else />
</template>
