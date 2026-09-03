# 预览

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组件能力全景示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：标注了 Header Slot（标题+下拉菜单+Reddot）、Group（分组）、Item（Icon+Label+Message）、Sub-level（展开/收起）等能力位置
```

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 层级结构图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Module（NavBar）→ Group → Item → Sub-level 的层级关系
```

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 宽度联动示意图（240px ↔ 280px）          |
|                                                      |
|                                                      |
-------------------------------------------------------
图：NavBar 折叠（74px）→ Module Menu 240px；NavBar 展开（210px）→ Module Menu 280px
```

# AI总结

```
-------------------------------------------------------
| 1、Module Menu 是 NavBar 子系统，展示选中模块下的二级菜单：
|    Header Slot → Group → Item → Sub-level。
| 2、使用：NavBar 选中模块后自动展开；点击 Item 跳转；可展开
|    Sub-level；Item 可带 Message。
| 3、可配置：Group 标题、Item Icon/Label/Message、Sub-level
|    深度、Reddot、240px / 280px 宽度联动。
| 4、典型：一模块多分组，每组若干 Item，复杂项可三级嵌套。
| 5、注意：跨模块切换回 NavBar；展开态与 NavBar 布局同步。
-------------------------------------------------------
```

# 1. 定位

`Module Menu` 是 NavBar 的**子系统组件**，用于展示选中模块下的二级菜单结构。当用户在 NavBar 中选中一个模块时，Module Menu 自动展开，显示该模块的分组（Group）和菜单项（Item）。

**Module Menu 与 NavBar 的关系：**

```css
NavBar（主导航）
├── 模块 A（点击选中） → Module Menu 展开
│   ├── Header Slot（模块标题 + 下拉切换 + Reddot）
│   ├── Group A
│   │   ├── Item 1 → 可带 Message
│   │   ├── Item 2
│   │   └── Sub-level（Item 3）
│   │       ├── Sub-item 1
│   │       └── Sub-item 2
│   └── Group B
│       ├── Item 4
│       └── Item 5
├── 模块 B
└── 模块 C
```

## 设计目标

- 支持模块分组结构
- 支持 Header Slot（模块上下文切换、标题展示）及拓展
- 支持多层级 Module Item（Item → Sub-level，最多 2 层）
- 支持权限驱动可见性
- 支持 `Message` 数据态展示（子菜单项右侧数字）
- 支持 `Reddot` 状态展示（Header 下拉菜单项 + NavBar 模块图标）
- 支持平滑宽度动画（240px ↔ 280px，与 NavBar 联动）

## 解决的问题

- 复杂系统模块入口无结构组织（扁平列表，缺乏分组）
- 权限与 UI 强耦合导致展示混乱（无权限模块仍占位）
- 模块状态表达不统一（消息、待办无统一规范）
- 多层级导航缺乏一致模型（各业务自行实现子菜单）

## 使用边界

### **可使用场景**

- SaaS / ERP / CRM 模块导航
- Admin 系统侧边模块入口
- 多组织 / 多工作区（Workspace）系统

### **不适用场景**

- 页面内 Tab 导航
- 临时菜单
- 表单内导航结构

---

# 2. 设计决策与演进

## 设计原则

1. **权限驱动结构生成**
    
    模块菜单的结构由权限系统驱动：
    
    - 有权限 → 渲染
    - 无权限 → 不渲染（无占位、无灰显）
    - 权限过滤在渲染前执行
2. **结构优先于视觉**
    - 分组（Group）是**数据结构**（组织 Item 的容器），但不承载业务逻辑
    - 权限和路由由 Item 自身管理
    - Group 的可见性由内部 Item 的权限决定
3. **状态与数据解耦**
    - Message 和 Reddot 是**数据驱动**的展示元素，不参与交互状态机
    - 子菜单项的 Active / Hover 状态独立于 Message / Reddot
4. **固定组合，灵活内容**
    - **Icon + Label** 为固定组合，不可拆分
    - PM 可更换 Icon 内容，可更换 Label 文本，但不可更改组合配置

## 设计权衡

- **扁平 vs 分层结构 → 分层结构（提升信息层级表达）**
    - 扁平结构：所有菜单项平铺，无分组无层级，结构简单但信息组织能力弱
    - 分层结构：Group → Item → Sub-level 三级结构，信息层级清晰，用户可逐层定位
    - 结论：选择分层结构，但限制层级 ≤ 2，避免导航过深影响可用性
- **Message 状态化 vs 数据化 → 数据化（保持纯粹展示）**
    - 状态化：Message 作为交互状态的一部分，可点击、可清除，增加交互复杂度
    - 数据化：Message 仅作为数据展示（数字），不进入状态机，不承载交互行为
    - 结论：选择数据化，Message 仅展示后端数据，不参与交互状态，保持职责单一
- **固定宽度 vs 响应式宽度 → 固定宽度（与 NavBar 联动）**
    - 响应式宽度：宽度随容器动态变化，灵活但可能导致内容展示不一致
    - 固定宽度：240px ↔ 280px 两档固定值，与 NavBar 状态联动，由 Design System 统一控制
    - 结论：选择固定宽度，保证展示一致性，PM 不允许私自定义
- **Icon+Label 固定组合 vs 灵活组合 → 固定组合（保证视觉一致性）**
    - 灵活组合：PM 可自由搭配 Icon/Label 的出现与否，灵活但可能导致视觉不一致
    - 固定组合：每个菜单项必须同时包含 Icon 和 Label，PM 仅可更换内容，不可更改结构
    - 结论：选择固定组合，保证导航项视觉一致性，降低 PM 配置复杂度

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：扁平菜单** | 单层结构，无分组 | 无层级、无权限模型 |
| **阶段二：分组菜单** | 支持分组 | 无权限模型，权限与 UI 耦合 |
| **阶段三：权限菜单** | 权限 + 动态结构 | UI 耦合度高，数据与状态混合 |
| **阶段四：当前版本** | 固定组合 + 权限驱动 + 分层结构 | 统一、可控、可拓展 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM and Others、DEV（前端/后端）。

## UED

#### **须交付的设计资产**

| **资产** | **格式** | **说明** |
| --- | --- | --- |
| **层级结构图** | Figma / 文档 | Group → Item → Sub-level 的层级关系 |
| **Header Slot 变体** | Figma 变体 | 模块标题 + 下拉菜单 + Reddot 的视觉样式 |
| **Group 视觉规范** | 设计稿 | 组标题样式、组间距 |
| **Item 状态变体** | Figma 变体 | Default / Hover / Active 的视觉表现 |
| **Sub-level 交互** | 设计稿 | 折叠/展开状态（右箭头 ↔ 上箭头） |
| **Message 组件** | 设计稿 | 子菜单项右侧的数字标识样式 |
| **宽度联动规范** | 设计规范 | 240px ↔ 280px 的切换动画 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 资产示意图（层级结构、状态变体、宽度联动）      |
|                                                      |
|                                                      |
-------------------------------------------------------
图：层级结构、Item 状态、宽度联动的视觉规范
```

