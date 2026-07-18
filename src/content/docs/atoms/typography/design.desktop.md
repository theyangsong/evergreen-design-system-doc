# 1. 定位

## **系统定义**

`Typography` 是 EverGreen Design System 的**语义文字系统（Semantic Typography Layer）**，用于统一所有文本表达的：

- 字体家族（Font Family）
- 字重（Font Weight）
- 字号（Font Size）
- 行高（Line Height）
- 渲染策略（Text Rendering）

`Typography` 本质上是一套样式系统，而非功能组件

## **核心设计思想**

**`Typography` = “信息结构表达系统”，不是视觉装饰系统**

字体排印的首要任务是清晰地传达信息的**层级结构**和**语义关系**，而非单纯的视觉美化。每一个文本元素都应该通过其字体大小、字重、行高等属性，向用户传递其在整个信息架构中的位置

## **系统边界（非常关键）**

`Typography` 不参与间距/布局/尺度系统（spacing / layout / scale system）。它是独立于物理尺度系统（Scale System）之外的语义系统：

```
原始字体排印层（Typography Primitives）
   ↓
语义角色层（Semantic Roles）
   ↓
组件文本映射（UI Component Text Mapping）
```

- ❌ Typography 不依赖 4px 体系（4px system）
- ❌ 间距（spacing）不控制字体大小（font size）
- ✔ 两者在组件层协同，但底层完全独立

## **设计目标**

- 建立统一的字体排印层级（Hierarchy），消除字号/行高随机性
- 提供语义化的文本角色（Role），与 Figma 保持 1:1 对齐
- 支持多语言混排（中文/英文/数字/Emoji）
- 满足 WCAG 无障碍标准（字号 ≥ 12px，行高 ≥ 1.4 倍）
- 降低设计与开发的对齐成本

## **解决的问题**

- 字号随意（12/13/14/15/16/18/20 混合使用）
- 行高不统一（1.2/1.3/1.5/1.6 随机）
- 字重使用混乱（400/500/600/700 无规则）
- 中文与英文混排时行高不协调
- 设计与开发对字体值理解不一致

## 使用边界

#### 可使用场景

- 所有用户界面文本（标题、正文、辅助信息）
- 数据表格（Data Table）中的文本内容
- 表单（Form）中的标签、值、提示信息
- 批处理栏（BatchBar）、工具栏（Toolbar）中的操作文本

#### 不适用场景

- 品牌标志（Logo）专用字体（不纳入系统）
- 插画/图形中的装饰性文字
- 非 UI 文本（如 PDF 导出、打印文档）

## 替代方案

- 当前方案：Typography`v1.0`
- 替代方案：直接使用原始值（无体系）
- 被替代原因：建立语义化的字体排印层级，统一设计与开发语言

---

# 2. 设计决策与演进

## 设计原则

1. **语义优先、**
    - 所有文本必须通过**语义角色（Semantic Role）**引用，而非直接使用字号/字重原始值。
    - 正确：`class="typography-body-medium"`
    - 错误：`font-size: 15px; font-weight: 400;`
2. **Figma 对齐、**
    - 每个语义角色对应 Figma 中的一个独立 Text Style
    - 角色名称与 Figma 命名完全一致
    - 设计与开发使用相同的命名语言
3. **系统分离**
    - Typography 与物理尺度系统（Scale System）完全分离。
    - Typography → 信息结构表达
    - Scale System → 空间结构表达
4. **继承与统一**
    - 所有组件必须继承全局字体家族（Global Font Stack）
    - 禁止局部覆盖字体家族（`font-family` override）
    - 文本渲染（`text-rendering`）必须全局统一
5. **多语言适配**
    - 中英文混排时，行高取最大值，保证两种语言对齐
    - Emoji 字体回退使用系统默认 Emoji 字体

## 设计权衡

- **语义化层级 vs 灵活组合 → 语义化层级**
    - 语义化层级：提供 12 个固定语义角色，设计稿可穷举，代码可复用
    - 灵活组合：允许任意字号/字重组合，灵活但导致设计与开发之间缺乏共同约定
    - 结论：选择语义化层级，优先保证一致性
- **独立角色 vs 角色+变体 → 独立角色**
    - 独立角色：每个字重组合作为独立角色，与 Figma 完全对齐，设计-开发沟通零摩擦
    - 角色+变体：角色下挂 Strong 变体，节省命名但增加认知负担
    - 结论：选择独立角色，与 Figma 命名完全一致
