# 预览

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组件能力全景示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：标注了模块导航、用户入口、布局控制、DIN 交互、Overflow Mask 等能力位置
```

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 布局状态对比图（折叠 / 展开）             |
|                                                      |
|                                                      |
-------------------------------------------------------
图：折叠态（72px）与展开态（210px）的视觉对比
```

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 响应式断点示意图（≥1250px / <1250px）    |
|                                                      |
|                                                      |
-------------------------------------------------------
图：1250px 断点处展开/禁用的切换逻辑
```

# AI总结

```
-------------------------------------------------------
| 1、NavBar 是应用级主导航：模块切换、用户入口、DIN、布局
|    展开/收起，由权限 + 状态矩阵 + 布局引擎驱动。
| 2、使用：按权限配置模块；点击模块展开 Module Menu；折叠
|    72px / 展开 210px，1250px 断点切换策略。
| 3、可配置：模块与权限映射、DIN/通知、Overflow Mask、
|    Header 区域内容。
| 4、联动：NavBar 折叠 → Module Menu 240px；展开 → 280px。
| 5、注意：应用级导航归 NavBar；页内二级菜单归 Module Menu。
-------------------------------------------------------
```

# 1. 定位

`NavBar` 是 EverGreen Design System 的权限驱动 + 状态驱动 + 布局驱动的导航运行系统，用于：

- 应用模块导航
- 用户/组织入口
- 动态布局控制（展开 / 收起）
- 通知与 DIN 状态交互
- 模块权限驱动可见性控制

## **核心本质**

NavBar = “权限系统（Permission System）→ 状态矩阵系统（State Matrix System）→ 布局引擎（Layout Engine）三层驱动的导航运行时系统”

```
权限系统（Permission System）
   ↓
状态矩阵系统（State Matrix System）
   ↓
布局引擎（Layout Engine，展开/收起）
   ↓
模块运行时层（Module Runtime Layer）
   ↓