#### **详细交付指南**

1. **层级结构**
    
    
    | **层级** | **说明** | **约束** |
    | --- | --- | --- |
    | **Module** | NavBar 中的一级入口 | 由 NavBar 管理 |
    | **Group** | Module Menu 内的分类容器 | 必须有至少 1 个 Item 才渲染 |
    | **Item** | 菜单项，可点击跳转 | Icon + Label 固定组合 |
    | **Sub-level** | Item 下的子菜单项 | 最多 1 层，默认折叠 |
2. **Item 状态变体**
    
    
    | **状态** | **UI 规则** |
    | --- | --- |
    | **Default** | 白底，无特殊样式 |
    | **Hover** | 背景加深 5% `var(--event-hover-secondary)` |
    | **Active** | 背景色 `var(--event-focus-primary)` |
    | **Sub-level 展开** | 箭头从向右（`▶`）变为向上（`▲`） |
    
    > **Label 文本规则**：
    > 
    > 
    > Item 的 Label 文本超出容器宽度时，**自动换行**，而非截断或省略号
    > 
    > 建议 Label 长度不超过 10 个中文字符，超长 Label 需产品侧评审
    > 
    
3. **宽度联动规范**
    
    
    | **NavBar 状态** | **Module Menu 宽度** | **动画** |
    | --- | --- | --- |
    | 折叠（74px） | **240px** | CSS transition |
    | 展开（210px） | **280px** | CSS transition |
