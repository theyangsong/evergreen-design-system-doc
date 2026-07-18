# 1. 定位

## **系统定义**

`Effect` 是 EverGreen Design System 的视觉材质系统，用于统一用户界面的：

- 阴影层级（Shadow Layer）
- 玻璃材质（Glass Layer）
- 背景模糊（Blur Layer）
- 复合视觉结构（Composite Layer）

## **核心本质**

Effect = “用户界面物理空间的视觉模拟系统（Material Physics Simulation）”

```
Shadow Layer（阴影层）
   ├── Deep Shadows（系统级容器）
   ├── Light Shadows（业务级容器）
   └── Subtle Shadows（结构级分割）
   ↓
Glass Layer（玻璃材质层）
   ├── Glass Box（浮层容器材质）
   └── Glass BG（组件表面材质）
   ↓
Blur Layer（背景模糊层）
   └── Blurred BG（背景模糊）
   ↓
Composite Layer（复合层）
   └── 多层效果组合
```

## **设计目标**

- 建立统一的视觉材质分层体系
- 提供可组合的材质层，而非孤立的样式
- 确保各层之间视觉协调、不冲突
- 预留拓展空间（可添加/删除模糊、玻璃、背景模糊等类）
- 支持深浅色模式下的材质自动适配

## **解决的问题**

- 阴影使用随意（深浅不一、无层级）
- 玻璃材质无统一规范（透明度、模糊值不一致）
- 多层材质叠加时视觉冲突
- 设计与开发对材质效果理解不一致
- 材质效果无法灵活组合/移除

## 使用边界

#### 可使用场景

- Modal / Dialog 系统级容器
- Card / Panel 业务级容器
- List / Table Row 结构级分割
- 浮层容器材质（Glass Box）
- 组件表面材质（Glass BG）
- 背景模糊与滚动遮罩

#### 不适用场景

- 纯色背景（不涉及材质）
- 插画 / 图形中的装饰性效果
- 非 UI 材质

## 替代方案

- 当前方案：Effect `v1.0`
- 替代方案：各自定义阴影/模糊值（无体系）
- 被替代原因：建立分层材质体系，统一视觉物理模拟

---

# 2. 设计决策与演进

## 设计原则

1. **分层系统原则**
    
    Effect 是分层材质系统，每一层有明确的职责和使用场景：
    
    | **层级** | **职责** | **使用场景** |
    | --- | --- | --- |
    | Deep Shadows | 系统级容器阴影 | Modal / Dialog |
    | Light Shadows | 业务级容器阴影 | Card / Panel |
    | Subtle Shadows | 结构级分割阴影 | List / Table Row |
    | Glass Box | 浮层容器玻璃材质 | Modal / Dropdown / Popover |
    | Glass BG | 组件表面玻璃材质 | 组件表面 |
    | Blurred BG | 背景模糊 | 滚动遮罩 / 容器背景 |
2. **材质分离原则**
    - Glass Box：用于浮层容器（Modal、Dropdown、Popover）
    - Glass BG：用于组件表面材质（Card、Button、Input）
    - 两者不可混用、不可互换
    - Glass BG 不与任何阴影层级混合使用
3. **组合优先原则**
    - 效果允许组合使用，也支持独立使用
    - 预留拓展空间：可添加/删除模糊、玻璃、背景模糊等类
    - 必须有 surface base（背景色）和 radius（圆角）

## 设计权衡

- **分层系统 vs 单一 Token → 分层系统**
    - 分层系统：各层独立，组合灵活，材质表现丰富
    - 单一 Token：所有效果用一个 Token 控制，灵活性不足
    - 结论：选择分层系统
- **Glass Box 与 Glass BG 分离 → 强制分离**
    - 分离：浮层材质与表面材质独立，视觉层次清晰
    - 混合：两者混用导致材质错位
    - 结论：强制分离，杜绝混用
