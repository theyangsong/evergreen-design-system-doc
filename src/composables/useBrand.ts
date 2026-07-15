import { ref, onMounted, type Ref } from 'vue';
import {
  brands,
  formatBrandColor,
  getBrandById,
  type BrandId,
} from '@/config/brands';

const STORAGE_KEY = 'evergreen-brand';

const brandId: Ref<BrandId> = ref('evergreen');
let initialized = false;

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
  const color = formatBrandColor(brand.displayP3);

  target.style.setProperty('--eds-brand', color);
  target.style.setProperty('--eds-success', color);
  target.setAttribute('data-brand', id);
  localStorage.setItem(STORAGE_KEY, id);
  brandId.value = id;
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