4. **响应式与主题适配**
    
    
    | **适配场景** | **实现方式** |
    | --- | --- |
    | **暗黑模式切换** | 通过主题层 CSS 变量覆盖 |
    | **减少动效（Reduced Motion）** | 使用 `@media (prefers-reduced-motion: reduce)` 降级动画 |

> ✅允许：设计 Group 间距、Item 状态变体、Sub-level 展开/收起交互
> 
> 
> ❌ 禁止：去掉 Icon 或 Label（固定组合不可拆分）
> 
> ❌ 禁止：设计超过 2 层的层级结构
> 

## PM and Others

#### **须定义的内容清单**

| **条目** | **说明** | **示例** |
| --- | --- | --- |
| **模块标题（Header Title）** | Module Menu 顶部显示的标题 | `"项目"` |
| **下拉菜单（Dropdown）** | 是否启用模块切换下拉菜单 | `true` / `false` |
| **下拉菜单项** | 下拉菜单中的选项列表 | `[{ id: "project_a", label: "项目 A", reddot: true }]` |
| **分组（Group）** | 模块菜单内的分类容器 | `{ id: "group_1", title: "最近使用", items: [...] }` |
| **菜单项（Item）** | 可点击的导航入口 | `{ id: "payouts", label: "Payouts", icon: "payouts", permission: "module.payouts.view" }` |
| **子菜单项（Sub-level）** | Item 下的子菜单，最多 1 层 | `children: [{ id: "pending", label: "待处理", icon: "pending", permission: "..." }]` |
| **Message** | 子菜单项右侧的数字标识 | `message: 99` |
| **Reddot** | 下拉菜单项右侧的状态标识 | `reddot: true` |

#### **硬性约束**

以下规则由系统强制执行，不可修改或绕过：

| **约束项** | **说明** | **修改后果** |
| --- | --- | --- |
| **Icon + Label 固定组合** | 每个菜单项必须同时包含 Icon 和 Label，PM 只能更换内容，不能去掉其中任一 | 组件校验报错，拒绝渲染 |
| **层级深度 ≤ 2 层** | 只允许 Item → Sub-level，不允许 Sub-sub-level | 超出层级的数据被忽略或报错 |
| **Message 只用于子菜单项** | Message 只能配置在 Item / Sub-level Item 右侧，不能出现在 Header 或 NavBar | 配置无效，不显示 |
| **Reddot 只用于 Header 下拉菜单项 + NavBar** | Reddot 只能配置在 Header Dropdown Items 和 NavBar 模块图标上 | 配置无效，不显示 |
| **Group 非空才渲染** | 没有 Item 的 Group 不显示；全组无权限 → Group 不渲染 | 自动过滤，无需 PM 干预 |
| **所有 Item 必须挂载在 Group 下** | 不能有无 Group 的“漂浮” Item | 数据结构校验报错 |
| **宽度由系统统一控制** | 240px / 280px 由 EverGreen Design System 统一调节，PM 不可私自定义 | 自定义宽度被系统覆盖 |
| **权限过滤在渲染前执行** | 无权限 Item 不渲染，不占位，不灰显 | 自动过滤，无需 PM 干预 |
| **Message / Reddot 不可交互** | 纯展示组件，不可点击 | 无交互事件绑定 |

#### **可配置项**

以下内容可根据业务场景自由配置：

| **配置项** | **说明** | **默认值** | **示例** |
| --- | --- | --- | --- |
| **Header Title** | 模块标题文本 | 由业务定义 | `"项目"` |
| **Header Dropdown** | 是否启用下拉切换 | `false` | `true` |
| **Dropdown Items** | 下拉菜单项列表 | `[]` | `[{ id: "project_a", label: "项目 A", reddot: true }]` |
| **Group Title** | 分组名称，可为空 | `""`（空） | `"最近使用"` |
| **Item Label** | 菜单项名称。**文本溢出时自动换行**，建议不超过 10 个中文字符 | 由业务定义 | `"Payouts"` |
| **Item Icon** | 菜单项图标（从 Icon 库选择） | 由业务定义 | `"payouts"` |
| **Item Permission** | 权限标识 | 必填 | `"module.payouts.view"` |
| **Message** | 子菜单项右侧数字 | `null`（不显示） | `99` |
| **Reddot** | 下拉菜单项右侧状态标识 | `false`（不显示） | `true` |
| **Sub-level（Children）** | 是否包含子菜单项 | `[]`（无子菜单） | `[{ id: "pending", label: "待处理", ... }]` |
| **点击 Item 的行为** | 路由跳转 / 触发回调 | 路由跳转 | 由业务定义 |

