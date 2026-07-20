# 1. 定位

## **系统定义**

`Color System` 是 EverGreen Design System 的基础视觉层，用于定义所有 UI 组件的颜色表达规则，并通过 Token 化方式确保跨设计与开发的一致性。

## 设计目标

- 保证跨组件视觉一致性
- 支持主题扩展
- 满足可访问性（WCAG）
- 提供语义化颜色体系

## 解决的问题

- 用户界面颜色不统一
- 设计稿与开发色值、多版本色彩表达不一致
- 状态、标签表达混乱
- 主题无法扩展

## 使用边界

### 可使用场景

- 容器 Box ：软件容器 Container、模块菜单 Menu、页面 Page、浮层 Flotation
- 边框 Stroke：容器描边、iCons描边、Token边框等
- 文本 Text
- 材质 Material：容器填充、形状填充
- 数据表 Data Table：表头 Head、滚动条 Scroll
- 效果 Effect：阴影 Shallow、弹窗 Popup、背景模糊 Mask、提示 Prompt

### 不适用场景

- 插画专用颜色
- 非系统级临时视觉效果
- 单一页面定制色

---

# 2. 设计决策与演进

## 设计原则

- **Token 优先**：所有颜色必须来自 Variable，而非直接 Hex
- 语意优先：使用“变量名”而非“色彩名”
- 无障碍：优先保证对比度而非视觉美观
- 拓展性：支持多主题扩展（Light / Dark / Brand Variants）

## 设计权衡

