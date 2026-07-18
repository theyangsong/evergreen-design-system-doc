# EverGreen Design System — Doc

独立文档站。从 `evergreen-design-system-desktop/apps/website` 剥离，**应用层代码全部在本仓库**。

仅通过 npm link 消费同级 [evergreen-design-system-website](../evergreen-design-system-website) 的**规范包**：

- `@evergreen/tokens` — 全局变量
- `@evergreen/components` — 组件库（按需引用）
- `@evergreen/scenes` — 场景化组件（按需引用）

## 仓库边界

| 归属 | 内容 |
|------|------|
| **website** | Tokens、Components、Scenes 三个 package |
| **doc（本项目）** | 壳层、布局、导航、Markdown、动效、主题、文档内容、路由、编辑器等一切文档站专属逻辑 |
| **desktop** | 不修改、不依赖（除历史迁移说明外） |

## 前置条件

同级目录需存在：

```
Projects/
  evergreen-design-system-doc/      ← 本项目
  evergreen-design-system-website/  ← 设计系统规范包
```

## 安装与启动

```bash
cd evergreen-design-system-doc
pnpm install
pnpm dev
```

开发地址：http://localhost:5176/

`predev` 会自动在 website 仓库执行 `build:tokens`。

## 依赖关系

| 包 | 来源 | 用途 |
|----|------|------|
| `@evergreen/tokens` | `../evergreen-design-system-website/packages/tokens` | 颜色、尺度、排版、效果 |
| `@evergreen/components` | `../evergreen-design-system-website/packages/components` | 组件预览（按需 link） |
| `@evergreen/scenes` | `../evergreen-design-system-website/packages/scenes` | 场景演示（按需 link） |

### 本项目自有（不在 website 中）

| 模块 | 路径 |
|------|------|
| 主题 | `src/composables/useTheme*.ts` |
| 动效 | `src/motion/` |
| Markdown | `src/markdown/` + `.cursor/rules/doc-markdown.mdc` |
| 壳层背景 | `src/styles/global.css`（硬编码 P3） |
| 文档内容 | `src/content/docs/` |
| 应用壳层 | `src/layouts/`, `src/components/`, `src/router/` |

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发服务器 + 监听 website tokens |
| `pnpm build` | 生产构建 |
| `pnpm typecheck` | TypeScript 检查 |

## GitHub Pages

推送 `main` 分支后，[Deploy GitHub Pages](.github/workflows/deploy-pages.yml) 会自动构建并发布：

**https://\<username\>.github.io/evergreen-design-system-doc/**

### 前置条件

1. 仓库 **Settings → Pages → Build and deployment** 选 **Deploy from a branch**，Branch 选 **gh-pages** / **/ (root)**（首次 workflow 跑完会自动创建 `gh-pages` 分支）
2. 同级仓库 **`evergreen-design-system-website`** 需在同一 GitHub 账户（CI 构建 `@evergreen/tokens`）

推送 `main` 后 workflow **自动运行**，无需手动触发或 Environment 审批。

本地模拟 Pages 构建：

```bash
VITE_BASE_PATH=/evergreen-design-system-doc/ pnpm build
pnpm preview
```