#### **可配置组合**

菜单项（Item）的 Icon + Label 为固定组合，可在基础上选择附加组件：

| **组合** | **说明** | **使用场景示例** |
| --- | --- | --- |
| **Icon + Label** | 基础（必选） | 纯导航入口 |
| **Icon + Label + `Message`** | 带消息数量 | “Payouts”显示待处理 99 项 |
| **Icon + Label + Sub-level** | 带子菜单（自动带箭头） | “Callback Error”下有子分类 |
| **Icon + Label + `Message` + Sub-level** | 带消息 + 子菜单 | “订单管理”有 5 笔待审核，且有子分类 |

#### **配置示例（加密货币项目场景）**

```json
{
  "moduleMenu": {
    "header": {
      "title": "项目",
      "dropdown": true,
      "dropdownItems": [
        { "id": "project_a", "label": "项目 A", "reddot": true },
        { "id": "project_b", "label": "项目 B", "reddot": false }
      ]
    },
    "groups": [
      {
        "id": "group_1",
        "title": "最近使用",
        "items": [
          {
            "id": "payouts",
            "label": "Payouts",
            "icon": "payouts",
            "permission": "module.payouts.view",
            "message": 99,
            "children": []
          },
          {
            "id": "callback",
            "label": "Callback Error",
            "icon": "callback",
            "permission": "module.callback.view",
            "message": null,
            "children": [
              { "id": "pending", "label": "待处理", "icon": "pending", "permission": "module.callback.pending" },
              { "id": "history", "label": "回调历史", "icon": "history", "permission": "module.callback.history" }
            ]
          }
        ]
      }
    ]
  }
}
```

#### **可拓展能力**

以下能力目前系统已预留接口，但本期暂不支持，未来版本可能开放：

| **序号** | **预留能力** | **说明** | **预计支持版本** |
| --- | --- | --- | --- |
| 1 | **Header 自定义内容** | 在 Header 区域添加搜索、快捷操作等 | v1.1 |
| 2 | **Item 附加组件** | 在 Item 右侧添加标签、状态标识等 | v1.1 |
| 5 | **搜索过滤** | 在 Module Menu 内搜索菜单项 | v1.2 |
| 6 | **紧凑模式** | 支持更密或更疏的布局 | v1.2 |
| 7 | **Sub-level 独立配置** | Sub-level Item 可独立配置 Message、权限等 | v1.1 |

> ✅ **允许**：配置 Icon/Label/Group Title/Message/Reddot/Header/Dropdown/Children
> 
> 
> ✅ **允许**：通过数据驱动控制 Message 和 Reddot 的显示
> 
> ✅ **允许**：从 Icon 库中选择不同的图标，自定义 Label 文本
> 
> ❌ **禁止**：去掉 Icon 或 Label（固定组合不可拆分）
> 
> ❌ **禁止**：私自定义 Module Menu 宽度（240px / 280px 由系统控制）
> 
> ❌ **禁止**：创建超过 2 层的层级结构（Item → Sub-level 为最大深度）
> 
> ❌ **禁止**：将 Message 配置在 Header 或 NavBar 位置
> 
> ❌ **禁止**：将 Reddot 配置在子菜单项位置
> 
> ❌ **禁止**：为 Message 或 Reddot 添加交互行为（纯展示）
> 

## DEV