溢出层 / DIN 交互层（Overflow / DIN Interaction Layer）
```

**关于状态矩阵系统（State Matrix System）：**

状态矩阵系统是 NavBar 内部的一个抽象概念层，负责管理所有状态与对应行为的映射关系。它接收来自权限系统、布局状态、响应式状态、DIN 交互状态等多个维度的输入，经过组合判断后，输出一个确定的“最终状态”，交由布局引擎执行渲染。

其核心价值在于：将 NavBar 的复杂度从“分散的 if-else 条件判断”收敛为“统一的状态组合决策表”，确保 UI 行为在任何状态组合下都可预测、可追溯。

| **状态维度** | **可能的值** |
| --- | --- |
| 布局状态 | `collapsed`（折叠）/ `expanded`（展开） |
| 权限状态 | `hasPermission`（有权限模块）/ `empty`（无权限模块） |
| 溢出状态 | `normal`（正常）/ `overflow`（溢出） |
| 响应式状态 | `≥1250px`（可展开）/ `<1250px`（禁止展开） |
| DIN 交互状态 | `idle`（默认）/ `hover`（悬浮激活） |

## 设计目标

- 支持模块级权限控制
- 支持动态布局（展开/收起）
- 支持响应式约束（<1250px 禁止展开）
- 支持 DIN hover 交互体系
- 支持溢出遮罩（Overflow Mask）机制
- 支持多语言与企业级多租户场景

## 解决的问题

- 模块权限与 UI 脱节（无权限模块仍占位）
- 布局状态不可控（展开/收起由样式硬编码）
- 响应式缺失（小屏幕导航溢出或错位）
- 无权限状态无统一处理方案
- DIN（应用内通知）交互与导航状态冲突
- 模块溢出无视觉提示

## 使用边界

### **可使用场景**

- SaaS 主导航系统
- Admin / ERP / CRM 后台
- 企业级应用外壳（Application Shell）

### **不适用场景**

- 页面内 Tab 导航
- 临时局部导航
- 表单步骤导航（Form Stepper）

---

# 2. 设计决策与演进

## 设计原则

1. **权限优先渲染**
    
    有对应模块的查看权限 → 显示模块入口；无权限 → 该模块入口不显示（无占位、无灰显、无提示）
    
2. **布局-状态耦合**
    
    布局变化由状态驱动，而不是样式控制。展开/收起是状态，不是 CSS 类切换。布局状态影响二级菜单、头像方向等
    
3. **空状态是合法状态**
    
    无任何权限模块时，导航仅显示系统级入口（Logo、用户头像、退出等），这是合法的 UI 状态，不是错误
    

## 设计权衡

- **权限驱动 vs 静态配置 → 权限驱动（企业级灵活性）**
    - 权限驱动：模块可见性由权限系统实时决定，支持动态增减
    - 静态配置：模块写死，权限变化需重新部署
    - 结论：选择权限驱动，满足企业级多租户场景
- **展开宽度 210px vs 240px → 210px（平衡信息密度与空间占用）**
    - 210px：足够显示模块名称和图标，不挤压主内容区
    - 240px：信息更充裕但占用更多空间
    - 结论：选择 210px，平衡信息密度与空间效率
- **响应式断点 1250px vs 1200px → 1250px（预留安全边界）**
    - 1250px：给展开态导航 + 主内容区留出足够空间，避免内容挤压
    - 1200px：更激进的断点，但可能导致内容区过窄
    - 结论：选择 1250px，保证主内容区可读性

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：布局引擎** | 展开/收起状态驱动 | 响应式缺失，无溢出处理 |
| **阶段二：当前版本** | 权限 + 状态 + 布局 + DIN + Overflow | 统一、可控、企业级 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM and Others、DEV（前端/后端）。

## UED

#### **须交付的设计资产**

| **资产** | **格式** | **说明** |
| --- | --- | --- |
| **布局状态变体** | Figma 变体 | 折叠态（72px）与展开态（210px）的视觉样式 |
| **响应式断点规范** | 设计稿 | 1250px 断点处展开/禁用的交互说明 |
| **DIN 交互状态** | Figma 变体 | 默认/悬浮 DIN 的视觉变化（徽章隐藏、操作显示） |
| **Overflow Mask 样式** | 设计稿 | 溢出时的渐变遮罩 + 分割线样式 |
| **头像方向变体** | Figma 变体 | 折叠态（垂直）与展开态（水平）的头像布局 |
| **二级菜单宽度** | 设计规范 | 折叠态 240px / 展开态 280px |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 资产示意图（布局变体、DIN 状态、Overflow Mask） |
|                                                      |
|                                                      |
-------------------------------------------------------
图：折叠/展开、DIN 交互、Overflow Mask 的视觉规范
```

#### **详细交付指南**

1. **布局状态变体**
    
    
    | **状态** | **NavBar 宽度** | **模块图标** | **模块名称** | **头像方向** | **Module Menu 宽度** |
    | --- | --- | --- | --- | --- | --- |
    | **折叠态（Collapsed）** | ~72px | 显示 | 显示 | 垂直 | 240px |
    | **展开态（Expanded）** | 210px | 显示 | 显示 | 水平 | 280px |
2. **折叠态文本换行规则**
    - 折叠态下，模块名称文本若超出容器宽度（72px - 16「左右`padding=8`」内），应**自动换行**，而非截断或省略
    - 若模块名称过长（如超过 2 行），使用省略，鼠标悬浮时，使用`ToolTip` 展示完整名称
3. **展开态文本换行规则**
    - 展开态下，模块名称文本若超出容器宽度（210px 内），应**自动换行**，而非截断或省略
    - 每行名称保持完整，确保可读性
    - 若模块名称过长（如超过 2 行），建议产品侧缩短名称，以保持导航整洁
