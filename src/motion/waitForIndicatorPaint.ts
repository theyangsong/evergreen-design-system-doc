/** Let the browser paint the current indicator transform before updating position. */
export function waitForIndicatorPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
