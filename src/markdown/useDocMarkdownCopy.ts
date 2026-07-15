import { COPIED_ICON_SVG, COPY_ICON_SVG } from './renderMarkdown';

type UseDocMarkdownCopyOptions = {
  onDevelopLink?: () => void;
};

export function useDocMarkdownCopy(options: UseDocMarkdownCopyOptions = {}) {
  async function handleMarkdownBodyClick(event: MouseEvent) {
    const developLink = (event.target as HTMLElement).closest('[data-doc-develop-link]');
    if (developLink) {
      event.preventDefault();
      options.onDevelopLink?.();
      return;
    }

    const copyButton = (event.target as HTMLElement).closest('[data-code-copy]');
    if (!(copyButton instanceof HTMLButtonElement)) {
      return;
    }

    const code = copyButton.closest('.docs-code-block')?.querySelector('code');
    const text = code?.textContent;
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      copyButton.classList.add('docs-code-copy--copied');
      copyButton.innerHTML = COPIED_ICON_SVG;
      copyButton.setAttribute('aria-label', '已复制');
      window.setTimeout(() => {
        copyButton.classList.remove('docs-code-copy--copied');
        copyButton.innerHTML = COPY_ICON_SVG;
        copyButton.setAttribute('aria-label', '复制代码');
      }, 2000);
    } catch {
      copyButton.setAttribute('aria-label', '复制失败');
      window.setTimeout(() => {
        copyButton.setAttribute('aria-label', '复制代码');
      }, 2000);
    }
  }

  return { handleMarkdownBodyClick };
}