4. **响应式约束**
    - 断点：1250px
    - 规则：当视口宽度 < 1250px 时，禁止展开（展开按钮不可用或忽略点击）
    - 视觉反馈：展开按钮置灰或显示禁用态 `ToolTip`（如“窗口宽度不足，无法展开”）
5. **权限空状态**
    - 有对应模块的查看权限 → 显示模块入口；无权限 → 该模块入口不显示（无占位、无灰显、无提示）
    - 无任何模块权限时，导航仅显示系统级入口（Logo、用户头像、退出等），这是合法的 UI 状态
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 权限空状态示意图                          |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：无权限模块时仅显示系统导航（Logo + 用户头像）
    ```
    
6. **DIN 交互状态**
    
    
    | **状态** | **行为** |
    | --- | --- |
    | **默认** | 显示消息徽章（`Badge`） |
    | **悬浮（Hover）** | 隐藏消息徽章，显示 DIN 操作按钮。若模块无未读通知，悬浮不触发任何变化，保持默认状态。 |
7. **Overflow Mask 遮罩**
    
    当模块数量超出导航容器高度时：
    
    - 模块导航区域底部应用遮罩（`var(--effect-mask)`）
    - 上/下侧显示分割线（`1px solid var(--stroke-divider-module)`）
    - 背景色添加全局背景模糊  （`backdrop-filter: saturate(360%) blur(50px);`）
    - 遮罩与底部的 CorpSwitch / Avatar 区域自然衔接，**不覆盖这些固定元素**

> ✅ 允许：设计折叠/展开两种布局变体、DIN 交互状态、Overflow Mask 样式
> 
> 
> ❌ 禁止：设计静态导航（无权限驱动）、无响应式断点、无空权限状态
> 

## PM and Others

#### **须定义的内容清单**

| **条目** | **说明** | **示例** |
| --- | --- | --- |
| **模块权限映射** | 哪些角色/用户可看到哪些模块（由权限系统提供） | `role: admin → modules: [crm, order, user]` |
| **DIN 通知来源** | 通知数据来源 | `Notification Service` |
| **多商户配置** | 企业切换逻辑 | `CorpSwitch` 组件配置 |

#### **详细交付指南**

1. 定义模块权限映射：明确哪些角色/用户可看到哪些模块（由权限系统提供，前端仅消费权限列表，无需定义矩阵）
2. 定义 DIN 通知来源：明确通知数据来自哪个服务，以及如何与模块关联
3. 定义多商户配置：明确企业切换逻辑和可用企业列表

> 有对应模块的查看权限 → 显示模块入口；无权限 → 该模块入口不显示（无占位、无灰显、无提示）
> 

> ✅ **允许**：定义模块权限映射、DIN 通知来源、多商户配置
> 
> 
> ❌ **禁止**：要求前端写死模块列表、忽略响应式约束
> 

## DEV

- **核心架构**
    
    ```
    权限系统（Permission System）
       ↓
    模块过滤（Filter Modules）
       ↓
    状态矩阵系统（State Matrix System）
       ↓
    布局引擎（Layout Engine）
       ↓
    渲染（Render）
    ```
    
- **实现管线**
    
    ```
    权限数据（Permissions）
       ↓
    过滤模块（filter modules）
       ↓
    状态矩阵系统（state matrix system）
       ↓
    布局引擎（layout engine）
       ↓
    渲染（render）
    ```
    
- **核心数据结构**
    
    ```json
    {
      "layout": {
        "expanded": false,
        "collapsedWidth": 72,
        "expandedWidth": 210,
        "breakpoint": 1250
      },
      "secondaryMenu": {
        "collapsed": 240,
        "expanded": 280
      },
      "modules": [
        { "id": "crm", "visible": true },
        { "id": "order", "visible": true }
      ],
      "state": {
        "empty": false
      }
    }
    ```
    
- **主要 Props API**
    
    
    | **Prop** | **类型** | **默认值** | **描述** |
    | --- | --- | --- | --- |
    | `permissions` | `string[]` | **必填** | 当前用户的权限列表 |
    | `modules` | `Module[]` | **必填** | 所有可用模块配置（含权限标识） |
    | `breakpoint` | `number` | `1250` | 响应式断点（px） |
    | `onExpandChange` | `(expanded: boolean) => void` | 可选 | 展开状态变化回调 |
    | `onModuleClick` | `(moduleId: string) => void` | **必填** | 模块点击回调（路由跳转） |
    | `onDINAction` | `(action: string) => void` | 可选 | DIN 操作回调 |
- **模块可见性计算**
    
    ```tsx
    // 有对应模块的查看权限 → 显示模块入口；无权限 → 不显示
    const visibleModules = modules.filter(module =>
      permissions.includes(module.permissionId)
    );
    
    // 无权限模块不渲染，不占位
    const isEmpty = visibleModules.length === 0;
    ```
    
- **布局状态管理**
    
    ```tsx
    // 布局状态由状态矩阵系统管理
    const layoutState = {
      expanded: false,        // 当前是否展开
      width: 72,              // 当前宽度
      canExpand: viewportWidth >= 1250,  // 是否允许展开
    };
    
    // 响应式约束：<1250 禁止展开
    function toggleExpand() {
      if (viewportWidth < 1250) return;  // 忽略点击
      layoutState.expanded = !layoutState.expanded;
    }
    ```
    
- **溢出检测**
    
    ```tsx
    // 溢出检测基于实际 DOM 渲染高度（适应模块名称换行场景）
    const checkOverflow = () => {
      const containerHeight = navContainerRef.value?.clientHeight || 0;
      const modulesHeight = navModulesRef.value?.scrollHeight || 0;
      return modulesHeight > containerHeight;
    };
    ```
    
- **Vue 组件结构**
    
    ```
    NavBar
    ├── ModuleNav（模块导航区）
    │   ├── ModuleItem（有权限的模块）
    │   └── SystemNav（系统导航，始终显示）
    ├── BottomNav（底部区域）
    │   ├── CorpSwitch（企业切换，按权限显示）
    │   ├── AvatarEntry（用户入口，方向随布局）
    │   └── OverflowMask（溢出遮罩）
    └── DIN Layer（通知交互层）
    ```
    
- **DIN 交互实现**
    - **默认**：显示消息徽章（Badge）
    - **悬浮（Hover）**：隐藏徽章，显示 DIN 操作按钮
    - **离开（Leave）**：恢复默认状态
    
    ```tsx
    const handleDINHover = (appId: string) => {
      hideBadge(appId);
      showDINActions(appId);
    };
    
    const handleDINLeave = (appId: string) => {
      showBadge(appId);
      hideDINActions(appId);
    };
    ```
    

> ✅ 允许：使用权限系统驱动模块可见性、布局状态由状态矩阵管理、溢出使用遮罩
> 
> 
> ❌ 禁止：静态写死模块列表、前端使用假数据回退、忽略响应式约束
> 

---

# 4. 结构拆解

| **层级** | **组件** | **职责** |
| --- | --- | --- |
| Container | `NavBar` | 管理布局状态、权限过滤、响应式约束 |
| ModuleNav | `ModuleNav` | 渲染有权限的模块列表 |
| ModuleItem | `ModuleItem` | 单个模块入口（图标 + 名称） |
| SystemNav | `SystemNav` | 系统导航（始终显示） |
| BottomNav | `BottomNav` | 底部区域容器 |
| CorpSwitch | `CorpSwitch` | 企业/组织切换（按权限显示） |
| AvatarEntry | `AvatarEntry` | 用户入口，方向随布局变化 |
| OverflowMask | `OverflowMask` | 溢出遮罩 + 分割线 |
| DIN Layer | `DINLayer` | 通知交互层（徽章 / 操作按钮） |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 结构拆解图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：NavBar 各层级模块标注
```

