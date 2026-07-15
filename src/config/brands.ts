export type BrandId = 'evergreen' | 'cregis' | 'udun';

export type BrandDefinition = {
  id: BrandId;
  label: string;
  displayP3: [number, number, number];
};

export const brands: BrandDefinition[] = [
  {
    id: 'evergreen',
    label: 'EverGreen Design System',
    displayP3: [0.0624, 0.4211, 0.2716],
  },
  {
    id: 'cregis',
    label: 'Cregis',
    displayP3: [0.1216, 0.7647, 0.3529],
  },
  {
    id: 'udun',
    label: 'UDun',
    displayP3: [0, 0.4, 1],
  },
];

export function getBrandById(id: BrandId): BrandDefinition {
  return brands.find((brand) => brand.id === id) ?? brands[0];
}

export function formatBrandColor(displayP3: [number, number, number]): string {
  const [r, g, b] = displayP3;
  return `color(display-p3 ${r} ${g} ${b})`;
}
