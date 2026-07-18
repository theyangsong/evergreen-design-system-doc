import { ref, onMounted, type Ref } from 'vue';
import {
  brands,
  formatBrandColor,
  getBrandById,
  getBrandDisplayP3,
  type BrandId,
} from '@/config/brands';
import { type ThemeMode } from './useTheme';

const STORAGE_KEY = 'evergreen-brand';

const brandId: Ref<BrandId> = ref('evergreen');
let initialized = false;

function getCurrentTheme(target: HTMLElement): ThemeMode {
  return target.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function getPreferredBrand(): BrandId {
  if (typeof window === 'undefined') {
    return 'evergreen';
  }

  const stored = localStorage.getItem(STORAGE_KEY) as BrandId | null;
  if (stored && brands.some((brand) => brand.id === stored)) {
    return stored;
  }

  return 'evergreen';
}

export function applyBrand(id: BrandId, target: HTMLElement = document.documentElement) {
  const brand = getBrandById(id);
  const theme = getCurrentTheme(target);
  const color = formatBrandColor(getBrandDisplayP3(brand, theme));

  target.style.setProperty('--eds-brand', color);
  target.style.setProperty('--eds-success', color);
  target.setAttribute('data-brand', id);
  localStorage.setItem(STORAGE_KEY, id);
  brandId.value = id;
}

export function reapplyCurrentBrand(target: HTMLElement = document.documentElement) {
  applyBrand(brandId.value, target);
}

export function initBrandProvider(id?: BrandId) {
  if (initialized || typeof window === 'undefined') {
    return;
  }

  applyBrand(id ?? getPreferredBrand());
  initialized = true;
}

export function useBrand() {
  onMounted(() => {
    initBrandProvider();
  });

  function setBrand(id: BrandId) {
    applyBrand(id);
  }

  return { brandId, setBrand, brands };
}
