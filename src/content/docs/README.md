# 新建组件文档

运行 scaffold 会一次性创建 **6 个 Markdown + index.ts + 媒体目录**，并注册到 `registry.ts`。之后只需在对应 md 里填入内容。

## 命名约定（必守）

| 字段 | 规则 |
|------|------|
| **组件名**（meta 名称 / `title`） | 英文，如 `Data Submission`、`NavBar` |
| **slug**（目录名、路由） | 组件名的 kebab-case，如 `data-submission` |
| **ID** | `eds-{prefix}-{slug}`，如 `eds-biz-data-submission` |

侧栏中文菜单名（如「复合型数据提交引擎」）**不等于** slug；路由始终 `/{sectionId}/{slug}`。

前缀：`vars` 原子 · `mol` 分子 · `org` 模块 · `tmpl` 结构 · `biz` 场景化 · `motion` 动效。

完整说明见 `.cursor/rules/component-doc-naming.mdc`。

## 命令

```bash
pnpm scaffold:doc <sectionId> <slug> "<title>" [options]
```

### 参数

| 参数 | 说明 |
|------|------|
| `sectionId` | `atoms` \| `molecules` \| `organisms` \| `templates` \| `scenes` \| `started` \| `motion` |
| `slug` | **组件名** kebab-case（= 目录名 = 路由末段），如 `data-submission` |
| `title` | meta **名称**，英文组件名，如 `Data Submission` |

### 选项

| 选项 | 说明 |
|------|------|
| `--id <id>` | Meta ID，默认 `eds-{prefix}-{slug}`（vars / mol / org / tmpl / biz 等） |
| `--preview` | `design.desktop.md` 含预览块（分子/模块/结构/场景化组件使用） |
| `--description "<text>"` | 页面描述 |

创建时 `index.ts` 的 meta 面板会自动填入：

| 字段 | 默认值 |
|------|--------|
| 名称 | 与 `title` 相同 |
| ID | `eds-{prefix}-{slug}` 或 `--id` 指定 |
| 类型 | atoms → 全局变量；molecules / organisms / templates → 基础组件；scenes → 业务组件 |
| 层级 | AppRail 导航名（原子 / 分子 / 模块 / 结构 / 场景化 等） |
| 状态 | 已启用 |
| 版本 | 1.0 |
| 维护 | EDS Yang |
| 贡献 | EDS Yang、Sam、Dev. |
| 最后更新 | 创建当日（中文，如 2026年7月18日） |

### 示例

```bash
# 场景化业务组件
pnpm scaffold:doc scenes data-submission "Data Submission" --preview
# → /scenes/data-submission · eds-biz-data-submission

# 模块组件
pnpm scaffold:doc organisms nav-bar "NavBar" --preview
# → /organisms/nav-bar · eds-org-nav-bar

# 全局变量
pnpm scaffold:doc atoms scale-system "Scale System"
# → eds-vars-scale-system
```

## 生成的文件

```
src/content/docs/{sectionId}/{slug}/
  design.desktop.md      # 使用规范 · Desktop（默认主文档）
  design.mobile.md
  design.website.md
  develop.desktop.md     # 开发指南 · 各端
  develop.mobile.md
  develop.website.md
  index.ts               # bundles 已全部 wired

public/docs/{imageAssetDir}/
  desktop/.gitkeep         # design.desktop.md 配图
  mobile/.gitkeep
  website/.gitkeep
  # 开发指南无媒体目录
```

模板源文件位于 `_template/files/`，可按需调整默认章节骨架。

## 创建后手动一步

在 `src/config/navigation.ts` 的 `sectionNavById` 里添加侧栏菜单项：

```ts
{ label: '复合型数据提交引擎', to: '/scenes/data-submission' },
```

## 填写内容

- 各 md 内 `#` 标题会出现在 PageToc「On this page」
- 有内容的 platform 文件才会显示对应子 Tab（模板自带「（待撰写）」占位，Tab 默认可见）
- 配图：`!filename.png` → `public/docs/{imageAssetDir}/{scope}/filename.png`（仅**使用规范**；scope 为当前 Tab：`desktop` / `mobile` / `website`）
- 开发指南不含图形资源，不创建对应目录
