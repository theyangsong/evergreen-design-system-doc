/**
 * Markdown → HTML for doc pages (marked + highlight.js).
 * Styling lives in docMarkdown.module.css; rules in .cursor/rules/doc-markdown.mdc
 */
import { marked, Renderer, type Tokens } from 'marked';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';

export type MarkdownSectionIds = Record<string, string>;

type TocAnchorSection = { id: string; depth?: 1 | 2 };

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  sh: 'bash',
  shell: 'bash',
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  json: 'JSON',
  css: 'CSS',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
};

export const COPY_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="9" rx="1.5" stroke="currentColor" stroke-width="1.25"/><path d="M4 10.5h-.5a1.5 1.5 0 0 1-1.5-1.5v-7a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5V4" stroke="currentColor" stroke-width="1.25"/></svg>`;

export const COPIED_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 7.25 5.75 10 11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveHighlightLanguage(lang?: string): string | null {
  const normalized = lang?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;
  return hljs.getLanguage(resolved) ? resolved : null;
}

function getLanguageLabel(lang: string | undefined, resolved: string): string {
  const raw = lang?.trim().toLowerCase() ?? resolved;
  return LANGUAGE_LABELS[raw] ?? LANGUAGE_LABELS[resolved] ?? raw;
}

function renderCodeBlock(text: string, lang?: string): string {
  const language = resolveHighlightLanguage(lang);

  if (!language) {
    return `<pre class="docs-fence docs-fence-plain"><code>${escapeHtml(text)}</code></pre>\n`;
  }

  const highlighted = hljs.highlight(text, { language }).value;
  const label = escapeHtml(getLanguageLabel(lang, language));

  return `<div class="docs-code-block"><div class="docs-code-chrome"><span class="docs-code-lang">${label}</span><button type="button" class="docs-code-copy" aria-label="复制代码" data-code-copy>${COPY_ICON_SVG}</button></div><pre class="docs-fence docs-fence-highlighted"><code class="hljs language-${language}">${highlighted}</code></pre></div>\n`;
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '');
}

function plainHeadingText(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function normalizeSectionTitle(text: string): string {
  return text.replace(/^\d+\.\s*/, '').trim();
}

/** Public URL prefix for media in `public/docs/` (includes Vite `base` on GitHub Pages). */
export function getDocsMediaUrlPrefix(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}docs/`;
}

function rewriteHardcodedDocsMediaUrls(markdown: string): string {
  const prefix = getDocsMediaUrlPrefix();
  if (prefix === '/docs/') {
    return markdown;
  }

  return markdown.replace(/\/docs\//g, prefix);
}

function preprocessMarkdown(markdown: string, imageAssetDir?: string): string {
  // Rewrite legacy hardcoded `/docs/…` paths before expanding `!file` shorthand,
  // so prefixed image URLs are not double-rewritten to `/base/base/docs/…`.
  let result = rewriteHardcodedDocsMediaUrls(markdown);
  const docsPrefix = getDocsMediaUrlPrefix();

  if (imageAssetDir) {
    result = result.replace(/^!(.+)$/gm, (_, filename: string) => {
      const trimmed = filename.trim();
      const url = `${docsPrefix}${imageAssetDir}/${trimmed}`;
      if (/\.(mp4|webm|mov)$/i.test(trimmed)) {
        return `<video src="${url}" controls playsinline></video>`;
      }
      return `![${trimmed}](${url})`;
    });
  }

  return result.replace(
    /^组件能力示例。查看演示$/gm,
    '组件能力示例。<a href="#doc-develop" class="docs-develop-link" data-doc-develop-link>查看演示</a>',
  );
}

function resolveHeadingId(
  plain: string,
  sectionIdsByTitle: MarkdownSectionIds,
): string {
  const normalized = normalizeSectionTitle(plain);
  return (
    sectionIdsByTitle[normalized] ??
    sectionIdsByTitle[plain] ??
    slugifyHeading(normalized || plain)
  );
}

function appendMediaCacheBust(html: string, cacheBust?: string): string {
  if (!cacheBust) {
    return html;
  }

  const suffix = `?v=${encodeURIComponent(cacheBust)}`;
  const docsPrefix = getDocsMediaUrlPrefix().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(
    new RegExp(`((?:src|href)=(["']))(${docsPrefix}[^"'?#]+)\\2`, 'g'),
    `$1$3${suffix}$2`,
  );
}

export function renderMarkdown(
  markdown: string,
  sectionIdsByTitle: MarkdownSectionIds = {},
  imageAssetDir?: string,
  mediaCacheBust?: string,
  tocSections: TocAnchorSection[] = [],
): string {
  if (!markdown.trim()) {
    return '';
  }

  let tocSectionIndex = 0;

  class DocRenderer extends Renderer {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const plain = plainHeadingText(text);
      let id: string;

      if (depth === 1) {
        id = resolveHeadingId(plain, sectionIdsByTitle);
        const section = tocSections[tocSectionIndex];
        if (section && (section.depth ?? 1) === 1) {
          tocSectionIndex += 1;
        }
      } else if (depth === 2) {
        const section = tocSections[tocSectionIndex];
        if (section?.depth === 2) {
          id = section.id;
          tocSectionIndex += 1;
        } else {
          id = slugifyHeading(plain);
        }
      } else {
        id = slugifyHeading(plain);
      }

      const content = depth === 1 ? normalizeSectionTitle(plain) : text;
      return `<h${depth} id="${id}">${content}</h${depth}>\n`;
    }

    code({ text, lang }: Tokens.Code) {
      return renderCodeBlock(text, lang);
    }

    table(token: Tokens.Table) {
      const html = Renderer.prototype.table.call(this, token);
      return `<div class="docs-table-scroll">${html}</div>\n`;
    }
  }

  return appendMediaCacheBust(
    marked.parse(preprocessMarkdown(markdown, imageAssetDir), {
      async: false,
      gfm: true,
      breaks: false,
      renderer: new DocRenderer(),
    }),
    mediaCacheBust,
  );
}
