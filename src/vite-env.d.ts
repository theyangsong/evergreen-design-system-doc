/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}

declare module '*.glsl?raw' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '@eds/website-tokens/liquid-glass' {
  export function attachLiquidGlass(
    element: HTMLElement,
    options?: Record<string, unknown>,
  ): unknown;

  export function detachLiquidGlass(element: HTMLElement): void;

  export function initLiquidGlass(
    options?: Record<string, unknown>,
  ): unknown[];
}

declare module '@eds/website-tokens/corner-smoothing' {
  export function attachCornerSmoothing(element: HTMLElement): unknown;

  export function detachCornerSmoothing(element: HTMLElement): void;

  export function initCornerSmoothing(
    options?: Record<string, unknown>,
  ): unknown[];

  export function rescanCornerSmoothing(root?: HTMLElement): unknown[];
}