- **阴影与边框共存规则 → 仅 Subtle Shadow 允许边框**
    - Deep / Light Shadow：禁止 border
    - Subtle Shadow：唯一允许与 border 共存
    - 结论：按层级区分规则

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：分散样式** | 各自定义阴影/模糊 | 值不统一，无层级概念 |
| **阶段二：Token 化** | 统一 Shadow Token | 缺少分层体系，材质单一 |
| **阶段三：材质分层（v1.0）** | Shadow + Glass + Blur 分层系统 | 当前版本，统一、可控 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM & 运营 & 外部协作方、Dev（前端/后端）。

## UED

#### **须交付的设计资产**

| **资产** | **格式** | **说明** |
| --- | --- | --- |
| **材质分层示意图** | Figma / 文档 | Shadow / Glass / Blur 的视觉对比 |
| **阴影层级规范** | Figma 变体 | Deep / Light / Subtle 三种阴影 |
| **玻璃材质规范** | Figma 变体 | Glass Box（浮层）与 Glass BG（表面） |
| **复合材质示例** | Figma / 文档 | 组合使用场景示例 |
| **深浅色模式适配** | Figma 变体 | 深色/浅色模式下材质的自动适配 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 资产示意图（材质分层、阴影层级、玻璃材质）      |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Shadow / Glass / Blur 分层架构、三种阴影层级、两种玻璃材质
```

#### **详细交付指南**

1. **阴影层级规范**
    
    
    | **层级** | **用途** | **使用场景** |
    | --- | --- | --- |
    | **Deep Shadows** | 系统级容器 | 容器 |
    | **Light Shadows** | 业务级容器 | Box阴影 |
    | **Subtle Shadows** | 结构级分割 | List / Table Row |
    
    **Deep Shadows：**
    
    - 特效不用于业务。使用该特效时：
        - 正确：添加背景色
        - 正确：添加圆角
        - 错误：添加边框
        - 可调节参数：圆角
    - 详细属性
    
    ```css
    box-shadow:
      1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
      -1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
      0 0 0 0.5px var(--effect-vulvar-shadow-glow),
      0 var(--scale-6) var(--scale-20) 0 var(--effect-vulvar-shadow),
      0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
    backdrop-filter: blur(calc(var(--scale-20) / 2));
    ```
    
    **Deep Shadows：**
    
    - 业务大面积使用，建议配合Glass Box叠层。也可以单独使用（不建议）。使用该特效时：
        - 正确：添加背景色
        - 正确：添加圆角
        - 错误：添加边框
        - 可调节参数：圆角
    - 详细属性
    
    ```css
    box-shadow: 
      1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
      -1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
      0 0 0 0.5px var(--effect-vulvar-shadow-glow),
      0 var(--scale-2) var(--scale-6) 0 var(--effect-vulvar-shadow);
    ```
    
    **Subtle Shadows：**
    
    - 视觉弱化，用于模块、大卡片等。使用该特效时：
        - 正确：添加背景色
        - 正确：添加圆角
        - 正确：添加边框，唯一绑定 `border: var(--stroke-xs) solid var(--stroke-outline-subtle);`
        - 可调节参数：圆角
    - 详细属性
    
    ```css
    box-shadow: 0 var(--scale-1.5) var(--scale-4) 0 var(--effect-vulvar-shadow-subtle);
    ```
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 阴影层级示例图（Deep / Light / Subtle）   |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：三种阴影层级的视觉深度对比
    ```
    