- **固定字号 vs 响应式缩放 → 固定字号**
    - 固定字号：所有字号基于固定值，与 Scale System 无关，可预测、易于测试
    - 响应式缩放：字号随视口变化，灵活但增加复杂度和测试难度
    - 结论：选择固定字号，优先保证可预测性

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：无体系** | 各业务自由定义字号/字重/行高 | 字号随意、行高混乱、设计与开发不一致 |
| **阶段二：原始 Token** | 定义字号/行高 Token，但无语义 | 开发者仍需要判断使用哪个字号，易用错 |
| **阶段三：语义角色** | 引入 Display / Body 等语义角色 | 使用更直观，但 Figma 与代码命名不一致 |
| **阶段四：当前版本** | 12 个独立语义角色，与 Figma 完全对齐 | 统一、可控、零沟通成本 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM & 运营 & 外部协作方、Dev（前端/后端）。

## UED

#### **须交付的设计资产**

| **资产** | **格式** | **说明** |
| --- | --- | --- |
| **字体排印层级图** | Figma / 文档 | 12 个语义层级的视觉对比 |
| **字号-字重-行高映射表** | 表格 | 每个语义层级的字号/字重/行高对应关系 |
| **字体家族使用规范** | Figma / 文档 | 中英文混排时的字体栈示例 |
| **文本渲染策略说明** | 文档 | `text-rendering: geometricPrecision` 的使用说明 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 资产示意图（字体排印层级、映射表、字体家族）    |
|                                                      |
|                                                      |
-------------------------------------------------------
图：12 个语义层级的视觉对比、字号-字重-行高映射表、字体家族使用示例
```

#### **详细交付指南**

1. **12 个独立语义角色**
    
    
    | **序号** | **语义角色** | **字号** | **字重** | **行高** | **使用场景** |
    | --- | --- | --- | --- | --- | --- |
    | 1 | **Display** | 40px | 700（Bold） | 48px | 大标题、视觉主视觉 |
    | 2 | **Headline** | 25px | 700（Bold） | 32px | 页面主标题 |
    | 3 | **Title** | 21px | 700（Bold） | 28px | Card 标题、Modal 标题 |
    | 4 | **Body Large** | 17px | 400（Regular） | 24px | 主要正文 |
    | 5 | **Body Large Strong** | 17px | 500（Medium） | 24px | 主要正文（强调） |
    | 6 | **Body Medium** | 15px | 400（Regular） | 22px | 默认正文、表格内容 |
    | 7 | **Body Medium Strong** | 15px | 500（Medium） | 22px | 默认正文（强调） |
    | 8 | **Body Small** | 13px | 400（Regular） | 18px | 次要内容、紧凑场景 |
    | 9 | **Body Small Strong** | 13px | 500（Medium） | 18px | 次要内容（强调） |
    | 10 | **Footnote** | 12px | 400（Regular） | 16px | 辅助提示 |
    | 11 | **Footnote Strong** | 12px | 500（Medium） | 16px | 辅助提示（强调） |
    | 12 | **Bar** | 11px | 500（Medium） | 14px | 批处理栏、工具栏文本 |
    
    > **Figma 对齐说明**：
    > 
    > - 以上 12 个角色与 Figma `textStyles` 中的 12 个样式完全对应
    > - 角色名称与 Figma Text Style 名称完全一致
    > - 设计师在 Figma 中使用 “Body Large”，开发使用 `typography-body-large`，命名完全对齐
    
    > **设计规则**：
    > 
    > - Display / Headline / Title → 使用 Bold（700），用于强视觉层级
    > - Body Large / Medium / Small → 提供 Regular（400）和 Strong（Medium 500）两种字重
    > - Footnote → 提供 Regular（400）和 Strong（Medium 500）两种字重
    > - Bar → 仅 Medium（500），系统级操作文本
2. **字体家族规范**
    
    
    | **场景** | **字体家族** | **说明** |
    | --- | --- | --- |
    | **通用文本** | EDS Text | 主字体，支持中英文混排 |
    | **中文文本** | PingFang SC | 中文字体回退（macOS / iOS） |
    | **Emoji 回退** | Apple Color Emoji / Segoe UI Emoji | 跨平台 Emoji 支持 |
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 字体家族使用示例图                        |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：EDS Text 与 PingFang SC 混排效果、Emoji 回退示例
    ```
    
    > ✅ 允许：使用 12 个语义角色（与 Figma 完全对齐）
    ✅ 允许：在设计稿中使用语义层级命名（如 “Body Large” 而非 “17px”）
    > 
    > 
    > ❌ 禁止：直接使用原始字号/字重值
    > ❌ 禁止：在设计中定义新的字体层级（需通过 Design Token 系统申请）
    > 

