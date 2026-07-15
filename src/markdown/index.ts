/**
 * Doc-site markdown pipeline — render + styles + interactions.
 * Rules: .cursor/rules/doc-markdown.mdc
 */

export {
  COPIED_ICON_SVG,
  COPY_ICON_SVG,
  renderMarkdown,
  type MarkdownSectionIds,
} from './renderMarkdown';

export { useDocMarkdownCopy } from './useDocMarkdownCopy';

export { default as docMarkdownStyles } from './docMarkdown.module.css';