2. **玻璃材质规范**
    
    Glass 分为两个独立层级，两者为平行关系，各自独立使用：
    
    | **层级** | **用途** | **使用场景** |
    | --- | --- | --- |
    | **Glass Box** | 浮层玻璃 | Modal / Dropdown / Popover |
    | **Glass BG** | 组件表面 | Card / Button / Input 表面 |
    
    > **关于 Glass Box 与阴影的关系**：
    > 
    > - Glass Box 视觉上本身已包含内阴影、边框、玻璃质感等完整效果
    > - Light Shadows 是 Glass Box 的标准叠层组合，属于推荐用法
    > - Glass Box 不与 Deep Shadows、额外 border、额外内阴影等其他效果混合
    
    **Glass Box：**
    
    - 与 Light Shadows 叠层使用。使用该特效时：
        - 正确：用于材质表面
        - 错误：与阴影混合使用
        - 可调节参数：圆角
    - 详细属性
        
        ```css
        box-shadow:
          0 40px 10px -40px var(--effect-inner-shadow) inset,
          0 -40px 10px -40px var(--effect-inner-shadow) inset,
          0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
        液态玻璃（实现参考）:
          https://github.com/shuding/liquid-glass
          https://github.com/rdev/liquid-glass-react（备）
          ;
        ```
        
    
    **Glass BG：**
    
    - 用于组件表面等。使用该特效时：
        - 正确：用于材质表面
        - 错误：与阴影混合使用
        - 可调节参数：圆角
    - 详细属性
        
        ```css
        box-shadow:
          0 40px 10px -40px var(--effect-inner-shadow) inset,
          0 -40px 10px -40px var(--effect-inner-shadow) inset,
          0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
        液态玻璃（实现参考）:
          https://github.com/shuding/liquid-glass
          https://github.com/rdev/liquid-glass-react（备）
          ;
        ```
        
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 Glass Box vs Glass BG 对比图              |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：Glass Box（浮层容器）与 Glass BG（组件表面）的视觉差异
    ```
    
3. **背景模糊规范**
    
    
    | **层级** | **用途** | **使用场景** |
    | --- | --- | --- |
    | **Blurred BG** | 背景模糊 | 容器，滚动遮罩 |
    
    **Blurred BG：**
    
    - 使用该特效时：
        - 正确：添加背景色
        - 正确：添加圆角
        - 正确：添加边框
        - 可调节参数：圆角
    - 详细属性
        - `backdrop-filter: saturate(360%) blur(50px);`
        
4. **复合材质规范**
    
    常见组合方式：
    
    | **组合场景** | **组成** | **示例** |
    | --- | --- | --- |
    | **模态弹窗** | Glass Box + Light Shadows | Modal / Dialog |
    | **玻璃卡片** | Glass Box + Light Shadows | Card / Panel |
    | **玻璃菜单** | Glass Box + Light Shadows | Dropdown / Popover |
    | **列表行** | Subtle Shadow + border | List Item / Table Row |
    | **组件表面** | Glass BG | Button / Input 表面 |
    | **背景模糊容器** | Blurred BG | 滚动遮罩 / 容器背景 |
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 复合材质示例图                            |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：模态弹窗、玻璃卡片、玻璃菜单、列表行的复合材质示意
    ```
    

> ✅ 允许：使用分层材质系统、设计复合材质组合、标注可调参数
✅ 允许：预留拓展空间（添加/删除模糊、玻璃、背景模糊等类）
> 
> 
> ❌禁止：Deep / Light Shadow 添加边框
> ❌ 禁止：Glass Box 与 Light Shadows 之外的额外效果混合
> 
> ❌ 禁止：Glass BG 与任何阴影层级混合使用
> 

## PM & Others

#### **须理解的内容**

| **条目** | **说明** | **示例** |
| --- | --- | --- |
| **材质层级概念** | Effect 是分层材质系统 | “Modal 使用 Deep Shadow” |
| **阴影层级** | 三种阴影层级对应不同场景 | “Card 使用 Light Shadow” |
| **玻璃分层** | Glass Box（浮层）与 Glass BG（表面）分离 | “Dropdown 使用 Glass Box” |
| **标准组合** | Glass Box + Light Shadows 是推荐组合 | “玻璃卡片 = Glass Box + Light Shadows” |
| **可调参数** | 每层均有可调参数（主要为圆角） | “圆角可调” |

#### **理解材质层级的业务含义**

| **业务场景** | **材质组合** |
| --- | --- |
| 模态弹窗 | Glass Box + Light Shadows |
| 卡片内容 | Glass Box + Light Shadows |
| 下拉菜单 | Glass Box + Light Shadows |
| 列表行分割 | Subtle Shadow + border |
| 组件表面 | Glass BG |
| 背景模糊 | Blurred BG |

