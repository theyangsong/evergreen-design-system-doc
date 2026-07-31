import type { EdsIconVariant } from '@/assets/icons';
import type { IconCategoryId } from '@/icons/categories';

export type IconRegistryEntry = {
  name: string;
  variant: EdsIconVariant;
  category: IconCategoryId;
  label?: string;
  tags?: string[];
  content: string;
};

export type IconDisplayParams = {
  size: number;
  strokeWidth: number;
  color: string;
};

export const DEFAULT_ICON_PARAMS: IconDisplayParams = {
  size: 24,
  strokeWidth: 1.5,
  color: 'currentColor',
};