## PM & Others

#### **须理解的内容**

| **条目** | **说明** | **示例** |
| --- | --- | --- |
| **内容层级映射** | 不同类型的内容对应不同的字体层级 | “页面标题 → Headline” |
| **字体层级数量** | 12 个固定层级，与 Figma 对齐 | “不存在中间层级” |
| **多语言支持** | 中英文混排使用同一套字体层级 | “英文和中文使用相同的语义层级” |
| **无障碍要求** | 正文 ≥ 13px，行高 ≥ 1.4 | “正文至少 Body Small（13px）” |

#### **字体层级的业务含义**

| **业务内容类型** | **映射字体角色** |
| --- | --- |
| 页面主标题 | Headline |
| 模块标题 | Title |
| 主要正文描述 | Body Large |
| 默认正文 | Body Medium |
| 表格内容 | Body Medium |
| 紧凑场景 | Body Small |
| 辅助说明 | Footnote |
| 批处理栏操作 | Bar |

## Dev

#### **全局 CSS 配置**

```css
/* ========================================
   全局字体排印配置
   ======================================== */

:root {
  /* ---- 原始字体排印令牌（Primitive Tokens） ---- */
  /* 字号 */
  --size-4xl: 40px;
  --size-3xl: 25px;
  --size-2xl: 21px;
  --size-xl: 17px;
  --size-lg: 15px;
  --size-md: 13px;
  --size-sm: 12px;
  --size-xs: 11px;

  /* 行高 */
  --line-height-4xl: 48px;
  --line-height-3xl: 32px;
  --line-height-2xl: 28px;
  --line-height-xl: 24px;
  --line-height-lg: 22px;
  --line-height-md: 18px;
  --line-height-sm: 16px;
  --line-height-xs: 14px;

  /* 字重 */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-bold: 700;

  /* ---- 语义角色令牌（Semantic Role Tokens） ---- */
  /* Display */
  --typography-display-size: var(--size-4xl);
  --typography-display-weight: var(--weight-bold);
  --typography-display-line-height: var(--line-height-4xl);

  /* Headline */
  --typography-headline-size: var(--size-3xl);
  --typography-headline-weight: var(--weight-bold);
  --typography-headline-line-height: var(--line-height-3xl);

  /* Title */
  --typography-title-size: var(--size-2xl);
  --typography-title-weight: var(--weight-bold);
  --typography-title-line-height: var(--line-height-2xl);

  /* Body Large */
  --typography-body-large-size: var(--size-xl);
  --typography-body-large-weight: var(--weight-regular);
  --typography-body-large-line-height: var(--line-height-xl);

  /* Body Large Strong */
  --typography-body-large-strong-size: var(--size-xl);
  --typography-body-large-strong-weight: var(--weight-medium);
  --typography-body-large-strong-line-height: var(--line-height-xl);

  /* Body Medium */
  --typography-body-medium-size: var(--size-lg);
  --typography-body-medium-weight: var(--weight-regular);
  --typography-body-medium-line-height: var(--line-height-lg);

  /* Body Medium Strong */
  --typography-body-medium-strong-size: var(--size-lg);
  --typography-body-medium-strong-weight: var(--weight-medium);
  --typography-body-medium-strong-line-height: var(--line-height-lg);

  /* Body Small */
  --typography-body-small-size: var(--size-md);
  --typography-body-small-weight: var(--weight-regular);
  --typography-body-small-line-height: var(--line-height-md);

  /* Body Small Strong */
  --typography-body-small-strong-size: var(--size-md);
  --typography-body-small-strong-weight: var(--weight-medium);
  --typography-body-small-strong-line-height: var(--line-height-md);

  /* Footnote */
  --typography-footnote-size: var(--size-sm);
  --typography-footnote-weight: var(--weight-regular);
  --typography-footnote-line-height: var(--line-height-sm);

  /* Footnote Strong */
  --typography-footnote-strong-size: var(--size-sm);
  --typography-footnote-strong-weight: var(--weight-medium);
  --typography-footnote-strong-line-height: var(--line-height-sm);

  /* Bar */
  --typography-bar-size: var(--size-xs);
  --typography-bar-weight: var(--weight-medium);
  --typography-bar-line-height: var(--line-height-xs);
}

/* ---- 全局字体家族 ---- */
body {
  font-family: "EDS Text", "PingFang SC", "SourceHanSansSC", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### **语义角色 CSS 类**

```css
/* ========================================
   语义角色类
   名称与 Figma Text Styles 完全一致
   ======================================== */

