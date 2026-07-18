import type { DocMetaField, DocPageConfig } from '@/config/navigation';

export type DocMode = 'design' | 'develop';

export type PlatformId = 'desktop' | 'mobile' | 'website';

export type DocScopeId = PlatformId;

export type DesignScopeId = PlatformId;

export type DocContentBundle = {
  design?: Partial<Record<PlatformId, string>>;
  develop?: Partial<Record<PlatformId, string>>;
};

export const PLATFORM_SCOPE_ORDER: PlatformId[] = ['desktop', 'mobile', 'website'];

export const DESIGN_SCOPE_ORDER = PLATFORM_SCOPE_ORDER;

export const DEVELOP_SCOPE_ORDER = PLATFORM_SCOPE_ORDER;

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  website: 'WebSite',
};

export type ComponentDocPageInput = {
  path: `/${string}`;
  sectionId: string;
  title: string;
  description?: string;
  meta?: DocMetaField[];
  imageAssetDir?: string;
  bundles: DocContentBundle;
};

export function hasBundleContent(content?: string): boolean {
  return Boolean(content?.trim());
}

export function isComponentDocPage(page: DocPageConfig): boolean {
  return Boolean(page.bundles);
}

export function getAvailableScopes(
  bundles: DocContentBundle | undefined,
  mode: DocMode,
): DocScopeId[] {
  if (!bundles) {
    return [];
  }

  const source = mode === 'design' ? bundles.design : bundles.develop;

  return PLATFORM_SCOPE_ORDER.filter((scope) => hasBundleContent(source?.[scope]));
}

export function getDefaultScope(
  bundles: DocContentBundle | undefined,
  mode: DocMode,
): DocScopeId | '' {
  return getAvailableScopes(bundles, mode)[0] ?? '';
}

export function getScopeLabel(_mode: DocMode, scope: DocScopeId): string {
  return PLATFORM_LABELS[scope] ?? scope;
}

export function getBundleMarkdown(
  bundles: DocContentBundle | undefined,
  mode: DocMode,
  scope: DocScopeId,
): string {
  if (!bundles) {
    return '';
  }

  if (mode === 'design') {
    return bundles.design?.[scope] ?? '';
  }

  return bundles.develop?.[scope] ?? '';
}

/** Design scopes that have a matching `public/docs/…/{scope}/` media folder. */
export const DESIGN_ASSET_SCOPES = PLATFORM_SCOPE_ORDER;

/**
 * Resolve media dir for markdown image shorthand.
 * Develop guides have no graphics — returns undefined in develop mode.
 */
export function getImageAssetDir(
  baseDir: string | undefined,
  mode: DocMode,
  scope: DocScopeId | '',
): string | undefined {
  if (!baseDir || mode === 'develop') {
    return undefined;
  }

  if (scope) {
    return `${baseDir}/${scope}`;
  }

  return baseDir;
}

/** Register a component doc item with per-platform markdown bundles. */
export function defineComponentDocPage(input: ComponentDocPageInput): DocPageConfig {
  const { path: _path, bundles, ...rest } = input;

  return {
    ...rest,
    bundles,
  };
}