## Dev

#### **令牌结构**

```css
/**
 * Do not edit directly, this file was auto-generated from Figma tokens.
 * Effect System — base tokens (阴影 / 玻璃 / 模糊).
 * Source: spec/effect/base.json
 */

:root {

  /* ========================================
     阴影系统（Shadow System）
     ======================================== */

/* Deep Shadows（系统级）—— Modal / Dialog */
  --effect-deep-shadow: 
    1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
    -1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
    0 0 0 0.5px var(--effect-vulvar-shadow-glow),
    0 var(--scale-6) var(--scale-20) 0 var(--effect-vulvar-shadow),
    0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
     /* 容器使用，该特效不用于业务。使用该特效时：
        1、正确：添加背景色
        2、正确：添加圆角
        3、错误：添加边框
        4、可调节参数：圆角、阴影颜色、阴影大小、阴影模糊度、阴影偏移量 */

  /* Light Shadows（业务级）—— Card / Panel */
  --effect-light-shadow: 
    1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
    -1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow),
    0 0 0 0.5px var(--effect-vulvar-shadow-glow),
    0 var(--scale-2) var(--scale-6) 0 var(--effect-vulvar-shadow);
     /* Box阴影，业务大面积使用，建议配合Glass Box叠层。也可以单独使用（不建议）。使用该特效时：
        1、正确：添加背景色
        2、正确：添加圆角
        3、错误：添加边框
        4、可调节参数：圆角 */

  /* Subtle Shadows（结构级）—— List / Table Row */
  --effect-subtle-shadow: 0 var(--scale-1-5) var(--scale-4) 0 var(--effect-vulvar-shadow-subtle);
    /* 极浅阴影，视觉弱化，用于模块、大卡片等。使用该特效时：
        1、正确：添加背景色
        2、正确：添加圆角
        3、正确：添加边框，唯一绑定 border: var(--stroke-xs) solid var(--stroke-outline-subtle);
        4、可调节参数：圆角 */

 /* Molde Shadows（模块层级）—— Molde */
  --effect-molde-shadow: box-shadow: -2px 0 var(--scale-4) 0 var(--effect-vulvar-shadow-subtle);
  /* 用于模块左弱阴影。使用该特效时：
        1、直接添加 */

  /* ========================================
     玻璃材质系统（Glass System）
     ======================================== */

  /* Glass Box（浮层容器）—— Modal / Dropdown / Popover */
  --effect-glass-box: 
    0 40px 10px -40px var(--effect-inner-shadow) inset,
    0 -40px 10px -40px var(--effect-inner-shadow) inset,
    0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
  /* 使用液态玻璃实现
   * 参考：https://github.com/shuding/liquid-glass（MIT © Shu Ding）
   * ① Canvas 按 rounded-rect SDF 生成 displacement map（按元素尺寸动态计算）
   * ② 注入 SVG <filter>：feImage + feDisplacementMap（x→R, y→G）
   * ③ backdrop-filter: url(#filter) blur() contrast() brightness() saturate()
   * ④ CSS 变量：effect/liquid-glass.css → --effect-glass-bg-* / --effect-glass-bg-surface
   * ⑤ JS 入口：import { initLiquidGlass } from '@evergreen/tokens/liquid-glass'
   * ⑥ 语义类：.effect-glass-bg（init 前 fallback → --effect-glass-bg-fallback）
   * ⑦ 用于 Card / Button / Input 表面；不与 shadow 层级混用
   */
    /* 注释源文件在 spec/effect/base.json 的 implementationNotes 字段；effect/liquid-glass.css 顶部也补充了简要实现说明。重新构建后会同步到 dist/。 */
    /* Box玻璃，与Light Shadows叠层使用。使用该特效时：
        1、正确：独立的玻璃层
        2、正确：与阴影绑定
        3、错误：单独使用
        4、可调节参数：圆角 */

  /*（组件表面）—— Card / Button / Input */
  --glass-bg:
  /* 使用液态玻璃实现
   * 参考：https://github.com/shuding/liquid-glass（MIT © Shu Ding）
   * ① Canvas 按 rounded-rect SDF 生成 displacement map（按元素尺寸动态计算）
   * ② 注入 SVG <filter>：feImage + feDisplacementMap（x→R, y→G）
   * ③ backdrop-filter: url(#filter) blur() contrast() brightness() saturate()
   * ④ CSS 变量：effect/liquid-glass.css → --effect-glass-bg-* / --effect-glass-bg-surface
   * ⑤ JS 入口：import { initLiquidGlass } from '@evergreen/tokens/liquid-glass'
   * ⑥ 语义类：.effect-glass-bg（init 前 fallback → --effect-glass-bg-fallback）
   * ⑦ 用于 Card / Button / Input 表面；不与 shadow 层级混用
   */
    /* 注释源文件在 spec/effect/base.json 的 implementationNotes 字段；effect/liquid-glass.css 顶部也补充了简要实现说明。重新构建后会同步到 dist/。 */
    /* Box玻璃，与Light Shadows叠层使用。使用该特效时：
        1、正确：独立的玻璃层
        2、正确：与阴影绑定
        3、错误：单独使用
        4、可调节参数：圆角 */

  /* ========================================
     背景模糊系统（Blur System）
     ======================================== */

  /* Blurred BG —— 背景模糊 / 滚动遮罩 */
  --effect-blur-bg: saturate(360%) blur(50px);

}

```

