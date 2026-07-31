import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

const LIQUID_VAR_PREFIX = '--doc-floating-bar-liquid';

type LiquidGlassSurface = {
  updateMap: () => void;
  applyStyles: () => void;
};

function supportsLiquidGlassBackdrop() {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') {
    return false;
  }

  const isChromium = /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent);
  return isChromium && CSS.supports('backdrop-filter', 'url("#liquid-glass-test")');
}

export function useFloatingBarLiquidGlass(
  barRef: Ref<HTMLElement | null | undefined>,
) {
  let liquidGlassAttached = false;
  let liquidGlassSurface: LiquidGlassSurface | undefined;
  let liquidGlassRequest = 0;
  let refreshFrame = 0;
  let styleObserver: MutationObserver | undefined;

  function refreshLiquidGlass() {
    if (!liquidGlassSurface) {
      return;
    }

    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      liquidGlassSurface?.updateMap();
      liquidGlassSurface?.applyStyles();
    });
  }

  async function attachLiquidGlassToBar() {
    const request = ++liquidGlassRequest;
    const element = barRef.value;

    if (!element || liquidGlassAttached || !supportsLiquidGlassBackdrop()) {
      return;
    }

    const { attachLiquidGlass } = await import('@eds/website-tokens/liquid-glass');
    if (request !== liquidGlassRequest || !barRef.value) {
      return;
    }

    liquidGlassSurface = attachLiquidGlass(barRef.value, {
      varPrefix: LIQUID_VAR_PREFIX,
    }) as LiquidGlassSurface;
    liquidGlassAttached = true;
  }

  async function detachLiquidGlassFromBar() {
    const request = ++liquidGlassRequest;
    const element = barRef.value;

    if (!element || !liquidGlassAttached) {
      return;
    }

    const { detachLiquidGlass } = await import('@eds/website-tokens/liquid-glass');
    if (request !== liquidGlassRequest) {
      return;
    }

    detachLiquidGlass(element);
    element.style.removeProperty('backdrop-filter');
    element.style.removeProperty('-webkit-backdrop-filter');
    element.style.removeProperty('background');
    liquidGlassAttached = false;
    liquidGlassSurface = undefined;
  }

  onMounted(() => {
    void attachLiquidGlassToBar();

    if (supportsLiquidGlassBackdrop()) {
      styleObserver = new MutationObserver(refreshLiquidGlass);
      styleObserver.observe(document.head, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });
      styleObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'style'],
      });
    }
  });

  onBeforeUnmount(() => {
    liquidGlassRequest += 1;
    styleObserver?.disconnect();
    cancelAnimationFrame(refreshFrame);
    void detachLiquidGlassFromBar();
  });
}
