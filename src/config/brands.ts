import type { ThemeMode } from '@/composables/useTheme';

export type BrandId = 'evergreen' | 'cregis' | 'udun';

export type BrandColorPair = {
  light: [number, number, number];
  dark: [number, number, number];
};

export type BrandDefinition = {
  id: BrandId;
  label: string;
  displayP3: BrandColorPair;
};

/** Doc-site EverGreen brand: light #006D42, dark #69b091 (sRGB fallback + display-p3). */
export const brands: BrandDefinition[] = [
  {
    id: 'evergreen',
    label: 'EverGreen Design System',
    displayP3: {
      light: [0, 0.4275, 0.2588],
      dark: [0.4118, 0.6902, 0.5686],
    },
  },
  {
    id: 'cregis',
    label: 'Cregis',
    displayP3: {
      light: [0.1216, 0.7647, 0.3529],
      dark: [0.1216, 0.7647, 0.3529],
    },
  },
  {
    id: 'udun',
    label: 'UDun',
    displayP3: {
      light: [0, 0.4, 1],
      dark: [0, 0.4, 1],
    },
  },
];

export function getBrandById(id: BrandId): BrandDefinition {
  return brands.find((brand) => brand.id === id) ?? brands[0];
}

export function getBrandDisplayP3(
  brand: BrandDefinition,
  theme: ThemeMode,
): [number, number, number] {
  return brand.displayP3[theme];
}

export function formatBrandColor(displayP3: [number, number, number]): string {
  const [r, g, b] = displayP3;
  return `color(display-p3 ${r} ${g} ${b})`;
}
