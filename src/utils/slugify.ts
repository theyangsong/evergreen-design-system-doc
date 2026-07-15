export function slugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '');

  return slug || 'section';
}

export function uniqueSlug(text: string, used: Map<string, number>): string {
  const base = slugify(text);
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count > 0 ? `${base}-${count}` : base;
}