#### **语义角色 CSS 类**

```css
/**
 * Do not edit directly, this file was auto-generated from Figma tokens.
 * Effect System — semantic classes (语义效果类).
 * Source: spec/effect/semantic.json
 */

/* ========================================
   组合应用（Composite Applications）
   ======================================== */

/* Flotation Box */
.effect-flotation-box {
  position: relative;
  border-radius: var(--scale-3);
  background: linear-gradient(0deg, var(--material-same-white-quaternary) 0%, var(--material-same-white-quaternary) 100%), var(--effect-flotation-box);
  background-blend-mode: normal, luminosity;
  box-shadow: var(--effect-shadow-light);
  backdrop-filter: var(--effect-glass-bg-fallback);
  -webkit-backdrop-filter: var(--effect-glass-bg-fallback);
  isolation: isolate;
  /* 组成：Glass + Inner Shadow + Fill + Shadow */
  /* initLiquidGlass() 启用液态玻璃 */
}

.effect-flotation-box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--effect-glass-box);
  pointer-events: none;
}

/* Popup Box */
.effect-popup-box {
  position: relative;
  border-radius: var(--scale-4);
  background: linear-gradient(0deg, var(--box-flotation) 0%, var(--box-flotation) 100%), var(--effect-flotation-box);
  background-blend-mode: normal, luminosity;
  box-shadow: var(--effect-shadow-light);
  backdrop-filter: var(--effect-glass-bg-fallback);
  -webkit-backdrop-filter: var(--effect-glass-bg-fallback);
  isolation: isolate;
  /* 组成：Glass + Inner Shadow（scale-3）+ Fill + Shadow（scale-4） */
  /* initLiquidGlass() 启用液态玻璃 */
}

.effect-popup-box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--effect-glass-box);
  pointer-events: none;
}

/* Subtle Card */
.effect-subtle-card {
  border-radius: var(--scale-3);
  border: var(--stroke-xs) solid var(--stroke-outline-subtle);
  background: var(--box-page);
  box-shadow: var(--effect-shadow-subtle);
  /* 组成：Fill + Border + Shadow */
}
/* Molde Card */
.effect-molde-level {
  box-shadow: -2px 0 var(--scale-4) 0 var(--effect-vulvar-shadow-subtle);
  /* 组成：Shadow */
}

/* ========================================
   拓展类（后续可添加类）
   ======================================== */

/* 拓展类：添加项 */
.add-item {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
```

#### **Vue 组件使用示例**