- **核心架构**
    
    ```
    NavBar（主导航）
       ↓
    Module 选中
       ↓
    Module Menu（子系统）
       ├── Header Slot（标题 + 下拉菜单 + Reddot）
       ├── Group（分组容器）
       │   └── Item（菜单项）
       │       ├── Icon + Label（固定组合）
       │       ├── Message（可选，右侧数字）
       │       └── Sub-level（可选，默认折叠）
       │           └── Sub-item（复用 Item 结构）
       └── 宽度联动（240px ↔ 280px）
    ```
    
- **主要 Props API**
    
    
    | **Prop** | **类型** | **默认值** | **描述** |
    | --- | --- | --- | --- |
    | `moduleMenu` | `ModuleMenuConfig` | **必填** | 模块菜单配置（Header + Groups） |
    | `permissions` | `string[]` | **必填** | 当前用户的权限列表 |
    | `expanded` | `boolean` | `false` | NavBar 是否展开（控制宽度联动） |
    | `onItemClick` | `(item: Item) => void` | **必填** | 菜单项点击回调 |
    | `onDropdownSelect` | `(item: DropdownItem) => void` | 可选 | 下拉菜单项选择回调 |
    | `activeItemId` | `string` | 可选 | 当前高亮的 Item ID（路由驱动） |
- **数据模型**
    
    ```json
    /** 下拉菜单项 */
    interface DropdownItem {
      id: string;
      label: string;
      reddot?: boolean;        // 是否显示 Reddot
    }
    
    /** 子菜单项（Sub-level） */
    interface SubItem {
      id: string;
      label: string;
      icon: string;            // Icon + Label 固定组合
      permission: string;
      message?: number | null; // Message 可选
    }
    
    /** 菜单项（Item） */
    interface Item {
      id: string;
      label: string;
      icon: string;            // Icon + Label 固定组合
      permission: string;
      message?: number | null; // Message 可选
      children?: SubItem[];    // Sub-level，最多 1 层
    }
    
    /** 分组（Group） */
    interface Group {
      id: string;
      title?: string;          // 可为空
      items: Item[];           // 至少 1 个 Item
    }
    
    /** 模块菜单配置 */
    interface ModuleMenuConfig {
      header: {
        title: string;
        dropdown?: boolean;
        dropdownItems?: DropdownItem[];
      };
      groups: Group[];
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
- **权限过滤逻辑**
    
    ```tsx
    // 权限过滤在渲染前执行
    function filterModuleMenu(config: ModuleMenuConfig, permissions: string[]): ModuleMenuConfig | null {
      const filteredGroups = config.groups
        .map(group => ({
          ...group,
          items: group.items.filter(item => permissions.includes(item.permission))
        }))
        .filter(group => group.items.length > 0); // 全组无权限 → Group 不渲染
    
      if (filteredGroups.length === 0) {
        return null; // 全部无权限 → Module 入口不渲染
      }
    
      return { ...config, groups: filteredGroups };
    }
    ```
    
- **层级结构约束**
    
    ```tsx
    // 层级深度校验：不允许超过 2 层（Item → Sub-level）
    function validateDepth(item: Item, depth: number = 1): boolean {
      if (depth > 2) return false; // Sub-level 不能再有 children
      if (item.children) {
        return item.children.every(child => validateDepth(child, depth + 1));
      }
      return true;
    }
    ```
    

> 
> 
> 
> ✅ 允许：使用 `permissions` 过滤 Module Menu 结构
> 
> ✅ 允许：使用 CSS transition 实现宽度动画（240 ↔ 280）
> 
> ✅ 允许：通过插槽（Slot）扩展 Header 区域
> 
> ❌ 禁止：硬编码 `240px` / `280px`（由 Design System 统一控制）
> 
> ❌ 禁止：创建超过 2 层的层级结构
> 
> ❌ 禁止：在组件内为 Message/Reddot 添加交互逻辑（纯数据展示）
> 

---

# 4. 结构拆解

| **层级** | **组件** | **职责** |
| --- | --- | --- |
| Container | `ModuleMenu` | 管理布局状态、宽度联动、权限过滤 |
| Header Slot | `MenuHeader` | 模块标题 + 下拉菜单（Reddot） |
| Group | `MenuGroup` | 分组容器，管理组内 Item |
| Item | `MenuItem` | 菜单项（Icon + Label + Message + Sub-level 箭头） |
| Sub-level | `SubMenu` | 子菜单项（折叠/展开，复用 Item 结构） |
| Message | `MessageBadge` | 右侧数字标识（纯展示，不可交互） |
| Reddot | `Reddot` | 状态标识（纯展示，不可交互） |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 结构拆解图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Module Menu 各层级模块标注（Container → Header → Group → Item → Sub-level）
```

