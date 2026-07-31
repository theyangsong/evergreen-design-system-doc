<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocPageCommon from '@/components/DocPageCommon/DocPageCommon.vue';
import DocPageFooter from '@/components/DocPageFooter/DocPageFooter.vue';
import PageToc from '@/components/PageToc/PageToc.vue';
import IconWorkbench from '@/components/IconWorkbench/IconWorkbench.vue';
import IconSearchField from '@/components/IconWorkbench/IconSearchField.vue';
import type { DocMode } from '@/content/docPage';
import { parseDocSections } from '@/content/parseDocSections';
import { usePageEnterAnimation } from '@/composables/usePageEnterAnimation';
import { getDocScrollContainer } from '@/utils/scrollToSection';
import { getIconCategoryTocItems } from '@/icons/categories';
import { iconsDevelopMarkdown } from '@/icons/developContent';
import {
  docMarkdownStyles,
  renderMarkdown,
  useDocMarkdownCopy,
} from '@/markdown';
import pageShellStyles from '@/views/DocPageView.module.css';
import styles from './IconsPageView.module.css';

const route = useRoute();
const router = useRouter();
const mode = ref<DocMode>('design');
const searchQuery = ref('');
const articleRef = ref<HTMLElement | null>(null);
const pageEnterAnimationEnabled = usePageEnterAnimation();
const sidebarRef = ref<{ refreshSpy: () => void } | null>(null);

const categoryTocItems = getIconCategoryTocItems();

const developSections = computed(() =>
  parseDocSections(iconsDevelopMarkdown, 'develop', 'desktop'),
);

const developSectionIdsByTitle = computed(() =>
  Object.fromEntries(
    developSections.value.map((section) => [section.title, section.id]),
  ),
);

const developHtml = computed(() =>
  renderMarkdown(
    iconsDevelopMarkdown,
    developSectionIdsByTitle.value,
    undefined,
    undefined,
    developSections.value,
  ),
);

const developTocItems = computed(() =>
  developSections.value.map((section) => ({
    id: section.id,
    label: section.title,
    depth: section.depth ?? 1,
  })),
);

const sidebarItems = computed(() =>
  mode.value === 'design' ? categoryTocItems : developTocItems.value,
);

const { handleMarkdownBodyClick } = useDocMarkdownCopy();

watch(mode, () => {
  router.replace({ path: route.path, hash: '' }).catch(() => undefined);
});

watch([developHtml, developTocItems, sidebarItems], () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      sidebarRef.value?.refreshSpy();
    });
  });
});

watch(
  () => route.path,
  () => {
    mode.value = 'design';
    searchQuery.value = '';
  },
);

const isScrolled = ref(false);
let scrollContainer: HTMLElement | null = null;

function updateScrolled() {
  isScrolled.value = (scrollContainer?.scrollTop ?? 0) > 4;
}

function bindScrollContainer() {
  scrollContainer?.removeEventListener('scroll', updateScrolled);
  scrollContainer = getDocScrollContainer();
  updateScrolled();
  scrollContainer?.addEventListener('scroll', updateScrolled, { passive: true });
}

onMounted(() => {
  bindScrollContainer();
});

onBeforeUnmount(() => {
  scrollContainer?.removeEventListener('scroll', updateScrolled);
});
</script>

<template>
  <div :class="pageShellStyles.pageShell">
    <article
      ref="articleRef"
      :class="[
        pageShellStyles.content,
        pageEnterAnimationEnabled && 'eds-motion-page-enter',
      ]"
    >
      <div
        :class="[
          styles.iconsStickyChrome,
          isScrolled && styles.iconsStickyChromeScrolled,
        ]"
      >
        <DocPageCommon title="iCons">
          <template v-if="mode === 'design'" #after-title>
            <IconSearchField v-model:search-query="searchQuery" />
          </template>
        </DocPageCommon>
      </div>

      <div
        :class="[
          pageShellStyles.body,
          styles.body,
        ]"
        data-doc-body
      >
        <IconWorkbench
          v-if="mode === 'design'"
          v-model:search-query="searchQuery"
          :anchor-element="articleRef"
        />

        <div
          v-else
          :class="docMarkdownStyles.markdownBody"
          v-html="developHtml"
          @click="handleMarkdownBodyClick"
        />
      </div>

      <DocPageFooter />
    </article>

    <PageToc
      ref="sidebarRef"
      v-model:mode="mode"
      :class="pageShellStyles.tocColumn"
      :items="sidebarItems"
      design-tab-label="图形类别"
      :show-toc-label="false"
    />
  </div>
</template>