```html
<template>
  <!-- 模态弹窗 = Glass Box + Light Shadows -->
  <div class="effect-glass-modal">
    <h2>弹窗标题</h2>
    <p>弹窗内容</p>
  </div>

  <!-- 玻璃卡片 = Glass Box + Light Shadows -->
  <div class="effect-glass-card">
    <h3>卡片标题</h3>
    <p>卡片内容</p>
  </div>

  <!-- 列表行（Subtle Shadow） -->
  <div class="effect-shadow-subtle">
    <span>列表项</span>
  </div>

  <!-- 组件表面（Glass BG） -->
  <button class="effect-glass-bg">
    玻璃按钮
  </button>

  <!-- 背景模糊容器 -->
  <div class="effect-blur-bg">
    <span>模糊背景内容</span>
  </div>

  <!-- 拓展：移除某个效果 -->
  <div class="effect-glass-card no-shadow">
    <!-- 移除阴影，保留玻璃 -->
  </div>
</template>
```

#### **使用原则**

- **分层使用**：每层有明确职责，不可混用
- **标准组合**：Glass Box + Light Shadows 是推荐组合
- **Glass BG 独立**：Glass BG 不与任何阴影层级混合
- **必须有 surface base**：所有效果必须有背景色
- **必须有 radius**：所有效果必须有圆角
- **拓展灵活**：支持添加/删除模糊、玻璃、阴影等类

> ✅ 允许：使用语义类（`.effect-shadow-deep` / `.effect-glass-box`）
> 
> 
> ✅ 允许：使用 CSS 变量（`var(--effect-shadow-light)`）
> 
> ✅ 允许：使用拓展类（`.no-shadow` / `.add-blur-bg`）
> 
> ❌ 禁止：Deep / Light Shadow 添加 border
> 
> ❌ 禁止：Glass Box 与 Light Shadows 之外的额外效果混合
> 
> ❌ 禁止：Glass BG 与任何阴影层级混合使用
> 

---

# 4. **结构拆解**

| **层级** | **组件** | **职责** |
| --- | --- | --- |
| Shadow Layer | Deep / Light / Subtle | 空间深度与层级分离 |
| Glass Layer | Glass Box / Glass BG | 玻璃材质（浮层/表面） |
| Blur Layer | Blurred BG | 背景模糊 |
| Composite Layer | 多层组合 | 标准组合（Glass Box + Light Shadows） |
| Utility Layer | 拓展类 | 添加/删除效果 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 结构拆解图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Effect 五层结构拆解
```

---

# 5.  变体与状态系统

Effect 是静态令牌体系，不涉及动态状态变化

---

# 6. 交互与视觉行为

Effect 是静态令牌体系，不涉及动态交互行为

---

# 7. 数据模型与逻辑

## **Effect 领域特定语言示例（Effect DSL Example）**

```json
{
  "effect": {
    "shadow": "light",
    "glass": "box",
    "blur": true,
    "radius": "md"
  }
}
```

## **映射规则**

| **字段** | **值** | **解析** |
| --- | --- | --- |
| `shadow` | `deep` / `light` / `subtle` | 应用对应阴影层级 |
| `glass` | `box` / `bg` | 应用对应玻璃材质 |
| `blur` | `true` / `false` | 是否应用背景模糊 |
| `radius` | `sm` / `md` / `lg` / `full` | 圆角值，引用 Scale System |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 数据模型映射示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Effect DSL → 令牌 → CSS 变量的解析路径
```

---

# 8. 使用规范

- Glass Box + Light Shadows 是**唯一推荐的玻璃与阴影组合**
- Glass Box 不与 Light Shadows 之外的额外效果混合
- Glass BG 不与任何阴影层级混合使用

## 允许

1. **阴影**：Deep / Light 必须配合 background + radius，禁止 border；Subtle 是唯一允许与 border 共存的阴影层级。
2. **玻璃**：Glass Box 必须与 Light Shadows 叠层使用；Glass BG 独立用于表面材质，不混任何阴影。
3. **背景模糊**：必须配合 background + radius，允许 border。
4. **组合**：Glass Box + Light Shadows 是唯一推荐的玻璃与阴影组合。
5. **拓展**：支持通过 `no-*` / `add-*` 类灵活添加或移除效果。
6. **适配**：支持深浅色模式自动适配和减少动效降级。

