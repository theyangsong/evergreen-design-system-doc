/**
 * Initial-based person avatar — deterministic color from name hash.
 * Palette: Figma web3-avatar-1…20 (User / node 465:1721).
 * Hash algorithm aligned with avatar-gen-js.
 * See .cursor/rules/person-avatar.mdc
 */

export const WEB3_AVATAR_COLORS = [
  '#1c58b1',
  '#256034',
  '#ffaa32',
  '#a23ff9',
  '#1fc35a',
  '#d3025c',
  '#0a3d62',
  '#f97f51',
  '#079992',
  '#893b25',
  '#943657',
  '#33952b',
  '#6a56e9',
  '#4b554e',
  '#7a0073',
  '#2c8ebb',
  '#744b5f',
  '#624640',
  '#2075aa',
  '#485669',
] as const;

/** web3 palette slots skipped — green / teal / gray-green family. */
const GREENISH_PALETTE_INDICES = new Set<number>([1, 4, 8, 11, 13]);

function resolvePaletteIndex(name: string, paletteOffset: number): number {
  const base =
    (hashString(name.trim()) + paletteOffset) % WEB3_AVATAR_COLORS.length;

  if (!GREENISH_PALETTE_INDICES.has(base)) {
    return base;
  }

  for (let step = 1; step < WEB3_AVATAR_COLORS.length; step += 1) {
    const next = (base + step) % WEB3_AVATAR_COLORS.length;
    if (!GREENISH_PALETTE_INDICES.has(next)) {
      return next;
    }
  }

  return base;
}

/** Deterministic hash — same algorithm as avatar-gen-js. */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return Math.abs(hash);
}

export function getAvatarColor(name: string, paletteOffset = 0): string {
  const trimmed = name.trim();
  const swapPartner = AVATAR_COLOR_SWAP_PARTNER[trimmed];
  if (swapPartner) {
    return colorFromPaletteIndex(
      resolvePaletteIndex(swapPartner.name, swapPartner.paletteOffset),
    );
  }

  return colorFromPaletteIndex(resolvePaletteIndex(trimmed, paletteOffset));
}

function colorFromPaletteIndex(index: number): string {
  return WEB3_AVATAR_COLORS[index]!;
}

/** Swap hashed palette colors between recurring meta-panel pairs. */
const AVATAR_COLOR_SWAP_PARTNER: Record<
  string,
  { name: string; paletteOffset: number }
> = {
  'EDS Yang': { name: 'Dev.', paletteOffset: 1 },
  'Dev.': { name: 'EDS Yang', paletteOffset: 0 },
};

/** Last word's first letter; `EDS Yang` → `Y`, `Dev.` → `D`. */
export function getPersonInitial(name: string): string {
  const cleaned = name.replace(/\.$/, '').trim();
  if (!cleaned) return '?';

  const parts = cleaned.split(/\s+/);
  const word = parts[parts.length - 1] ?? cleaned;
  const letter = word.match(/[A-Za-z]/)?.[0] ?? word.charAt(0);
  return letter.toUpperCase();
}

/** Split meta person strings: `EDS Yang、Jojo` or comma-separated. */
export function parsePersonList(value: string): string[] {
  if (!value || value === '—') return [];
  return value
    .split(/[、,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}
