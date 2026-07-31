<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import FloatingBarShell from '@/components/FloatingBarShell/FloatingBarShell.vue';
import { useCornerSmoothingRescan } from '@/cornerSmoothing/useCornerSmoothingRescan';
import {
  formatBrandColor,
  getBrandDisplayP3,
  type BrandDefinition,
  type BrandId,
} from '@/config/brands';
import { useBrand } from '@/composables/useBrand';
import { useThemeProvider } from '@/composables/useThemeProvider';
import styles from './BrandSwitcher.module.css';

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const popoverStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' });
const { brandId, setBrand, brands } = useBrand();
const { theme } = useThemeProvider();

function updatePopoverPosition() {
  if (!triggerRef.value) {
    return;
  }

  const rect = triggerRef.value.getBoundingClientRect();

  popoverStyle.value = {
    top: `${rect.bottom}px`,
    left: `${rect.right}px`,
  };
}

function toggleMenu(event: MouseEvent) {
  event.stopPropagation();
  open.value = !open.value;
}

function selectBrand(id: BrandId) {
  setBrand(id);
  open.value = false;
}

function swatchStyle(brand: BrandDefinition) {
  return { background: formatBrandColor(getBrandDisplayP3(brand, theme.value)) };
}

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(updatePopoverPosition);
  }
});

useCornerSmoothingRescan(popoverRef, open);

function onDocumentClick(event: MouseEvent) {
  if (!open.value) {
    return;
  }

  const target = event.target as Node;

  if (rootRef.value?.contains(target) || popoverRef.value?.contains(target)) {
    return;
  }

  open.value = false;
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick, true);
});
</script>

<template>
  <div ref="rootRef" :class="styles.root">
    <button
      ref="triggerRef"
      type="button"
      :class="[styles.helpButton, open && styles.helpButtonOpen]"
      aria-label="Switch brand"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggleMenu"
    >
      <span :class="styles.helpDot" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="popoverRef"
        :class="styles.popoverShell"
        :style="popoverStyle"
        role="listbox"
        aria-label="Brand"
        @click.stop
      >
        <FloatingBarShell
          layout="column"
          :root-class="styles.menu"
        >
          <ul :class="styles.list">
            <li v-for="brand in brands" :key="brand.id" :class="styles.listItem">
              <button
                type="button"
                role="option"
                :class="[styles.item, brandId === brand.id && styles.itemActive]"
                :aria-selected="brandId === brand.id"
                @click="selectBrand(brand.id)"
              >
                <span :class="styles.swatch" :style="swatchStyle(brand)" />
                <span :class="styles.label">{{ brand.label }}</span>
              </button>
            </li>
          </ul>
        </FloatingBarShell>
      </div>
    </Teleport>
  </div>
</template>
