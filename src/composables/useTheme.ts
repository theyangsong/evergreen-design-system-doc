export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'evergreen-theme';

export function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: ThemeMode, target: HTMLElement = document.documentElement) {
  target.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(current: ThemeMode): ThemeMode {
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}