## 禁止

| **序号** | **禁止行为** | **原因** |
| --- | --- | --- |
| 1 | ❌ Deep / Light Shadow 添加边框 | 破坏阴影层级纯净度 |
| 2 | ❌ Glass Box 与 Light Shadows 之外的额外效果混合 | 视觉效果冲突 |
| 3 | ❌ Glass BG 与任何阴影层级混合使用 | 材质污染 |
| 4 | ❌ Glass BG 作为组件容器 | 仅用于表面材质 |
|  |  |  |

## 约束

| **约束项** | **限制** |
| --- | --- |
| 玻璃嵌套层级 | ≤ 1 层 |
| 阴影叠加 | ≤ 2 层 |
| 模糊值 | 50px（性能考虑） |
| Deep / Light Shadow | ❌ 禁止 border |
| Subtle Shadow | ✔ 唯一允许 border |
| Glass Box | 必须与 Light Shadows 叠层 |
| Glass BG | ❌ 禁止与任何阴影层级混合 |

---

# 9. 开发实现

## **技术栈**

- 框架：Vue 3 / React
- 样式：CSS 变量 + SCSS
- 液态玻璃：参考 shuding/liquid-glass

## **架构**

```
Effect 领域特定语言（Effect DSL）
    ↓
设计令牌生成器（Design Token Generator）
    ↓
CSS 变量（主题层）
    ↓
语义类（Semantic Classes）+ 拓展类（Utility Classes）
    ↓
组件消费（Component Consumption）
```

## **性能策略**

- **模糊优化**：`blur(50px)` 为建议值
- **玻璃嵌套**：禁止超过 1 层嵌套
- **阴影叠加**：不超过 2 层
- **拓展类**：按需添加/删除效果，避免冗余

---

# 10. 组合与依赖关系

## **依赖项**

- **Color System**：提供阴影颜色变量
- **Scale System** ：提供圆角值（`-radius-*`）和间距值（`-scale-*`）
- **Stroke System**：提供边框值（`-stroke-xs`）

## **被依赖项**

- **数据表格系统（Data Table System）**
- **批处理栏（BatchBar）**
- **所有用户界面组件**

## 组合

- **允许**：Shadow + Glass + Blur 按标准组合使用
- **禁止**：Glass Box 与 Light Shadows 之外的额外效果混合
- **禁止**：Glass BG 与任何阴影层级混合

### Menu Box

**Flotation Box**

```css
Glass + Inner Shadow
border-radius: var(--scale-3);
/* Glass Box */
box-shadow: 0 40px 10px -40px var(--effect-inner-shadow) inset, 0 -40px 10px -40px var(--effect-inner-shadow) inset, 0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
液态玻璃：
https://github.com/shuding/liquid-glass
https://github.com/rdev/liquid-glass-react（备）

Fill + Shadow
border-radius: var(--scale-3);
background: linear-gradient(0deg, var(--material-same-white-quaternary) 0%, var(--material-same-white-quaternary) 100%), var(--effect-flotation-box);
background-blend-mode: normal, luminosity;
/* Light Shadows */
box-shadow: 1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow), -1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow), 0 0 0 0.5px var(--effect-vulvar-shadow-glow), 0 var(--scale-2) var(--scale-6) 0 var(--effect-vulvar-shadow);
```

**Popup Box**

```css
Glass + Inner Shadow
border-radius: var(--scale-3);
/* Glass Box */
box-shadow: 0 40px 10px -40px var(--effect-inner-shadow) inset, 0 -40px 10px -40px var(--effect-inner-shadow) inset, 0 0 0 0.5px var(--effect-inner-shadow-glow) inset;
液态玻璃：
https://github.com/shuding/liquid-glass
https://github.com/rdev/liquid-glass-react（备）

Fill + Shadow
border-radius: var(--scale-4);
background: linear-gradient(0deg, var(--box-flotation) 0%, var(--box-flotation) 100%), var(--effect-flotation-box);
background-blend-mode: normal, luminosity;
/* Light Shadows */
box-shadow: 1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow), -1.25px 0 0 -0.75px var(--effect-vulvar-shadow-glow), 0 0 0 0.5px var(--effect-vulvar-shadow-glow), 0 var(--scale-2) var(--scale-6) 0 var(--effect-vulvar-shadow);
```