---

# 5.  变体与状态系统

## 变体

| **变体** | **说明** |
| --- | --- |
| `layout: collapsed` | 折叠态，宽度 72px |
| `layout: expanded` | 展开态，宽度 210px |
| `state: default` | 正常显示 |
| `state: empty` | 无权限模块，仅系统导航 |
| `state: overflow` | 模块溢出，显示遮罩 |
| `state: din-active` | DIN 悬浮激活，覆盖默认状态 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 变体对比图（bottom / top / compact）      |
|                                                      |
|                                                      |
-------------------------------------------------------
图：不同位置和密度的 BatchBar 样式对比
```

## **状态矩阵**

| **状态** | **行为** |
| --- | --- |
| **Default（默认）** | 折叠态，显示模块图标，无名称 |
| **Expanded（展开）** | 展开态 210px，显示图标 + 名称 |
| **Overflow（溢出）** | 底部渐变遮罩 + 分割线激活 |
| **<1250（响应式禁用）** | 展开按钮禁用，忽略点击 |
| **Empty Permission（空权限）** | 仅系统导航，无业务模块 |
| **DIN Active** | 悬浮时覆盖默认状态 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 状态矩阵图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：各状态之间的转换关系
```

---

# 6. 交互行为

| **行为** | **触发** | **响应** |
| --- | --- | --- |
| 展开/收起 | 点击展开按钮 | 检查视口宽度；若 ≥1250px 则切换，否则忽略 |
| 模块点击 | 点击模块图标/名称 | 触发 `onModuleClick`，路由跳转 |
| DIN 悬浮 | 鼠标悬浮在应用图标上 | 隐藏徽章，显示 DIN 操作按钮（仅当有未读通知时） |
| DIN 离开 | 鼠标移出应用图标 | 恢复徽章显示，隐藏操作按钮 |
| 窗口宽度变化 | 窗口 resize | 重新计算可展开状态；若 <1250px 且当前展开，自动收起 |
| 运行时权限变更 | 权限列表更新 | 重新过滤模块，更新渲染（通常发生在登录/刷新时） |
| 模块溢出 | 模块数量超出容器高度 | 自动激活 Overflow Mask |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 交互流程图（展开/权限/DIN）               |
|                                                      |
|                                                      |
-------------------------------------------------------
图：展开流程、权限过滤流程、DIN 交互流程
```

---

# 7. 数据模型与逻辑

## **NavBar DSL v3**

```json
{
  "layout": {
    "expanded": false,
    "collapsedWidth": 72,
    "expandedWidth": 210,
    "breakpoint": 1250
  },
  "secondaryMenu": {
    "collapsed": 240,
    "expanded": 280
  },
  "modules": [
    {
      "id": "crm",
      "label": "客户管理",
      "icon": "crm",
      "permissionId": "module.crm",
      "visible": true,
      "route": "/crm"
    },
    {
      "id": "order",
      "label": "订单管理",
      "icon": "order",
      "permissionId": "module.order",
      "visible": true,
      "route": "/order"
    }
  ],
  "state": {
    "empty": false
  }
}
```

## 映射规则

| **字段** | **UI 表示** | **规则** |
| --- | --- | --- |
| `layout.expanded` | 导航宽度 | `true` → 210px；`false` → 72px |
| `modules[].visible` | 模块是否渲染 | 由 `permissionId` 在权限列表中决定 |
| `state.empty` | 是否显示系统导航仅 | 无任何可见模块时 `true` |
| `secondaryMenu` | 二级菜单宽度 | 随主布局联动 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 数据模型映射示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：DSL → UI 的映射关系
```

