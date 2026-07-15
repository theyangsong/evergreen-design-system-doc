# Motion

文档站统一动效模块。修改时长/缓动请优先改 `tokens.css` 与 `durations.ts`（保持两者一致）。

## 包含动效

| 名称 | 用途 | CSS | JS |
|------|------|-----|-----|
| Hover | 链接/按钮悬浮 | `--eds-motion-hover-duration` | `MOTION_HOVER_MS` |
| Curved panel | SectionNav 曲线展开/收起 | `--eds-motion-curved-panel-*` | `useCurvedPanelTransition()` |
| Slide indicator | SectionNav / PageToc 激活指示器 | `.eds-motion-indicator-move` | `MOTION_INDICATOR_MS` |
| Page enter | 文档页切换入场 | `.eds-motion-page-enter` | `MOTION_PAGE_ENTER_MS` |

## CSS 用法

全局已在 `styles/global.css` 引入 tokens 与 animations。

```css
.myButton {
  transition: background-color var(--eds-motion-hover-duration) ease;
}

.myIndicatorMove {
  composes: eds-motion-indicator-move from global;
}
```

或在 Vue 模板中加全局 class：

```html
<div :class="enabled && 'eds-motion-page-enter'">...</div>
```

## JS 用法

```ts
import {
  useCurvedPanelTransition,
  getCurvedPanelClipPath,
  getCurvedPanelBulge,
  MOTION_CURVED_PANEL_OPEN_MS,
} from '@/motion';

const { progress, isAnimating, animateTo, setProgressImmediate } =
  useCurvedPanelTransition(false);

animateTo(true);

const clipPath = getCurvedPanelClipPath(height, edgeX, progress.value);
```

## 曲线面板集成要点

1. 等 `sectionNavShell` 挂载并测量高度后再 `animateTo(true)`
2. 从「探索」等无 SectionNav 路由切入时，在 `sectionNav` 出现后重置 `progress` 再展开
3. 已在同模块内切换路由且 nav 已展开时，不要重播展开动画

参考实现：`layouts/DocsLayout.vue`。