### Subtle Card

```css
border-radius: var(--scale-3);
border: var(--stroke-xs) solid var(--stroke-outline-subtle);
background: var(--box-page);
/* Subtle Shadows */
box-shadow: 0 var(--scale-1.5) var(--scale-0.75) 0 var(--effect-subtle-shadow);
```

---

# 11. 无障碍

| **要求** | **实现方式** |
| --- | --- |
| **减少动效支持** | 使用 `@media (prefers-reduced-motion: reduce)` 降级 |
| **对比度保障** | 玻璃材质下文字需保证 ≥ 4.5:1 对比度 |

---

# 12. 性能限制

| **指标** | **限制** | **备注** |
| --- | --- | --- |
| 模糊最大值 | 50px | 超过建议值需性能评估 |
| 玻璃嵌套层级 | ≤ 1 层 | `backdrop-filter` 深层嵌套消耗高 |
| 阴影叠加 | ≤ 2 层 | 避免渲染开销过大 |

---

# 13. 边界情况

| **场景** | **处理方式** |
| --- | --- |
| **模糊 + 滚动性能问题** | 使用 `will-change: transform` 或限制模糊范围 |
| **Glass Box 嵌套爆炸** | 限制嵌套 ≤ 1 层 |
| **阴影 + 玻璃叠层过重** | 仅使用标准组合（Glass Box + Light Shadows） |
| **移动端性能降级** | 低端设备可移除 `backdrop-filter`，使用 `@media (prefers-reduced-motion: reduce)` 降级 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 边界情况处理示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：性能优化、嵌套限制、移动端降级策略
```

---

# 14. 拓展性

| **扩展点** | **方式** | **说明** |
| --- | --- | --- |
| **添加/删除效果** | 拓展类（`.no-shadow` / `.add-blur-bg`） | 灵活组合效果 |
| **主题玻璃强度** | 主题层覆盖变量 | 品牌定制 |
| **减少动效回退** | CSS 媒体查询降级 | 用户偏好减少动效 |
| **深浅色材质调优** | 主题层分别定义浅色/深色材质值 | 支持深浅色模式适配 |

**限制**：禁止在组件层覆盖 Effect 令牌；所有扩展在主题层进行

---

# 15. 生命周期与版本管理

## 当前版本

v1.0

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 修改 | 初始版本，建立 Shadow + Glass + Blur 分层材质系统 | 无 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 暂无

## 迁移指南

1. 识别所有自定义阴影值，映射到对应 Shadow 层级
2. 区分 Glass Box 和 Glass BG 的使用场景
3. 检查 Deep / Light Shadow 上的 border（如有，移除）
4. 确保 Glass Box 仅与 Light Shadows 组合使用
5. 确保 Glass BG 不与任何阴影层级混合
6. 使用拓展类灵活添加/删除效果

## **最终系统总结（非常关键）**

```
Shadow Layer（阴影层）
   ├── Deep Shadows（系统级）：Modal / Dialog
   ├── Light Shadows（业务级）：Card / Panel
   └── Subtle Shadows（结构级）：List / Table Row
   ↓
Glass Layer（玻璃材质层）
   ├── Glass Box（浮层容器）：与 Light Shadows 叠层（标准组合）
   └── Glass BG（组件表面）：不与任何阴影层级混合
   ↓
Blur Layer（背景模糊层）
   └── Blurred BG：背景模糊 / 滚动遮罩
   ↓
Utility Layer（拓展层）
   ├── 移除效果：no-blur / no-glass / no-shadow
   └── 添加效果：add-blur-bg / add-glass / add-shadow-light
   ↓
组件系统（Component System）

```