.typography-display {
  font-size: var(--typography-display-size);
  font-weight: var(--typography-display-weight);
  line-height: var(--typography-display-line-height);
}

.typography-headline {
  font-size: var(--typography-headline-size);
  font-weight: var(--typography-headline-weight);
  line-height: var(--typography-headline-line-height);
}

.typography-title {
  font-size: var(--typography-title-size);
  font-weight: var(--typography-title-weight);
  line-height: var(--typography-title-line-height);
}

.typography-body-large {
  font-size: var(--typography-body-large-size);
  font-weight: var(--typography-body-large-weight);
  line-height: var(--typography-body-large-line-height);
}

.typography-body-large-strong {
  font-size: var(--typography-body-large-strong-size);
  font-weight: var(--typography-body-large-strong-weight);
  line-height: var(--typography-body-large-strong-line-height);
}

.typography-body-medium {
  font-size: var(--typography-body-medium-size);
  font-weight: var(--typography-body-medium-weight);
  line-height: var(--typography-body-medium-line-height);
}

.typography-body-medium-strong {
  font-size: var(--typography-body-medium-strong-size);
  font-weight: var(--typography-body-medium-strong-weight);
  line-height: var(--typography-body-medium-strong-line-height);
}

.typography-body-small {
  font-size: var(--typography-body-small-size);
  font-weight: var(--typography-body-small-weight);
  line-height: var(--typography-body-small-line-height);
}

.typography-body-small-strong {
  font-size: var(--typography-body-small-strong-size);
  font-weight: var(--typography-body-small-strong-weight);
  line-height: var(--typography-body-small-strong-line-height);
}

.typography-footnote {
  font-size: var(--typography-footnote-size);
  font-weight: var(--typography-footnote-weight);
  line-height: var(--typography-footnote-line-height);
}

.typography-footnote-strong {
  font-size: var(--typography-footnote-strong-size);
  font-weight: var(--typography-footnote-strong-weight);
  line-height: var(--typography-footnote-strong-line-height);
}

.typography-bar {
  font-size: var(--typography-bar-size);
  font-weight: var(--typography-bar-weight);
  line-height: var(--typography-bar-line-height);
}
```

#### **Vue 组件使用示例**

```html
<template>
  <!-- 语义角色类与 Figma 命名完全一致 -->
  <h1 class="typography-headline">页面主标题</h1>
  <p class="typography-body-large">这是主要正文内容。</p>
  <p class="typography-body-medium">这是默认正文内容。</p>
  <p class="typography-body-small">这是紧凑场景内容。</p>
  <span class="typography-footnote">辅助提示信息</span>
  <span class="typography-bar">批处理栏文本</span>
</template>
```

#### **使用原则**

- 语义角色驱动：必须使用语义角色类，禁止直接使用字号/字重
- 继承全局字体家族：所有组件继承 `body` 的 `font-family`
- 禁止局部覆盖：不允许在组件内部覆盖 `font-family`

> ✅ 允许：使用语义角色类（`typography-body-medium`）
> 
> 
> ✅ 允许：使用 CSS 变量（`var(--typography-body-medium-size)`）
> 
> ❌ 禁止：直接使用字号原始值（`font-size: 15px`）
> 
> ❌ 禁止：在组件内覆盖 `font-family`
> 
> ❌ 禁止：使用非语义化的字号/字重组合
> 

---

# 4. **结构拆解**

| **层级** | **组件** | **职责** |
| --- | --- | --- |
| 原始字体排印层（Typography Primitives） | 字体家族、字号、字重、行高 | 定义基础数值（原始 Token） |
| 语义角色层（Semantic Roles） | 12 个独立语义角色 | 将原始值映射为语义角色，与 Figma 完全对齐 |
| 令牌层（Token Layer） | CSS Variables | 输出可被组件消费的令牌 |
| 组件映射层（Component Mapping） | Data Table / Form / BatchBar / ... | 组件消费语义角色令牌 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 结构拆解图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：原始字体排印层 → 语义角色层 → 令牌层 → 组件映射层的层级关系
```