---

# 8. 使用规范

## 允许

- 布局必须由状态驱动（State-driven）
- 模块必须由权限驱动（Permission-driven）
- 溢出必须使用遮罩（Mask）
- DIN 必须由悬浮（Hover）驱动
- 无权限模块不渲染、不占位

## 禁止

- 禁止静态导航（Static NavBar）
- 禁止前端写死模块列表（Hard-coded modules）
- 禁止使用用户界面假数据回退（UI fallback data）
- 禁止无权限模块灰显占位

## 约束

| **约束项** | **限制** |
| --- | --- |
| 折叠态宽度 | 72px（固定） |
| 展开态宽度 | 210px（固定） |
| 响应式断点 | 1250px（固定） |
| 二级菜单宽度（折叠） | 240px |
| 二级菜单宽度（展开） | 280px |
| 模块数量 | 由权限系统决定，无硬上限 |

---

# 9. 开发实现

## 技术栈

- 框架：Vue 3（Composition API）或 React
- 状态管理：Pinia / Redux（状态矩阵系统）
- 样式：CSS 变量 + SCSS

## **Props API**

| **Prop** | **类型** | **默认值** | **描述** |
| --- | --- | --- | --- |
| `permissions` | `string[]` | **必填** | 当前用户的权限列表 |
| `modules` | `Module[]` | **必填** | 所有可用模块配置 |
| `breakpoint` | `number` | `1250` | 响应式断点 |
| `onModuleClick` | `(moduleId: string) => void` | **必填** | 模块点击回调 |
| `onExpandChange` | `(expanded: boolean) => void` | 可选 | 展开状态变化回调 |
| `onDINAction` | `(action: string, moduleId: string) => void` | 可选 | DIN 操作回调 |

