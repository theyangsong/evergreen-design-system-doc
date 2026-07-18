#!/usr/bin/env node
/**
 * Scaffold a component doc item with all platform markdown files.
 *
 * Usage:
 *   pnpm scaffold:doc <sectionId> <slug> "<title>" [options]
 *
 * Options:
 *   --id <componentId>       Meta ID, e.g. eds-org-data-list
 *   --preview                Include preview block in design.desktop.md
 *   --description "<text>"   Page description (defaults to title)
 *
 * Example:
 *   pnpm scaffold:doc scenes data-submission "Data Submission" --preview
 *   → /scenes/data-submission · eds-biz-data-submission
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const templateDir = join(projectRoot, 'src/content/docs/_template/files');
const docsRoot = join(projectRoot, 'src/content/docs');
const registryPath = join(docsRoot, 'registry.ts');
const publicDocsRoot = join(projectRoot, 'public/docs');

const VALID_SECTIONS = new Set([
  'started',
  'motion',
  'atoms',
  'molecules',
  'organisms',
  'templates',
  'scenes',
]);

const ID_PREFIXES = {
  started: 'started',
  motion: 'motion',
  atoms: 'vars',
  molecules: 'mol',
  organisms: 'org',
  templates: 'tmpl',
  scenes: 'biz',
};

const TYPE_LABELS = {
  started: 'Started',
  motion: 'Motion',
  atoms: '全局变量',
  molecules: '基础组件',
  organisms: '基础组件',
  templates: '基础组件',
  scenes: '业务组件',
};

const TIER_LABELS = {
  started: '开始',
  motion: '动效',
  atoms: '原子',
  molecules: '分子',
  organisms: '模块',
  templates: '结构',
  scenes: '场景化',
};

const DEFAULT_META = {
  status: '已启用',
  version: '1.0',
  maintainer: 'EDS Yang',
  contributors: 'EDS Yang、Dev.',
};

const PLATFORMS = ['desktop', 'mobile', 'website'];
const DESIGN_ASSET_SCOPES = [...PLATFORMS];

function formatChineseDate(date = new Date()) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function printUsage() {
  console.log(`
Usage:
  pnpm scaffold:doc <sectionId> <slug> "<title>" [options]

Options:
  --id <componentId>       Meta ID (default: eds-<prefix>-<slug>, see ID_PREFIXES)
  --preview                Preview block in design.desktop.md
  --description "<text>"   Page description

Sections:
  started | atoms | molecules | organisms | templates | scenes
`.trim());
}

function slugToCamel(slug) {
  return slug.replace(/-([a-z0-9]+)/g, (_, char) => char.toUpperCase());
}

/** Component title → directory slug (kebab-case). */
function titleToSlug(title) {
  return title
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseArgs(argv) {
  const positional = [];
  const options = {
    preview: false,
    id: '',
    description: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--preview') {
      options.preview = true;
      continue;
    }

    if (arg === '--id') {
      options.id = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--description') {
      options.description = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positional.push(arg);
  }

  const [sectionId, slug, title] = positional;

  if (!sectionId || !slug || !title) {
    printUsage();
    process.exit(1);
  }

  if (!VALID_SECTIONS.has(sectionId)) {
    throw new Error(`Invalid sectionId "${sectionId}". Must be one of: ${[...VALID_SECTIONS].join(', ')}`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid slug "${slug}". Use kebab-case, e.g. data-submission`);
  }

  const expectedSlug = titleToSlug(title);
  if (expectedSlug && slug !== expectedSlug) {
    console.warn(
      `Warning: slug "${slug}" ≠ kebab-case of title "${title}" (expected "${expectedSlug}").`,
    );
    console.warn('  Directory slug should match the English component name. See component-doc-naming.mdc');
  }

  const defaultId = `eds-${ID_PREFIXES[sectionId] ?? sectionId}-${slug}`;
  if (options.id && options.id !== defaultId) {
    console.warn(
      `Warning: --id "${options.id}" ≠ default "${defaultId}". ID should be eds-{prefix}-{slug}.`,
    );
  }

  return {
    sectionId,
    slug,
    title,
    ...options,
    id: options.id || defaultId,
    description: options.description || `${title} 的设计与开发指南。`,
  };
}

function replaceTemplate(template, values) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

function writeFileEnsuringDir(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function registerInRegistry(exportBase, sectionId, slug) {
  const importPath = `./${sectionId}/${slug}`;
  const importBlock = `import {
  ${exportBase}DocPage,
  ${exportBase}DocPath,
} from '${importPath}';`;

  let registry = readFileSync(registryPath, 'utf8');

  if (registry.includes(importPath)) {
    console.log(`registry.ts already contains ${importPath}, skipped.`);
    return;
  }

  const typeImport = "import type { DocPageConfig } from '@/config/navigation';";
  registry = registry.replace(
    typeImport,
    `${importBlock}\n${typeImport}`,
  );

  registry = registry.replace(
    /export const componentDocPages: Record<string, DocPageConfig> = \{\n/,
    `$&  [${exportBase}DocPath]: ${exportBase}DocPage,\n`,
  );

  writeFileSync(registryPath, registry, 'utf8');
}

function main() {
  const config = parseArgs(process.argv.slice(2));
  const {
    sectionId,
    slug,
    title,
    id,
    description,
    preview,
  } = config;

  const exportBase = slugToCamel(slug);
  const docPath = `/${sectionId}/${slug}`;
  const itemDir = join(docsRoot, sectionId, slug);
  const imageAssetDir = sectionId === 'atoms' ? slug : `${sectionId}/${slug}`;
  const publicAssetDir = join(publicDocsRoot, imageAssetDir);

  if (existsSync(itemDir)) {
    throw new Error(`Doc item already exists: ${itemDir}`);
  }

  mkdirSync(itemDir, { recursive: true });
  mkdirSync(publicAssetDir, { recursive: true });

  for (const assetScope of DESIGN_ASSET_SCOPES) {
    writeFileEnsuringDir(join(publicAssetDir, assetScope, '.gitkeep'), '');
  }

  const desktopTemplate = preview
    ? 'design.desktop.with-preview.md'
    : 'design.desktop.default.md';
  copyFileSync(join(templateDir, desktopTemplate), join(itemDir, 'design.desktop.md'));

  for (const platform of PLATFORMS) {
    if (platform === 'desktop') {
      continue;
    }

    copyFileSync(
      join(templateDir, 'design.platform.md'),
      join(itemDir, `design.${platform}.md`),
    );
    copyFileSync(
      join(templateDir, 'develop.platform.md'),
      join(itemDir, `develop.${platform}.md`),
    );
  }

  copyFileSync(
    join(templateDir, 'develop.platform.md'),
    join(itemDir, 'develop.desktop.md'),
  );

  const indexTemplate = readFileSync(join(templateDir, 'index.ts.template'), 'utf8');
  writeFileEnsuringDir(
    join(itemDir, 'index.ts'),
    replaceTemplate(indexTemplate, {
      EXPORT_BASE: exportBase,
      DOC_PATH: docPath,
      SECTION_ID: sectionId,
      TITLE: title,
      DESCRIPTION: description,
      COMPONENT_ID: id,
      TYPE_LABEL: TYPE_LABELS[sectionId],
      TIER_LABEL: TIER_LABELS[sectionId] ?? sectionId,
      LAST_UPDATED: formatChineseDate(),
      META_STATUS: DEFAULT_META.status,
      META_VERSION: DEFAULT_META.version,
      META_MAINTAINER: DEFAULT_META.maintainer,
      META_CONTRIBUTORS: DEFAULT_META.contributors,
      IMAGE_ASSET_DIR: imageAssetDir,
    }),
  );

  registerInRegistry(exportBase, sectionId, slug);

  console.log(`Created component doc: ${docPath}`);
  console.log(`  Content : src/content/docs/${sectionId}/${slug}/`);
  console.log(`  Assets  : public/docs/${imageAssetDir}/{desktop,mobile,website}/`);
  console.log(`  Registry: updated src/content/docs/registry.ts`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Add nav item in src/config/navigation.ts → { label: '${title}', to: '${docPath}' }`);
  console.log('  2. Fill markdown under design.*.md / develop.*.md');
  console.log(`  3. Put design media in public/docs/${imageAssetDir}/<scope>/ (develop has no media dirs)`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