---

# 5.  变体与状态系统

## 变体

| **变体** | **说明** |
| --- | --- |
| `layout: collapsed` | NavBar 折叠，Module Menu 宽度 240px |
| `layout: expanded` | NavBar 展开，Module Menu 宽度 280px |
| `header: with-dropdown` | 启用下拉菜单切换 |
| `header: without-dropdown` | 不启用下拉菜单 |
| `item: with-sublevel` | 有子菜单（显示向右箭头） |
| `item: without-sublevel` | 无子菜单 |

## **状态**

| **状态** | **说明** |
| --- | --- |
| **Default** | 白底，无特殊样式 |
| **Hover** | 背景加深 5% `var(--event-hover-secondary)` |
| **Active** | 背景色 `var(--event-focus-primary)` |
| **Sub-level Expanded** | 箭头向上（`▲`），子菜单展开 |
| **Sub-level Collapsed** | 箭头向右（`▶`），子菜单折叠 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 状态变体图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Default / Hover / Active / Sub-level Expanded 的视觉对比
```

---

# 6. 交互行为

| **行为** | **触发** | **响应** |
| --- | --- | --- |
| **选中模块** | 点击 NavBar 中的模块 | Module Menu 自动展开，第一个 Item 高亮（Active） |
| **点击 Item** | 点击菜单项 | 触发 `onItemClick`，路由跳转或回调 |
| **Hover Item** | 鼠标移入菜单项 | 显示 Hover 高亮 |
| **展开 Sub-level** | 点击带子菜单的 Item | Sub-level 展开，箭头变为向上（`▲`） |
| **收起 Sub-level** | 点击已展开的 Item | Sub-level 收起，箭头变为向右（`▶`） |
| **切换下拉菜单** | 点击 Header 下拉菜单项 | 切换当前上下文，Module Menu 内容更新 |
| **宽度联动** | NavBar 展开/折叠 | Module Menu 宽度自动切换（240 ↔ 280），CSS transition |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 交互流程图（展开/选中/Sub-level）         |
|                                                      |
|                                                      |
-------------------------------------------------------
图：模块选中 → 第一个 Item 高亮、Sub-level 展开/收起、下拉菜单切换的交互流程
```

---

# 7. 数据模型与逻辑

## **模式 Schema**

```json
{
  "moduleMenu": {
    "header": {
      "title": "项目",
      "dropdown": true,
      "dropdownItems": [
        { "id": "project_a", "label": "项目 A", "reddot": true },
        { "id": "project_b", "label": "项目 B", "reddot": false }
      ]
    },
    "groups": [
      {
        "id": "group_1",
        "title": "最近使用",
        "items": [
          {
            "id": "payouts",
            "label": "Payouts",
            "icon": "payouts",
            "permission": "module.payouts.view",
            "message": 99,
            "children": []
          },
          {
            "id": "callback",
            "label": "Callback Error",
            "icon": "callback",
            "permission": "module.callback.view",
            "message": null,
            "children": [
              { "id": "pending", "label": "待处理", "icon": "pending", "permission": "module.callback.pending" },
              { "id": "history", "label": "回调历史", "icon": "history", "permission": "module.callback.history" }
            ]
          }
        ]
      }
    ]
  }
}
```

## 映射规则

