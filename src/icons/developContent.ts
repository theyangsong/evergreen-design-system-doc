export const iconsDevelopMarkdown = `# 安装

\`\`\`bash
pnpm add @eds/website-icons
\`\`\`

## 基础用法

通过 \`name\` 引用图标，名称与文档站图标库一致。

\`\`\`vue
<script setup lang="ts">
import { EdsIcon } from '@eds/website-icons';
</script>

<template>
  <EdsIcon name="star-fill" />
</template>
\`\`\`

## 尺寸与颜色

\`\`\`vue
<EdsIcon name="desktop" :size="32" color="var(--text-base-primary)" />
\`\`\`

## 描边参数

适用于 \`variant: stroke\` 的图标：

\`\`\`vue
<EdsIcon
  name="open-book"
  :stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
\`\`\`

## 命名规范

- 使用 kebab-case，如 \`arrow-right\`
- 同一语义优先复用已有图标，避免重复命名
- 新增图标需指定 \`category\` 与 \`tags\`，便于文档站检索

## 贡献流程

1. 在 \`packages/icons\` 添加 SVG 并登记 registry
2. 本地 \`pnpm dev\` 验证文档站图标页预览与复制
3. 提交 PR，由维护者 review 后发布 npm 版本
`;
