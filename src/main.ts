import { createApp } from 'vue';
import { applyTheme, type ThemeMode } from '@/composables/useTheme';
import App from './App.vue';
import { initBrandProvider } from '@/composables/useBrand';
import { router } from './router';
import { initLiquidGlass } from '@evergreen/tokens/liquid-glass';
import { initDocCornerSmoothing } from '@/cornerSmoothing';
import './styles/global.css';

function getWebsiteTheme(): ThemeMode {
  const stored = localStorage.getItem('evergreen-theme') as ThemeMode | null;
  return stored === 'dark' ? 'dark' : 'light';
}

applyTheme(getWebsiteTheme());
initBrandProvider();

createApp(App).use(router).mount('#app');
initLiquidGlass();
initDocCornerSmoothing();