| **字段** | **UI 表示** | **规则** |
| --- | --- | --- |
| `header.title` | Module Menu 顶部标题 | 由 PM 配置 |
| `header.dropdownItems` | 下拉菜单项 | 点击切换上下文 |
| `header.dropdownItems[].reddot` | 下拉菜单项右侧 Reddot | `true` 显示红点 |
| `groups` | 分组容器 | 按顺序渲染 |
| `groups[].title` | 分组标题 | 可为空，空时仅用间距分区 |
| `items[].icon` + `label` | 菜单项（固定组合） | 不可拆分，PM 仅可更换内容 |
| `items[].message` | 菜单项右侧数字 | `null` 不显示 |
| `items[].children` | Sub-level | 有值则显示展开箭头 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 数据模型映射示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Schema → UI 的映射关系
```

---

# 8. 使用规范

1. **结构约束**
    
    
    | **约束项** | **限制** |
    | --- | --- |
    | 层级深度 | ≤ 2 层（Item → Sub-level） |
    | Icon + Label | 固定组合，不可拆分 |
    | **Label 文本溢出** | **自动换行**，不截断、不省略 |
    | Group 渲染条件 | 至少包含 1 个有权限的 Item |
2. **组件使用约束**
    
    
    | **组件** | **使用位置** | **交互** |
    | --- | --- | --- |
    | Message | 子菜单项右侧 | 纯展示，不可交互 |
    | Reddot | Header 下拉菜单项 + NavBar 模块图标 | 纯展示，不可交互 |
3. **宽度约束**
    
    EverGreen Design System 统一控制，不允许私自定义
    
    | **NavBar 状态** | **Module Menu 宽度** |
    | --- | --- |
    | 折叠（74px） | **240px** |
    | 展开（210px） | **280px** |
4. **权限约束**
    - 权限过滤在渲染前执行
    - 无权限 Item 不渲染（无占位、无灰显）
    - 全组无权限 → Group 不渲染
    - 全部无权限 → Module 入口不渲染（与 NavBar 联动）

## 允许

- 使用 Permission 过滤 Module Menu 结构
- 使用 CSS transition 实现宽度动画（240 ↔ 280）
- 通过插槽（Slot）扩展 Header 区域

## 禁止

- 不允许去掉 Icon 或 Label（固定组合不可拆分）
- 不允许创建超过 2 层的层级结构
- 不允许 PM 私自定义 Module Menu 宽度
- 不允许 Message / Reddot 添加交互逻辑（纯展示）
- 不允许无权限 Item 占位或灰显

---

# 9. 开发实现

## 技术栈

- 框架：Vue 3（Composition API）或 React
- 状态管理：Pinia / Redux
- 样式：CSS 变量 + SCSS
- 动画：CSS transition

## **Props API**

| **Prop** | **类型** | **默认值** | **描述** |
| --- | --- | --- | --- |
| `moduleMenu` | `ModuleMenuConfig` | **必填** | 模块菜单配置 |
| `permissions` | `string[]` | **必填** | 当前用户的权限列表 |
| `expanded` | `boolean` | `false` | NavBar 是否展开（控制宽度联动） |
| `onItemClick` | `(item: Item) => void` | **必填** | 菜单项点击回调 |
| `onDropdownSelect` | `(item: DropdownItem) => void` | 可选 | 下拉菜单项选择回调 |
| `activeItemId` | `string` | 可选 | 当前高亮的 Item ID（路由驱动） |

## **插槽 Slots**

| **插槽名** | **说明** | **参数** |
| --- | --- | --- |
| `header` | Header 区域自定义内容 | `{ title, dropdownItems }` |
| `group-title` | 分组标题自定义内容 | `{ group }` |
| `item-icon` | 菜单项图标自定义 | `{ item }` |
| `item-label` | 菜单项标签自定义 | `{ item }` |
| `item-extra` | 菜单项右侧附加内容（预留扩展） | `{ item }` |

## **性能策略**

- 权限过滤使用计算属性缓存
- 列表使用 `shallowRef` 避免深度响应开销
- Group 懒渲染（仅渲染可见 Group）
- Item memoization（使用 `React.memo` 或 `shallowRef`）

---

# 10. 组合与依赖关系

## 依赖项

- `NavBar` ：提供模块选中状态和宽度联动
- Permission System：提供用户权限列表
- Router System：处理 Item 点击跳转
- `Icon` ：提供 Item 图标
- `Color System`：提供背景色（`var(--event-focus-primary)`、`var(--event-hover-secondary)`）
- `Scale System`：提供间距和宽度

## 被依赖项

- 应用外壳（Application Shell）
- 导航

## 组合规则

- **允许**：NavBar 内部使用（子系统）
- **禁止**：独立作为全局菜单系统替代 NavBar

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组合关系示意图                            |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Module Menu 与 NavBar / Permission / Router / Icon / Color / Scale 系统的组合关系
```