---

# 5.  变体与状态系统

Typography 是静态令牌体系，不涉及动态状态变化

---

# 6. 交互与视觉行为

Typography 是静态令牌体系，不涉及动态交互行为

---

# 7. 数据模型与逻辑

## **示例**

```json
{
  "role": "body-medium",
  "fontFamily": "EDS Text",
  "fontSize": "15px",
  "lineHeight": "22px",
  "weight": "400"
}
```

## **映射规则**

| **语义角色** | **字号** | **字重** | **行高** | **CSS 类名** |
| --- | --- | --- | --- | --- |
| Display | 40px | 700 | 48px | `typography-display` |
| Headline | 25px | 700 | 32px | `typography-headline` |
| Title | 21px | 700 | 28px | `typography-title` |
| Body Large | 17px | 400 | 24px | `typography-body-large` |
| Body Large Strong | 17px | 500 | 24px | `typography-body-large-strong` |
| Body Medium | 15px | 400 | 22px | `typography-body-medium` |
| Body Medium Strong | 15px | 500 | 22px | `typography-body-medium-strong` |
| Body Small | 13px | 400 | 18px | `typography-body-small` |
| Body Small Strong | 13px | 500 | 18px | `typography-body-small-strong` |
| Footnote | 12px | 400 | 16px | `typography-footnote` |
| Footnote Strong | 12px | 500 | 16px | `typography-footnote-strong` |
| Bar | 11px | 500 | 14px | `typography-bar` |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 数据模型映射示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：角色（Role）→ 令牌（Token）→ CSS 变量（CSS Variable）的解析路径
```

---

# 8. 使用规范

## 允许

- 使用语义角色
- 所有文本必须继承全局字体家族（`font-family`）
- 文本渲染（`text-rendering`）必须启用 `geometricPrecision`

## 禁止

- 直接使用字号原始值（如 `font-size: 15px`）
- 局部覆盖字体家族（`font-family` override）
- 使用非语义化的字号/字重组合

## 约束

| **约束项** | **限制** |
| --- | --- |
| 语义层级数量 | 固定 12 个，与 Figma 完全对齐 |
| 正文最小字号 | 13px（Body Small） |
| 推荐正文字号 | 15px（Body Medium，可读性优先） |

---

# 9. 开发实现

## **技术栈**

- 框架：Vue 3 / React
- 样式：CSS 变量 + SCSS
- 令牌管理：设计令牌工具（如 Style Dictionary）

## **架构**

```
Typography 领域特定语言（Typography DSL）
    ↓
设计令牌生成器（Design Token Generator）
    ↓
CSS 变量（主题层）
    ↓
语义角色类（Semantic Role Classes）
    ↓
组件消费（Component Consumption）
```

## 原则

- Typography 不运行时计算（编译时生成 CSS 变量）
- Typography 不参与状态逻辑
- Typography 只在主题层定义，组件消费语义角色类

---

# 10. 组合与依赖关系

## **依赖项**

- 无（独立系统，不依赖其他 EDS 系统）

## **被依赖项**

- 数据表格系统（Data Table System）：表格内容使用 Body Medium，标题使用 Headline
- 数据提交引擎（Submission Engine）：表单标签使用 Body Medium，提示使用 Footnote
- 批处理栏（BatchBar）：操作文本使用 Bar
- 所有用户界面组件：Button、Input、Modal、Card 等

## **与尺度系统（Scale System）的关系**

| **系统** | **职责** | **关系** |
| --- | --- | --- |
| **尺度系统（Scale System）** | 空间结构（间距、圆角、层级） | 独立，不控制 Typography |
| **Typography** | 信息结构（字号、行高、字重） | 独立，不依赖 4px 体系 |

**禁止关系**：

- Typography 不使用 4px 尺度（Scale）
- 间距（Spacing）不控制字体大小（Font Size）

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组合关系示意图                            |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Typography 与尺度系统、组件系统的协同关系
```

