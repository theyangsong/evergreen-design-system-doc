import { onMounted, ref, type Ref } from 'vue';
import {
  applyTheme,
  getPreferredTheme,
  toggleTheme as toggleThemeMode,
  type ThemeMode,
} from './useTheme';
import { reapplyCurrentBrand } from './useBrand';

const theme: Ref<ThemeMode> = ref('light');
let initialized = false;

export function initThemeProvider(mode?: ThemeMode) {
  if (initialized || typeof window === 'undefined') {
    return;
  }

  const existing = document.documentElement.getAttribute('data-theme');
  if (existing === 'light' || existing === 'dark') {
    theme.value = existing;
  } else {
    theme.value = mode ?? getPreferredTheme();
    applyTheme(theme.value);
  }

  initialized = true;
}

export function useThemeProvider() {
  onMounted(() => {
    initThemeProvider();
  });

  function setTheme(next: ThemeMode) {
    theme.value = next;
    applyTheme(next);
    reapplyCurrentBrand();
  }

  function toggleTheme() {
    theme.value = toggleThemeMode(theme.value);
    reapplyCurrentBrand();
  }

  return { theme, setTheme, toggleTheme };
}