## **权限过滤核心逻辑**

```tsx
// 有对应模块的查看权限 → 显示模块入口；无权限 → 不显示
const visibleModules = computed(() => {
  return props.modules.filter(module => 
    props.permissions.includes(module.permissionId)
  );
});

// 空状态判断
const isEmpty = computed(() => visibleModules.value.length === 0);
```

## **布局状态管理**

```tsx
// 布局状态
const layout = reactive({
  expanded: false,
  width: computed(() => layout.expanded ? 210 : 72),
  canExpand: computed(() => window.innerWidth >= props.breakpoint),
});

// 切换展开
function toggleExpand() {
  if (!layout.canExpand) return;
  layout.expanded = !layout.expanded;
  props.onExpandChange?.(layout.expanded);
}

// 响应式监听
onMounted(() => {
  window.addEventListener('resize', handleResize);
});
```

## **布局状态管理**

```tsx
// 溢出检测基于实际 DOM 渲染高度（适应模块名称换行场景）
const checkOverflow = () => {
  const containerHeight = navContainerRef.value?.clientHeight || 0;
  const modulesHeight = navModulesRef.value?.scrollHeight || 0;
  return modulesHeight > containerHeight;
};
```

## **性能策略**

- 权限过滤使用计算属性缓存
- 模块列表使用 `shallowRef` 避免深度响应开销
- 溢出检测使用 `ResizeObserver` 防抖

---

# 10. 组合与依赖关系

## 依赖项

- **权限系统（Permission System）** ：提供用户权限列表
- **路由系统（Router System）** ：处理模块点击跳转
- **布局引擎（Layout Engine）** ：管理全局布局状态
- **状态矩阵系统（State Matrix System）** ：管理导航状态
- **通知系统（Notification System）** ：提供 DIN 数据

## 被依赖项

- 应用外壳（Application Shell）
- Admin / CRM / ERP 后台
- 企业级 SaaS 平台

## 组合规则

- **允许**：与 Avatar、CorpSwitch 组件组合；DIN 交互为 NavBar 内置能力
- **禁止**：与页面内 Tab 导航组合；与 Form Stepper 混合使用

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组合关系示意图                            |
|                                                      |
|                                                      |
-------------------------------------------------------
图：NavBar 与 Permission System / Router / Layout Engine 的组合关系
```

---

# 11. 无障碍

- **WCAG Level**：AA
- **aria-label**：导航容器提供 `aria-label="主导航"`
- **键盘支持**：
    - Tab 键在模块间导航
    - Enter / Space 触发模块跳转
    - 展开按钮支持 Enter / Space 切换
- **焦点管理**：
    - 展开/收起时焦点保持在触发按钮上
    - 模块列表变化时焦点不自动移动
- **对比度**：模块名称与背景对比度 ≥ 4.5:1

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 无障碍 ARIA 标注示意图                    |
|                                                      |
|                                                      |
-------------------------------------------------------
图：ARIA 标注位置、键盘导航示意
```

