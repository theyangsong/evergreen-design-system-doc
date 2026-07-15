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

export function getAvatarColor(name: string): string {
  const index = hashString(name) % WEB3_AVATAR_COLORS.length;
  return WEB3_AVATAR_COLORS[index]!;
}

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
