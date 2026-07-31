import type { IconDisplayParams, IconRegistryEntry } from '@/icons/types';

function applySize(svg: string, size: number): string {
  let result = svg;

  result = result.replace(
    /(<svg[^>]*\s)width="[^"]*"/,
    `$1width="${size}"`,
  );
  result = result.replace(
    /(<svg[^>]*\s)height="[^"]*"/,
    `$1height="${size}"`,
  );

  if (!/width=/.test(result)) {
    result = result.replace('<svg', `<svg width="${size}"`);
  }

  if (!/height=/.test(result)) {
    result = result.replace('<svg', `<svg height="${size}"`);
  }

  return result;
}

function applyStrokeColor(svg: string, color: string, strokeWidth: number): string {
  let result = svg;

  result = result.replace(
    /stroke-width="[^"]*"/g,
    `stroke-width="${strokeWidth}"`,
  );

  result = result.replace(
    /stroke="(?!none)[^"]*"/g,
    `stroke="${color}"`,
  );

  return result;
}

function applyFillColor(svg: string, color: string): string {
  return svg.replace(
    /fill="(?!none)[^"]*"/g,
    `fill="${color}"`,
  );
}

export function renderIconHtml(
  entry: IconRegistryEntry,
  params: IconDisplayParams,
): string {
  let result = applySize(entry.content, params.size);

  if (entry.variant === 'fill') {
    return applyFillColor(result, params.color);
  }

  if (entry.variant === 'stroke') {
    return applyStrokeColor(result, params.color, params.strokeWidth);
  }

  result = applyStrokeColor(result, params.color, params.strokeWidth);
  return applyFillColor(result, params.color);
}

export function buildVueSnippet(name: string): string {
  return `<EdsIcon name="${name}" />`;
}

export function buildReactSnippet(name: string): string {
  return `<EdsIcon name="${name}" />`;
}