| 决策 | 取舍 |
| --- | --- |
| 使用 Cregis Green (#05472A) 作为 Brand | 品牌对齐，但该色系在不同屏幕素质下饱和度低，视觉效果差 |
| 扁平化状态色 | 可读性高但情绪表达弱 |
| Token化体系及替换 | 增加开发成本但提升长期维护性 |

## 演进逻辑

- 未制定版本：直接 Hex 使用
- 未制定版本：制定了基色，但使用场景不清晰，交叉使用，难以管理
- v 1.1：基于基色的多场景变量系统，方便拓展、管理、与开发对齐（推荐）

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：无规范** | 直接 Hex 使用 | 混乱 |
| **阶段二：校验层** | 制定了基色，但使用场景不清晰，交叉使用，难以管理 | 无语义化定义，维护困难 |
| **阶段三：执行层** | 基于基色的多场景变量系统，方便拓展、管理、与开发对齐 | 解决以上问题 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM and Others、DEV（前端/后端）。

## UED

- 禁止直接使用基色（Primitives）
- 禁止定义变量外的颜色
- Color Token 统一引用（禁止直接 Hex）
- 颜色分层：
    - Primitives Color
    - Semantic Color
- 状态颜色必须绑定 UI 状态（Hover / Active / Focus）

## DEV

- 所有颜色通过 CSS Variables 或 Design Tokens 输出
- 禁止 HardCode HEX
- 支持 Theme 切换（Light / Dark）
- 颜色映射必须 1:1 对齐 Design Tokens
- Tab 颜色映射单独维护

## PM and Others

- EDS Brand= 产品识别核心
- EDS Match= 说明、注释
- EDS Success = 用户反馈系统
- EDS Warning / EDS Danger = 风险提示
- EDS Base & EDS Face = 信息优先级表达方式
---

# 4. 变量映射管理

#### Primitives：基色

| 基色 Primitives | 色值 Color Value (Light)  | 色值 Color Value (Dark)  | **变更时间** | **备注** |
| --- | --- | --- | --- | --- |
| `eds-brand` | `display-p3 .1216 .7647 .3529` | `display-p3 .1216 .7647 .3529` |  |  |
| `eds-match` | `display-p3 0 .2275 .4275` | `display-p3 0 .2549 .4706` |  |  |
| `eds-decor` | `display-p3 .0078 .1765 .0510` | `display-p3 1 1 1` |  |  |
| `eds-success` | `display-p3 .1216 .7647 .3529` | `display-p3 .1216 .7647 .3529` |  |  |
| `eds-danger` | `display-p3 .8431 .2745 .1765` | `display-p3 .9804 .4118 .3137` |  |  |
| `eds-warning` | `display-p3 .9216 .5686 .0784` | `display-p3 1 .6667 .1961` |  |  |
| `eds-base` | `display-p3 .0078 .0118 .0157` | `display-p3 1 1 1` |  |  |
| `eds-face` | `display-p3 1 1 1` | `display-p3 .0078 .0118 .0157` |  |  |
| `eds-same-black` | `display-p3 .0078 .0118 .0157` | `display-p3 .0078 .0118 .0157` |  |  |
| `eds-same-white` | `display-p3 1 1 1` | `display-p3 1 1 1` |  |  |
| `eds-container` | `display-p3 .9020 .9059 .9098` | `display-p3 .1647 .1765 .1882` |  |  |
| `eds-menu` | `display-p3 .9804 .9804 .9804` | `display-p3 .1451 .1569 .1647` | 2026/6.25 | 修改浅色模式色值为 `display-p3 .9048 .9048 .9048` |
| `eds-page` | `display-p3 1 1 1` | `display-p3 .1176 .1294 .1373` |  |  |
| `eds-popup` | `display-p3 1 1 1` | `display-p3 .1373 .1451 .1529` | 2026/6.25 | 新增基色 |
| `eds-flotation` | `display-p3 0.8863 0.8941 0.9020` | `display-p3 .1373 .1451 .1529` | 2026/6.25 | 修改浅色模式色值为 `display-p3 0.8863 0.8941 0.9020` |
| `eds-inner-glow` | `display-p3 0.1569 0.1569 0.1569` | `display-p3 0.2353 0.2353 0.2353` | 2026/6.25 | 新增基色 |
| `eds-vulvar-glow` | `display-p3 0.8627 0.8627 0.8627` | `display-p3 0.6275 0.6275 0.6275` | 2026/6.25 | 新增基色 |
| `eds-data-table` | `display-p3 .9569 .9608 .9647` | `display-p3 .0941 .0980 .1020` |  |  |
| `eds-module-stroke` | `display-p3 .9216 .9255 .9294` | `display-p3 0 0 0` |  |  |

---

#### Box：仅用于内容外壳

| 变量名 Variable Name | 浅色 Light | **深色 Dark** | 变更时间 Time | 备注 Notes |
| --- | --- | --- | --- | --- |
| `box-container` | `color(var(--eds-container) / .6)` | `color(var(--eds-container) / .6)` |  |  |
| `box-menu` | `color(var(--eds-menu) / 1)` | `color(var(--eds-menu) / 1)` |  |  |
| `box-page` | `color(var(--eds-face) / 1)` | `color(var(--eds-face) / 1)` |  |  |
| `box-flotation` | `color(var(--eds-flotation) / 1)` | `color(var(--eds-flotation) / 1)` |  |  |

#### Stroke：跟描边、线条、边框相关元素

| 变量名 Variable Name | 浅色 Light | **深色 Dark** | 变更时间 Time | 备注 Notes |
| --- | --- | --- | --- | --- |
| **`stroke-hide`** | `color(var(--eds-base) / 0)` | `color(var(--eds-base) / 0)` |  |  |
| **`stroke-base-primary`** | `color(var(--eds-base) / 1)` | `color(var(--eds-base) / 1)` |  |  |
| **`stroke-base-secondary`** | `color(var(--eds-base) / .6)` | `color(var(--eds-base) / .6)` |  |  |
| **`stroke-base-tertiary`** | `color(var(--eds-base) / .4)` | `color(var(--eds-base) / .4)` |  |  |
| **`stroke-base-quaternary`** | `color(var(--eds-base) / .2)` | `color(var(--eds-base) / .2)` |  |  |
| **`stroke-face-primary`** | `color(var(--eds-face) / 1)` | `color(var(--eds-face) / 1)` |  |  |
| **`stroke-face-secondary`** | `color(var(--eds-face) / .6)` | `color(var(--eds-face) / .6)` |  |  |
| **`stroke-divider-module`** | `color(var(--eds-module-stroke) / 1)` | `color(var(--eds-module-stroke) / 1)` |  |  |
| **`stroke-divider-page`** | `color(var(--eds-base) / .1)` | `color(var(--eds-base) / .1)` |  |  |
| **`stroke-divider-table`** | `color(var(--eds-base) / .04)` | `color(var(--eds-base) / .04)` |  |  |
| **`stroke-outline-shallow`** | `color(var(--eds-base) / .12)` | `color(var(--eds-base) / .14)` |  |  |
| **`stroke-outline-deep`** | `color(var(--eds-base) / .18)` | `color(var(--eds-base) / .2)` |  |  |
| **`stroke-outline-subtle`** | `color(var(--eds-base) / .06)` | `color(var(--eds-base) / .1)` |  |  |
| **`stroke-color-brand`** | `color(var(--eds-brand) / 1)` | `color(var(--eds-brand) / 1)` |  |  |
| **`stroke-color-brand-active`** | `color(var(--eds-brand) / .6)` | `color(var(--eds-brand) / .6)` |  |  |
| **`stroke-color-table-hover`** | `color(var(--eds-brand) / .4)` | `color(var(--eds-brand) / .4)` |  |  |
| **`stroke-color-success`** | `color(var(--eds-success) / 1)` | `color(var(--eds-success) / 1)` |  |  |
| **`stroke-color-decor`** | `color(var(--eds-decor) / 1)` | `color(var(--eds-decor) / 1)` |  |  |
| **`stroke-color-danger`** | `color(var(--eds-danger) / 1)` | `color(var(--eds-danger) / 1)` |  |  |
| **`stroke-color-danger-active`** | `color(var(--eds-danger) / .6)` | `color(var(--eds-danger) / .6)` |  |  |
| **`stroke-same-white-primary`** | `color(var(--eds-same-white) / 1)` | `color(var(--eds-same-white) / 1)` |  |  |
| **`stroke-same-white-secondary`** | `color(var(--eds-same-white) / .6)` | `color(var(--eds-same-white) / .6)` |  |  |
| **`stroke-same-black-primary`** | `color(var(--eds-same-black) / 1)` | `color(var(--eds-same-black) / 1)` |  |  |
| **`stroke-same-black-secondary`** | `color(var(--eds-same-black) / .6)` | `color(var(--eds-same-black) / .6)` |  |  |

#### Text：文本属性

| **变量名 Variable Name** | **浅色 Light** | **深色Dark** | **变更时间 Time** | **备注Notes** |
| --- | --- | --- | --- | --- |
| **`text-brand-primary`** | `color(var(--eds-brand) / 1)` | `color(var(--eds-brand) / 1)` |  |  |
| **`text-brand-secondary`** | `color(var(--eds-brand) / .6)` | `color(var(--eds-brand) / .6)` |  |  |
| **`text-brand-tertiary`** | `color(var(--eds-brand) / .4)` | `color(var(--eds-brand) / .4)` |  |  |
| **`text-brand-quaternary`** | `color(var(--eds-brand) / .2)` | `color(var(--eds-brand) / .2)` |  |  |
| **`text-match`** | `color(var(--eds-match) / 1)` | `color(var(--eds-match) / 1)` |  |  |
| **`text-success`** | `color(var(--eds-success) / 1)` | `color(var(--eds-success) / 1)` |  |  |
| **`text-danger-primary`** | `color(var(--eds-danger) / 1)` | `color(var(--eds-danger) / 1)` |  |  |
| **`text-danger-secondary`** | `color(var(--eds-danger) / .6)` | `color(var(--eds-danger) / .6)` |  |  |
| **`text-warning`** | `color(var(--eds-warning) / 1)` | `color(var(--eds-warning) / 1)` |  |  |
| **`text-same-black-primary`** | `color(var(--eds-same-black) / 1)` | `color(var(--eds-same-black) / 1)` |  |  |
| **`text-same-black-secondary`** | `color(var(--eds-same-black) / .6)` | `color(var(--eds-same-black) / .6)` |  |  |
| **`text-same-white-primary`** | `color(var(--eds-same-white) / 1)` | `color(var(--eds-same-white) / 1)` |  |  |
| **`text-same-white-secondary`** | `color(var(--eds-same-white) / .6)` | `color(var(--eds-same-white) / .6)` |  |  |
| **`text-base-primary`** | `color(var(--eds-base) / 1)` | `color(var(--eds-base) / 1)` |  |  |
| **`text-base-secondary`** | `color(var(--eds-base) / .6)` | `color(var(--eds-base) / .6)` |  |  |
| **`text-base-tertiary`** | `color(var(--eds-base) / .4)` | `color(var(--eds-base) / .4)` |  |  |
| **`text-base-quaternary`** | `color(var(--eds-base) / .2)` | `color(var(--eds-base) / .2)` |  |  |
| **`text-face-primary`** | `color(var(--eds-face) / 1)` | `color(var(--eds-face) / 1)` |  |  |
| **`text-face-secondary`** | `color(var(--eds-face) / .6)` | `color(var(--eds-face) / .6)` |  |  |
| **`text-face-tertiary`** | `color(var(--eds-face) / .4)` | `color(var(--eds-face) / .4)` |  |  |
| **`text-face-quaternary`** | `color(var(--eds-face) / .2)` | `color(var(--eds-face) / .2)` |  |  |

#### Material：形状、画框、分区等填充

| **变量名 Variable Name** | **浅色 Light** | **深色Dark** | **变更时间 Time** | **备注Notes** |
| --- | --- | --- | --- | --- |
| **`material-hide`** | `color(var(--eds-base) / 0)` | `color(var(--eds-base) / 0)` |  |  |
| **`material-brand-primary`** | `color(var(--eds-brand) / 1)` | `color(var(--eds-brand) / 1)` |  |  |
| **`material-brand-tertiary`** | `color(var(--eds-brand) / .4)` | `color(var(--eds-brand) / .4)` |  |  |
| **`material-brand-quaternary`** | `color(var(--eds-brand) / .2)` | `color(var(--eds-brand) / .2)` |  |  |
| **`material-brand-quinary`** | `color(var(--eds-brand) / .1)` | `color(var(--eds-brand) / .1)` |  |  |
| **`material-match-primary`** | `color(var(--eds-match) / 1)` | `color(var(--eds-match) / 1)` |  |  |
| **`material-match-quaternary`** | `color(var(--eds-match) / .2)` | `color(var(--eds-match) / .2)` |  |  |
| **`material-decor-primary`** | `color(var(--eds-decor) / 1)` | `color(var(--eds-decor) / 1)` |  |  |
| **`material-decor-quaternary`** | `color(var(--eds-decor) / .2)` | `color(var(--eds-decor) / .2)` |  |  |
| **`material-success-primary`** | `color(var(--eds-success) / 1)` | `color(var(--eds-success) / 1)` |  |  |
| **`material-success-quaternary`** | `color(var(--eds-success) / .2)` | `color(var(--eds-success) / .2)` |  |  |
| **`material-danger-primary`** | `color(var(--eds-danger) / 1)` | `color(var(--eds-danger) / 1)` |  |  |
| **`material-danger-quaternary`** | `color(var(--eds-danger) / .2)` | `color(var(--eds-danger) / .2)` |  |  |
| **`material-warning-primary`** | `color(var(--eds-warning) / 1)` | `color(var(--eds-warning) / 1)` |  |  |
| **`material-warning-quaternary`** | `color(var(--eds-warning) / .2)` | `color(var(--eds-warning) / .2)` |  |  |
| **`material-same-black`** | `color(var(--eds-same-black) / 1)` | `color(var(--eds-same-black) / 1)` |  |  |
| **`material-same-white-primary`** | `color(var(--eds-same-white) / 1)` | `color(var(--eds-same-white) / 1)` |  |  |
| **`material-same-white-secondary`** | `color(var(--eds-same-white) / .6)` | `color(var(--eds-same-white) / .6)` |  |  |
| `material-same-white-tertiary` | `color(var(--eds-same-white) / 1)` | `color(var(--eds-same-white) / .2)` | 2026/6.25 | `material-same-white-quaternary`修改名称为 `material-same-white-tertiary` 浅色模式不透明度由0.8改为1 |
| `material-same-white-quaternary` | `color(var(--eds-same-white) / .1)` | `color(var(--eds-same-white) / .04)` | 2026/6.25 | 新增 |
| **`material-card-shallow`** | `color(var(--eds-base) / .02)` | `color(var(--eds-base) / .02)` |  |  |
| **`material-card-moderate`** | `color(var(--eds-base) / .05)` | `color(var(--eds-base) / .07)` |  |  |
| **`material-card-subtle`** | `color(var(--eds-base) / .04)` | `color(var(--eds-base) / .06)` |  |  |
| **`material-card-deep`** | `color(var(--eds-base) / .1)` | `color(var(--eds-base) / .1)` |  |  |
| **`material-base-primary`** | `color(var(--eds-base) / 1)` | `color(var(--eds-base) / 1)` |  |  |
| **`material-base-secondary`** | `color(var(--eds-base) / .6)` | `color(var(--eds-base) / .6)` |  |  |
| **`material-base-tertiary`** | `color(var(--eds-base) / .4)` | `color(var(--eds-base) / .4)` |  |  |
| **`material-base-quaternary`** | `color(var(--eds-base) / .2)` | `color(var(--eds-base) / .2)` |  |  |
| **`material-face-primary`** | `color(var(--eds-face) / 1)` | `color(var(--eds-face) / 1)` |  |  |
| **`material-face-secondary`** | `color(var(--eds-face) / .6)` | `color(var(--eds-face) / .6)` |  |  |
| **`material-face-tertiary`** | `color(var(--eds-face) / .4)` | `color(var(--eds-face) / .4)` |  |  |
| **`material-face-quaternary`** | `color(var(--eds-face) / .2)` | `color(var(--eds-face) / .2)` |  |  |

#### Data Table：数据表格、数据表单

| **变量名** | **浅色模式** | **深色模式** | **变更时间** | **备注** |
| --- | --- | --- | --- | --- |
| `data-table-head` | `color(var(--eds-data-table) / .9)` | `color(var(--eds-data-table) / .9)` |  |  |
| `data-table-scroll-bar-background` | `color(var(--eds-data-table) / .9)` | `color(var(--eds-data-table) / .9)` |  |  |
| `data-table-scroll-bar-indicator` | `color(var(--eds-base) / .04)` | `color(var(--eds-base) / .07)` |  |  |
| `data-table-scroll-bar-indicator-hover` | `color(var(--eds-base) / .2)` | `color(var(--eds-base) / .2)` |  |  |

#### Effect：阴影、背景模糊、弹窗背景等

| **变量名 Variable Name** | **浅色 Light** | **深色Dark** | **变更时间 Time** | **备注Notes** |
| --- | --- | --- | --- | --- |
| **`effect-shadow`** | `color(var(--eds-same-black) / .2)` | `color(var(--eds-same-black) / .6)` | 2026/6.25 | **`effect-shadow`**修改名称为 `effect-vulvar-shadow` |
| `effect-vulvar-shadow-subtle` | `color(var(--eds-same-black) / .03)` | `color(var(--eds-same-black) / .2)` | 2026/6.25 | `effect-subtle-shadow` 修改名称为 `effect-vulvar-shadow-subtle` |
| `effect-vulvar-shadow-glow` | `color(var(--eds-vulvar-glow) / 1)` | `color(var(--eds-vulvar-glow) / 1)` | 2026/6.25 | 新增 |
| `effect-inner-shadow` | `color(var(--eds-same-black) / 1)` | `color(var(--eds-same-black) / 1)` | 2026/6.25 | 新增 |
| `effect-inner-shadow-glow` | `color(var(--eds-inner-glow) / 1)` | `color(var(--eds-innerglow) / 1)` | 2026/6.25 | 新增 |
| **`effect-popup-background`** | `color(var(--eds-same-black) / .5)` | `color(var(--eds-same-black) / .5)` |  |  |
| **`effect-popup-box`** | `color(var(--eds-flotation) / 1)` | `color(var(--eds-flotation) / 1)` | 2026/6.25 | 引用的基色由原来的 `eds-flotation` 变为 `eds-popup` |
| `effect-flotation-box` | `color(var(--eds-flotation) / .6)` | `color(var(--eds-flotation) / .6)` | 2026/6.25 | 新增 |
| **`effect-mask`** | `color(var(--eds-page) / .6)` | `color(var(--eds-page) / .6)` |  |  |
| **`effect-prompt`** | `color(var(--eds-base) / .9)` | `color(var(--eds-base) / .2)` |  |  |

#### Event：交互事件

| **变量名 Variable Name** | **浅色 Light** | **深色Dark** | **变更时间 Time** | **备注Notes** |
| --- | --- | --- | --- | --- |
| **`event-hover-primary`** | `color(var(--eds-brand) / 1)` | `color(var(--eds-brand) / 1)` |  |  |
| **`event-hover-secondary`** | `color(var(--eds-base) / .05)` | `color(var(--eds-base) / .07)` |  |  |
| **`event-hover-tertiary`** | `color(var(--eds-page) / 1)` | `color(var(--eds-page) / 1)` |  |  |
| **`event-focus-primary`** | `color(var(--eds-brand) / 1)` | `color(var(--eds-brand) / 1)` |  |  |
| **`event-focus-secondary`** | `color(var(--eds-base) / .07)` | `color(var(--eds-base) / .1)` |  |  |
| **`event-focus-tertiary`** | `color(var(--eds-brand) / .2)` | `color(var(--eds-brand) / .2)` |  |  |

---

# 5.  变体与状态系统

## 颜色变体

| 等级 Level | Hex |
| --- | --- |
| Primary | `opacity 100%` |
| Secondary | `opacity 60%` |
| Tertiary | `opacity 40%` |
| Quaternary | `opacity 20%` |

---

## 状态颜色映射

| 状态 Status | 颜色 Color |
| --- | --- |
| Success | @类别里的“Success” |
| Warning | @类别里的“Warning” |
| Danger | @类别里的“Danger” |
| Info | @类别里的“Brand” |

---

# 6. 交互与视觉行为

- 点击 Active：@类别里的“Secondary”
- 悬浮 Hover ：`Event-“var(--event-hover-primary) 、var(--event-hover-secondary) 、var(--event-hover-tertiary) ”`
- 聚焦 Focus： `Event-“var(--event-focus-primary) 、var(--event-focus-secondary) 、var(--event-focus-tertiary) ”`

---

- 主基调：@类别里的“Primary”
- 次基调：@类别里的“Secondary”
- 注释：@类别里的“Tertiary”
- 禁用：@类别里的“Quaternary”

---

- Light 和 Dark同时为白色调：@类别里的“Same White+Level”
- Light 和 Dark同时为黑色调：@类别里的“Same Black+Level”

---

- 深卡片：`var(--material-card-deep)`
- 中等深卡片（默认）：`var(--material-card-moderate)`
- 浅卡片：`var(--material-card-shallow)`
- 微妙卡片：`var(--material-card-subtle)`

---

- 阴影：`var(--effect-shadow)`
- 微妙阴影：`var(--effect-subtle-shadow)`
- 弹窗背景：`var(--effect-popup-background)`
- 背景模糊：`var(--effect-mask)`
- 反馈卡：`var(--effect-prompt)`

---

- 模块分割线：`var(--stroke-divider-module)`
- 页面分割线：`var(--stroke-divider-page)`

---

# 7. 数据模型与逻辑

Color System 本质是 Token 架构

## Token 架构

```json
{
  "primitives": {
    "eds-xxx": {
      "light": "display-p3 r g b",
      "dark": "display-p3 r g b"
      }
    },
    "semantic": {
      "variable name": "color(var(--eds-xxx) / 1)",
    },
}
```

## 映射规则

| 颜色表 Token | 用法 Usage |
| --- | --- |
| color.eds.variable | 全局通用 |
| color.eds.tab | Tab专用 |

---

# 8. 使用规范

## 允许

- 使用 Token
- 使用语义色
- 保证饱和度 ≥ AA

## 禁止

- 不允许 Hex 直写
- 不允许随意调整透明度替代语义色
- 不允许跨语义使用（error ≠ warning）
---

# 9. 开发实现

## 技术实现

- 基色（Primitives）
    - Color System 的最小物理单元。把具体的设计数值如 `#000000`转化为平台无关的**键值对（JSON/YAML）**
    - 示例：`"eds.brand": "display-p3 r g b"`
- CSS 变量
    - Color System 的实际使用场景。在基色的基础上，使用不透明度进行拓展来拓展不同的视觉颜色
    - 示例：`"text-brand-primary": "color(var(--eds-brand) / 1)"`
- 主题提供
    - 把当前的“主题数据”（比如是`light`还是`dark`）向整个页面下属的所有组件全局广播
    - 配合 CSS 变量时，通过修改最外层 DOM 的属性（如 `<html theme="dark">`），让全站组件瞬间吃满最新的 CSS 变量色值，完成主题切换

---

## Token API

| Token | Type | Value |
| --- | --- | --- |
| primitives | string | `display-p3 r g b` |
| variables | string | `color(var(--eds-xxx) / 1)` |

---

## 主题切换

```
light → 默认配色方案
dark → 反色中性色 + 调整后的语义色
```

---

# 10. 组合与依赖关系

- 取决于: Typography, Spacing (Scale System)
    - 系统（或组件）本身不包含硬编码（Hard-coded）的数值
    - 所有文字大小、行高、内边距（Padding）和外边距（Margin），都是通过“引用（Alias / 别名）”底层已经定义好的 Typography（字体规范）和 Spacing Scale System（间距阶梯系统，如 4px、8px、12px 步进）来实现
- 适用范围: 所有组件
    - 不管是简单的 `Button`（按钮）、`Tag`（标签），还是复杂的 `Data Table`（数据表格）、Modal（弹窗），全都要强行注入并应用 Color System
- 不能在设计系统之外独立使用
    - 禁止解禁组件或手动输入任意数值

---

# 11. 无障碍

- 必须符合 WCAG AA 标准
    - 含义：产品必须达到全球公认的《网页内容可访问性指南》（WCAG）中的 AA 级（中级）认证
    - 背景：WCAG 分为 A（最低）、AA（行业通用标准/多国法律强制要求）、AAA（最高/极严）三个等级。达到 AA 级意味着应用可以合法地商业化，且对绝大多数视障或行动不便的用户友好
- 对比度 ≥ 4.5:1（普通文本）
    - 字体的颜色与背景颜色之间的亮度差，必须大于或等于 4.5 比 1
    - 检测差距 `*Stark*`或 `*A11y - Color Contrast Checker*`
- 焦点状态必须可见
    
    *当用户不用鼠标，而是用键盘的 Tab 键在页面上切换按钮、输入框时，被选中的元素必须有非常明显的聚焦外框（Focus Ring）*
    
- 切勿仅依赖颜色来传达含义
    - 绝对不能只靠红、绿、黄等颜色来区分状态。 必须同时搭配文字、图标或形状 **
    - 经典反例：表单输入错误时，输入框只变成红色，没有任何文字提示。色盲用户（如红绿色盲）完全无法分辨是否出错 **
    - 正确做法：变红的同时，加上一个 ❗️ 图标，并写上提示语 “请输入正确的邮箱地址”

---

# 12. 性能限制

- 令牌查找 O(1)
    
    设计系统中的变量（Tokens，如颜色、间距等）在被代码读取时，速度达到了理论极限快
    
- CSS 变量的运行时开销极小
    
    在浏览器运行网页时，几乎不占用浏览器的 CPU 和内存
    
- 支持对调色板子集进行树形抖动
    
    没用到的颜色，在最终打包时会被自动删掉
    

---

# 13. 边界情况

- Dark 模式背景下的文本对比度失效
- 色盲模拟不匹配
- 品牌色过度使用导致 UI 饱和度过高
- 低对比度灰色文本问题

---

# 14. 拓展性

- 支持多品牌：如（Cregis、UDun、EverGree生态产品矩阵、其他品牌）
- 支持主题扩展
- 支持语义扩展（未来状态）
- 禁止在缺乏管理规范的情况下随意新增配色方案

---

# 15. 生命周期与版本管理

## 当前版本

v1.1

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 修改 | 基色名前缀统一变更为 `eds-`” | 无 |
| v1.1 | 2026/6/25 | 修改与新增 | 新增popup基色，调整一些命名与不透明度，为特效“Glass”做准备 | 无破坏性影响 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 暂无

## 迁移指南

1. 请关注第4章节“变量映射管理”里描述