---

# 12. 性能限制

| **指标** | **限制** | **备注** |
| --- | --- | --- |
| 模块数量 | ≤ 50 | 超出建议分组或使用滚动 |
| 权限过滤 | O(n) | n 为模块总数，使用计算属性缓存 |
| 布局切换 | 无重排抖动 | 使用 `transform` 或 `width` 过渡 |
| ResizeObserver | 防抖 100ms | 避免频繁触发 |

---

# 13. 边界

| **场景** | **处理方式** |
| --- | --- |
| **1249px / 1250px 抖动** | 使用防抖 + 断点阈值，避免来回切换 |
| **无权限模块** | 不渲染、不占位，切换至系统导航仅状态 |
| **溢出 + 遮罩 + 空状态** | 空状态优先，溢出检测仅在非空时生效 |
| **DIN 悬浮中断激活状态** | 悬浮时覆盖默认状态，离开后恢复 |
| **运行时权限变更** | 监听权限变化，重新过滤模块，更新渲染。若当前展开的模块被撤销权限，自动切换到下一个可见模块或收起状态 |
| **窗口宽度变化** | 若 <1250px 且当前展开，自动收起 |
| **模块数量刚好填满容器** | 不触发溢出遮罩 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 边界情况处理示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：1249/1250 抖动处理、无权限状态、溢出遮罩示例
```

---

# 14. 拓展性

| **扩展点** | **方式** | **说明** |
| --- | --- | --- |
| **自定义模块渲染** | `module` 插槽 | 定制单个模块的渲染方式 |
| **自定义底部区域** | `bottom` 插槽 | 替换 CorpSwitch / Avatar 区域 |
| **自定义 DIN 交互** | `din` 插槽 | 定制通知交互行为 |
| **多主题支持** | CSS 变量覆盖 | 支持品牌主题定制 |
| **多租户配置** | `CorpSwitch` 组件 | 支持企业/组织切换 |

**限制**：禁止绕过权限系统直接渲染模块；禁止绕过布局状态系统控制宽度

---

# 15. 生命周期与版本管理

## 当前版本

v1.0

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 新增 | 初始版本，权限驱动 + 状态驱动 + 布局驱动的导航运行时系统 | 无 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 无

## 迁移指南

1. 接入权限系统，提供用户权限列表
2. 将模块列表配置为 `Module[]` 格式，包含 `permissionId`
3. 实现 `onModuleClick` 路由跳转回调
4. 移除所有静态导航样式，使用布局状态驱动
5. 添加响应式监听，实现 <1250px 禁用展开

## **最终系统总结（非常关键）**

```
权限系统（Permission System）
   ↓
状态矩阵系统（State Matrix System）
   ├── 输入：布局状态 + 权限状态 + 溢出状态 + 响应式状态 + DIN 交互状态
   └── 输出：确定的“最终状态”
   ↓
布局引擎（Layout Engine）
   ├── 折叠态（Collapsed）：72px
   └── 展开态（Expanded）：210px
   ↓
模块运行时层（Module Runtime Layer）
   ├── 有权限 → 渲染
   └── 无权限 → 不渲染（空状态合法）
   ↓
溢出层 / DIN 交互层（Overflow / DIN Interaction Layer）
   ├── 溢出 → 遮罩（Mask）+ 分割线
   └── DIN 悬浮 → 徽章隐藏 / 操作显示
   ↓
二级菜单联动
   ├── 折叠态：240px
   └── 展开态：280px
```