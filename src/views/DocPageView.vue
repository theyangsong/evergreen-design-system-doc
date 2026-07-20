<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocPageCommon from '@/components/DocPageCommon/DocPageCommon.vue';
import DocPageFooter from '@/components/DocPageFooter/DocPageFooter.vue';
import DocScopeToggle from '@/components/DocScopeToggle/DocScopeToggle.vue';
import PageToc from '@/components/PageToc/PageToc.vue';
import {
  getAvailableScopes,
  getBundleMarkdown,
  getDefaultScope,
  getImageAssetDir,
  getScopeLabel,
  isComponentDocPage,
  type DocMode,
  type DocScopeId,
} from '@/content/docPage';
import { parseDocSections } from '@/content/parseDocSections';
import { usePageEnterAnimation } from '@/composables/usePageEnterAnimation';
import { getDocPage, resolveDocMetaFields } from '@/config/navigation';
import {
  docMarkdownStyles,
  renderMarkdown,
  useDocMarkdownCopy,
} from '@/markdown';
import NotFoundView from '@/views/NotFoundView.vue';
import styles from './DocPageView.module.css';

const route = useRoute();
const router = useRouter();
const mode = ref<DocMode>('design');
const scope = ref<DocScopeId | ''>('');
const pageEnterAnimationEnabled = usePageEnterAnimation();

const docPath = computed(
  () => (route.meta.docPath as string | undefined) ?? route.path,
);
const page = computed(() => getDocPage(docPath.value));
const displayMeta = computed(() =>
  page.value ? resolveDocMetaFields(page.value.meta, page.value.sectionId) : undefined,
);
const usesBundles = computed(() =>
  page.value ? isComponentDocPage(page.value) : false,
);

const availableScopes = computed(() => {
  if (!page.value?.bundles) {
    return [];
  }

  return getAvailableScopes(page.value.bundles, mode.value);
});

const scopeTabs = computed(() =>
  availableScopes.value.map((scopeId) => ({
    id: scopeId,
    label: getScopeLabel(mode.value, scopeId),
  })),
);

const showScopeTabs = computed(() => scopeTabs.value.length > 1);

function syncScopeForMode(nextMode: DocMode) {
  if (!page.value?.bundles) {
    scope.value = '';
    return;
  }

  const nextScope = getDefaultScope(page.value.bundles, nextMode);
  if (nextScope && availableScopes.value.includes(nextScope)) {
    scope.value = nextScope;
    return;
  }

  scope.value = availableScopes.value[0] ?? '';
}

const { handleMarkdownBodyClick } = useDocMarkdownCopy({
  onDevelopLink: () => {
    mode.value = 'develop';
    syncScopeForMode('develop');
  },
});

const sections = computed(() => {
  if (!page.value) {
    return [];
  }

  if (usesBundles.value && scope.value) {
    const markdown = getBundleMarkdown(page.value.bundles, mode.value, scope.value);
    return parseDocSections(markdown, mode.value, scope.value);
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

  if (usesBundles.value && scope.value) {
    return getBundleMarkdown(page.value.bundles, mode.value, scope.value);
  }

  if (mode.value === 'develop') {
    return page.value.developContent ?? page.value.defaultContent ?? '';
  }

  return page.value.designContent ?? page.value.defaultContent ?? '';
});

const devMediaCacheBust = import.meta.env.DEV
  ? String(Math.trunc(performance.timeOrigin))
  : undefined;

const imageAssetDir = computed(() => {
  if (!page.value?.imageAssetDir) {
    return undefined;
  }

  if (usesBundles.value) {
    return getImageAssetDir(page.value.imageAssetDir, mode.value, scope.value);
  }

  return page.value.imageAssetDir;
});

const renderedBodyHtml = computed(() =>
  renderMarkdown(
    markdownContent.value,
    sectionIdsByTitle.value,
    imageAssetDir.value,
    devMediaCacheBust,
    sections.value,
  ),
);

const tocItems = computed(() =>
  sections.value.map((section) => ({
    id: section.id,
    label: section.title,
    depth: section.depth ?? 1,
  })),
);

const showEmptyState = computed(
  () => usesBundles.value && !markdownContent.value.trim(),
);

const pageTocRef = ref<{ refreshSpy: () => void } | null>(null);

watch([renderedBodyHtml, tocItems], () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      pageTocRef.value?.refreshSpy();
    });
  });
});

watch(mode, () => {
  syncScopeForMode(mode.value);
  router.replace({ path: route.path, hash: '' }).catch(() => undefined);
});

watch(scope, () => {
  router.replace({ path: route.path, hash: '' }).catch(() => undefined);
});

watch(
  () => route.path,
  () => {
    mode.value = 'design';
    syncScopeForMode('design');
  },
);

watch(
  () => page.value?.bundles,
  () => {
    syncScopeForMode(mode.value);
  },
  { immediate: true },
);
</script>

<template>
  <template v-if="page">
    <div :class="styles.pageShell">
      <article
        :key="docPath"
        :class="[
          styles.content,
          pageEnterAnimationEnabled && 'eds-motion-page-enter',
        ]"
      >
        <DocPageCommon
          :title="page.title"
          :meta="displayMeta"
        >
          <template v-if="showScopeTabs" #after-title>
            <DocScopeToggle
              v-model:scope="scope"
              :scopes="scopeTabs"
              :mode="mode"
            />
          </template>
        </DocPageCommon>

        <div :class="styles.body" data-doc-body>
          <p v-if="showEmptyState" :class="styles.emptyState">
            该端口文档撰写中。
          </p>
          <div
            v-else-if="renderedBodyHtml"
            :class="docMarkdownStyles.markdownBody"
            v-html="renderedBodyHtml"
            @click="handleMarkdownBodyClick"
          />
        </div>

        <DocPageFooter />
      </article>

      <PageToc
        ref="pageTocRef"
        v-model:mode="mode"
        :class="styles.tocColumn"
        :items="tocItems"
      />
    </div>
  </template>

  <NotFoundView v-else />
</template>
