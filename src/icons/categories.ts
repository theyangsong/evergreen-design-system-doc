export const ICON_CATEGORIES = [
  { id: 'system-common', label: '系统常用' },
  { id: 'arrow', label: '箭头' },
  { id: 'navigation', label: '导航' },
  { id: 'crud', label: '增删改查' },
  { id: 'finance', label: '金融' },
  { id: 'time', label: '时间' },
  { id: 'security', label: '安全' },
  { id: 'file', label: '文件' },
  { id: 'message', label: '消息' },
  { id: 'text-format', label: '文本格式' },
  { id: 'other', label: '其他' },
] as const;

export type IconCategoryId = (typeof ICON_CATEGORIES)[number]['id'];

export function categorySectionId(categoryId: IconCategoryId): string {
  return `category-${categoryId}`;
}

export function getIconCategoryTocItems(): Array<{
  id: string;
  label: string;
  depth: 1;
}> {
  return ICON_CATEGORIES.map((category) => ({
    id: categorySectionId(category.id),
    label: category.label,
    depth: 1 as const,
  }));
}