---

# 11. 无障碍

| **要求** | **实现方式** |
| --- | --- |
| **正文最小字号 ≥ 13px** | 使用 Body Small（13px）作为最小正文字号 |
| **推荐正文 ≥ 15px** | Body Medium（15px）为默认，保障可读性 |
| **行高 ≥ 1.4** | 所有层级行高 ≥ 1.4 倍字号 |
| **文本渲染优化** | `text-rendering: geometricPrecision` 提升低 DPI 屏幕可读性 |
| **对比度合规** | 由 Color System 控制文本与背景对比度 |

---

# 12. 性能限制

| **指标** | **限制** | **备注** |
| --- | --- | --- |
| 字体预加载 | 必须 | EDS Text、PingFang SC 需预加载 |
| 动态字体切换 | 禁止 | 避免运行时切换字体家族 |
| 运行时重计算 | 禁止 | Typography 在编译时解析 |
| 字体数量 | 2 个主字体 + 系统回退 | EDS Text + PingFang SC |

---

# 13. 边界情况

| **场景** | **处理方式** |
| --- | --- |
| **中文 vs 英文行高不一致** | 取两者最大值，保证混排时对齐 |
| **Emoji 回退渲染** | 使用 `Apple Color Emoji` / `Segoe UI Emoji` 系统回退 |
| **长文本在 Data Table 中换行** | 使用 Body Medium（15px / 24px），由表格组件控制换行策略 |
| **低 DPI 屏幕可读性** | `text-rendering: geometricPrecision` + `-webkit-font-smoothing: antialiased` |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 边界情况处理示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：中文 vs 英文行高对齐、Emoji 回退、长文本换行示例
```

---

# 14. 拓展性

| **扩展点** | **方式** | **说明** |
| --- | --- | --- |
| **多语言字体调优** | 在主题层扩展 `font-family` | 支持更多语言（如日文、韩文） |
| **暗黑模式对比度调整** | 通过 Color System 控制 | 字体颜色由 Color System 管理 |
| **密度驱动行高调整** | 通过 Density System 覆盖 | 紧凑/标准/舒适模式下行高微调 |
| **品牌字体覆盖** | 在主题层覆盖 `font-family` | 品牌定制时修改，但需受控 |

**限制**：禁止在组件层覆盖字体家族；所有扩展在主题层进行

---

# 15. 生命周期与版本管理

## 当前版本

v1.1

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 修改 | 初始版本，建立语义字体排印系统（12 个独立语义角色，与 Figma 完全对齐） | 无 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 暂无

## 迁移指南

1. 将设计稿中的所有字号映射到对应的 12 个语义角色之一
2. 移除所有硬编码字号，替换为语义角色类
3. 确保全局 CSS 已配置 `font-family` 和 `text-rendering`
4. 确认中英文混排行高正常

## **最终系统总结（非常关键）**
```
原始字体排印层（Typography Primitives）
   ├── 字体家族（Font Family）：EDS Text / PingFang SC
   ├── 字号（Font Size）：40 / 25 / 21 / 17 / 15 / 13 / 12 / 11
   ├── 字重（Font Weight）：400 / 500 / 700
   └── 行高（Line Height）：48 / 32 / 28 / 24 / 22 / 18 / 16 / 14
   ↓
语义角色层（12 个独立角色，与 Figma 完全对齐）
   ├── typography-display             40px / 700 / 48px
   ├── typography-headline            25px / 700 / 32px
   ├── typography-title               21px / 700 / 28px
   ├── typography-body-large          17px / 400 / 24px
   ├── typography-body-large-strong   17px / 500 / 24px
   ├── typography-body-medium         15px / 400 / 22px
   ├── typography-body-medium-strong  15px / 500 / 22px
   ├── typography-body-small          13px / 400 / 18px
   ├── typography-body-small-strong   13px / 500 / 18px
   ├── typography-footnote            12px / 400 / 16px
   ├── typography-footnote-strong     12px / 500 / 16px
   └── typography-bar                 11px / 500 / 14px
   ↓
令牌层（Token Layer）
   ↓
组件映射层（Component Mapping）
   ↓
数据表格 / 表单 / 用户界面系统（Data Table / Form / UI System）
```