---

# 11. 无障碍

- **WCAG Level**：AA
- **aria-label**：导航容器提供 `aria-label="模块菜单"`
- **键盘支持**：
    - Tab 键在菜单项间导航
    - Enter / Space 触发 Item 点击
    - 右箭头（→）展开 Sub-level
    - 左箭头（←）收起 Sub-level
- **焦点管理**：
    - 模块切换时，焦点移至第一个 Item
    - Sub-level 展开/收起时，焦点保持在当前 Item
- **对比度**：Active 状态背景色 `var(--event-focus-primary)` 与文本对比度 ≥ 4.5:1

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
| Group 数量 | ≤ 20 | 超出建议滚动 |
| 每 Group Item 数量 | ≤ 50 | 超出建议虚拟滚动 |
| 层级深度 | ≤ 2 | 超出校验报错 |
| 权限过滤 | O(n) | n 为 Item 总数，使用计算属性缓存 |
| 宽度动画 | CSS transition | 无重排抖动 |

---

# 13. 边界

| **场景** | **处理方式** |
| --- | --- |
| **全组无权限** | Group 不渲染 |
| **全部无权限** | Module 入口不渲染（与 NavBar 联动） |
| **Group Title 为空** | 仅使用间距（spacing）形成视觉分区 |
| **运行时权限变更** | 弹出警告组件：“温馨提示 / 权限已变更，请联系管理员 / 确定 / 取消” |
| **Sub-level 内容溢出** | 使用滚动或折叠，禁止破坏布局 |
| **NavBar 展开/折叠切换** | Module Menu 宽度自动联动，CSS transition 平滑过渡 |
| **Message 数字超过 99** | 显示 `99+` |
| **同时多个 Sub-level 展开** | 仅当前点击的 Sub-level 切换状态，其他保持 |
| **Label 文本过长** | **自动换行**，行高保持 20px，建议产品侧控制长度 ≤ 10 字符 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 边界情况处理示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：全组无权限、运行时权限变更、Message 99+ 的边界处理示意
```

---

# 14. 拓展性

| **扩展点** | **方式** | **说明** |
| --- | --- | --- |
| **Header 自定义内容** | `header` 插槽 | 支持搜索、快捷操作等 |
| **Item 附加组件** | `item-extra` 插槽 | 预留未来可能添加的标签、状态等 |
| **拖拽排序** | 数据结构预留 `order` 字段 | 未来支持 PM 自定义排序 |
| **收藏/固定** | 数据结构预留 `favorite` / `pinned` 字段 | 未来支持用户收藏常用菜单项 |
| **搜索过滤** | Header 插槽 | 未来支持在 Module Menu 内搜索 |
| **主题支持** | CSS 变量 | 支持不同主题下颜色、间距变化 |
| **紧凑模式** | Density System | 未来支持更密或更疏的布局 |

**限制**：禁止绕过权限系统直接渲染模块；禁止绕过布局状态系统控制宽度

---

# 15. 生命周期与版本管理

## 当前版本

v1.0

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 新增 | 初始版本，NavBar 子系统，支持 Group → Item → Sub-level 分层结构 | 无 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 无

## 迁移指南

1. 将现有扁平菜单项按业务分组，配置 `groups` 结构
2. 为每个 Item 配置 `permission` 字段
3. 如有子菜单，将子菜单项移入 `children` 字段（最多 1 层）
4. 配置 `header.title` 和可选的 `header.dropdown`
5. 接入 Permission System，实现权限过滤

## **最终系统总结（非常关键）**

```
NavBar（主导航）
   ↓
Module 选中
   ↓
Module Menu（子系统）
   ├── Header Slot
   │   ├── 模块标题
   │   ├── 下拉菜单（Reddot）
   │   └── 预留扩展插槽
   ├── Group（分组容器）
   │   └── Item（菜单项）
   │       ├── Icon + Label（固定组合，不可拆分）
   │       ├── Message（可选，右侧数字）
   │       └── Sub-level（可选，默认折叠）
   │           └── Sub-item（复用 Item 结构）
   └── 宽度联动（240px ↔ 280px）
```