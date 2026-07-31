import { edsIcons } from '@/assets/icons';
import type { IconCategoryId } from '@/icons/categories';
import type { IconRegistryEntry } from '@/icons/types';

const CATEGORY_BY_NAME: Record<keyof typeof edsIcons, IconCategoryId> = {
  'star-fill': 'system-common',
  thematic: 'system-common',
  desktop: 'system-common',
  mobile: 'system-common',
  website: 'system-common',
  'open-book': 'navigation',
  tree: 'navigation',
  book: 'file',
  'sign-hashtag': 'text-format',
  atoms: 'other',
  molecules: 'other',
  organisms: 'other',
  templates: 'other',
  scenes: 'other',
  motion: 'other',
};

const LABEL_BY_NAME: Partial<Record<keyof typeof edsIcons, string>> = {
  'open-book': '打开的书',
  tree: '树形',
  motion: '动效',
  atoms: '原子',
  molecules: '分子',
  organisms: '有机体',
  templates: '模板',
  scenes: '场景',
  thematic: '主题',
  'star-fill': '实心星',
  'sign-hashtag': '井号',
  book: '书籍',
  desktop: '桌面端',
  mobile: '移动端',
  website: '网站',
};

const TAGS_BY_NAME: Partial<Record<keyof typeof edsIcons, string[]>> = {
  desktop: ['desktop', 'platform', '桌面'],
  mobile: ['mobile', 'platform', '移动'],
  website: ['website', 'web', '网站'],
  'star-fill': ['favorite', '收藏'],
  'sign-hashtag': ['hash', 'tag', '标签'],
};

function buildRegistry(): IconRegistryEntry[] {
  return Object.entries(edsIcons).map(([name, icon]) => ({
    name,
    variant: icon.variant,
    category: CATEGORY_BY_NAME[name as keyof typeof edsIcons],
    label: LABEL_BY_NAME[name as keyof typeof edsIcons],
    tags: TAGS_BY_NAME[name as keyof typeof edsIcons],
    content: icon.content,
  }));
}

export const iconRegistry: IconRegistryEntry[] = buildRegistry();

export function getIconsByCategory(categoryId: IconCategoryId): IconRegistryEntry[] {
  return iconRegistry.filter((entry) => entry.category === categoryId);
}
