<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { rescanCornerSmoothing } from '@evergreen/tokens/corner-smoothing';
import { formatBrandColor, type BrandId } from '@/config/brands';
import { useBrand } from '@/composables/useBrand';
import styles from './BrandSwitcher.module.css';

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const popoverStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' });
const { brandId, setBrand, brands } = useBrand();

function updatePopoverPosition() {
  if (!triggerRef.value) {
    return;
  }

  const rect = triggerRef.value.getBoundingClientRect();

  popoverStyle.value = {
    top: `${rect.top + rect.height / 2}px`,
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

function swatchStyle(displayP3: [number, number, number]) {
  return { background: formatBrandColor(displayP3) };
}

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      updatePopoverPosition();
      if (popoverRef.value) {
        rescanCornerSmoothing(popoverRef.value);
      }
    });
  }
});

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
        <div class="effect-flotation-box" :class="styles.menu">
          <div class="effect-flotation-box__bg" aria-hidden="true">
            <div class="effect-flotation-box__fill" />
            <div class="effect-flotation-box__shadow-glow" />
            <div class="effect-flotation-box__glass" />
            <div class="effect-flotation-box__glass-shadow" />
          </div>
          <ul class="effect-flotation-box__content" :class="styles.list">
            <li v-for="brand in brands" :key="brand.id" :class="styles.listItem">
              <button
                type="button"
                role="option"
                :class="[styles.item, brandId === brand.id && styles.itemActive]"
                :aria-selected="brandId === brand.id"
                @click="selectBrand(brand.id)"
              >
                <span :class="styles.swatch" :style="swatchStyle(brand.displayP3)" />
                <span :class="styles.label">{{ brand.label }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>
