import type { IconCategoryId } from '@/icons/categories';
import type { IconRegistryEntry } from '@/icons/types';

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesQuery(entry: IconRegistryEntry, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [
    entry.name,
    entry.label ?? '',
    ...(entry.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function filterIcons(
  icons: IconRegistryEntry[],
  query: string,
  categoryId?: IconCategoryId | null,
): IconRegistryEntry[] {
  const normalized = normalizeQuery(query);

  return icons.filter((entry) => {
    if (categoryId && entry.category !== categoryId) {
      return false;
    }

    return matchesQuery(entry, normalized);
  });
}

export function groupIconsByCategory(
  icons: IconRegistryEntry[],
): Map<IconCategoryId, IconRegistryEntry[]> {
  const groups = new Map<IconCategoryId, IconRegistryEntry[]>();

  for (const entry of icons) {
    const list = groups.get(entry.category) ?? [];
    list.push(entry);
    groups.set(entry.category, list);
  }

  return groups;
}
