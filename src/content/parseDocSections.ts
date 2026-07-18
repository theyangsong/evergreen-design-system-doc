import type { DocMode, DocScopeId } from '@/content/docPage';
import type { DocPageSection } from '@/config/navigation';
import { uniqueSlug } from '@/utils/slugify';

export function normalizeSectionTitle(text: string): string {
  return text.replace(/^\d+\.\s*/, '').trim();
}

export function buildDocSectionId(
  mode: DocMode,
  scope: DocScopeId,
  title: string,
  used: Map<string, number>,
): string {
  const slug = uniqueSlug(normalizeSectionTitle(title), used);
  return `${mode}-${scope}-${slug}`;
}

/** Parse top-level `#` headings into TOC sections for a bundle markdown file. */
export function parseDocSections(
  markdown: string,
  mode: DocMode,
  scope: DocScopeId,
): DocPageSection[] {
  const used = new Map<string, number>();
  const sections: DocPageSection[] = [];

  for (const line of markdown.split('\n')) {
    if (!/^# [^#]/.test(line)) {
      continue;
    }

    const title = normalizeSectionTitle(line.slice(2));
    sections.push({
      id: buildDocSectionId(mode, scope, title, used),
      title,
    });
  }

  return sections;
}
