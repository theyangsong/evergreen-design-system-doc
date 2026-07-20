# 预览

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组件能力全景示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：标注了位置
```

# AI总结

```
-------------------------------------------------------
| 1、BatchBar 是多选批处理浮层：Table/List 有选中行时出现，
|    提供批处理入口与选中计数。
| 2、使用：勾选行 → BatchBar 浮出 → 执行批处理或取消选择；
|    无选中自动隐藏。
| 3、可配置：批处理按钮列表、计数文案、浮层位置（默认底部）、
|    与宿主选择态 API 对接。
| 4、原则：不改变 Table/List 布局，瞬态 UI，不占用常驻空间。
| 5、注意：单行操作用操作列；表单提交用 Data Submission。
-------------------------------------------------------
```

# 1. 定位

`BatchBar` 是 Data Table / Data List / 其他组件在存在多行选中状态（Selection State）时出现的批处理控制组件，用于承载：

- 批处理操作入口（删除/导出/更新等）
- 选中状态反馈
- 快捷解除选择
- 上下文操作提示

## **核心定位（非常关键）**

**BatchBar = 选择上下文运行层（Selection Context Runtime Layer）**

它不属于 Table，也不属于 Column，而是：

**选择状态（Selection State）→ UI 运行时浮层（UI Runtime Overlay）→ BatchBar**

即：当表格存在选中行时，BatchBar 作为**操作外显层**自动出现，提供与该选择上下文相关的批处理操作入口。

## 设计目标

- 提供“选中即操作”的上下文反馈
- 不干扰 Table 主结构（不重排列、不影响滚动）
- 支持高频批处理操作
- 保持操作可恢复性（撤销/取消）

## 解决的问题

- 多选后无反馈，用户不知道当前选中状态
- 批处理操作入口分散（工具栏、右键菜单、行内）
- 用户不清楚当前选择状态（选了多少项、能否操作）
- 操作路径过长（批处理操作需进入详情页逐一处理）

## 使用边界

### **可使用场景**

- Data Table View 多选管理
- Data List 批量管理
- Admin 后台数据管理
- CRM / ERP 批处理场景
- 需要“选中即操作”的上下文交互

### **不适用场景**

- 单行操作（应使用行内操作列）
- 无选择状态的查看模式（View Mode）
- 表单提交流程（Data Submission Engine 已覆盖）
- 不需要批处理的只读列表

---

# 2. 设计决策与演进

## 设计原则

1. **选择驱动**
    
    BatchBar 只依赖一个状态：
    
    ```tsx
    selectedRows.length > 0
    ```
    
    - 有选中 → 显示
    - 无选中 → 隐藏
    - 无其他显示条件
2. **上下文浮层原则**
    - 不改变 Table 的布局（layout）
    - 不重排列（Column）
    - 不影响滚动结构（scroll structure）
    - 独立于 Table 的 DOM 结构
3. **瞬态 UI**
    - 出现于选择（selection）产生时
    - 消失于选择（selection）清空时
    - 不占用常驻空间

## 设计权衡

- **常驻 vs 条件出现 → 条件出现（减少视觉负担）**
    - 常驻：始终显示，占据空间，无选中时为空状态，增加视觉噪音
    - 条件出现：仅在有选中时出现，聚焦当前任务，减少干扰
    - 结论：选择条件出现，符合“瞬态 UI”原则
- **内嵌 vs 浮层 → 浮层（避免破坏 Table 流式布局）**
    - 内嵌：嵌入 Table 内部，会改变表格高度和布局，可能影响滚动位置
    - 浮层：浮动于 Table 之上，不改变 Table 布局，独立于滚动
    - 结论：选择浮层，确保不干扰表格主结构
- **底部浮层 vs 顶部吸附 → 底部浮层（接近操作区域）**
    - 顶部吸附：接近表头，但可能遮挡排序/筛选区域
    - 底部浮层：接近行操作区域，不遮挡关键功能
    - 结论：默认底部浮层，顶部吸附作为备选方案

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：分散式** | 批处理操作分散在工具栏、右键菜单 | 操作入口不集中，状态反馈弱 |
| **阶段二：固定工具栏** | 常驻工具栏，选中后激活按钮 | 占空间，无选中时空置 |
| **阶段三：当前版本** | 条件出现的浮层 BatchBar | 上下文驱动，轻量聚焦 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM and Others、DEV（前端/后端）。每一层都有明确的输入、输出和协作边界。

## UED

#### **须交付的设计资产**

| **资产** | **格式** | **说明** |
| --- | --- | --- |
| **组件标识** | FigJam / 文档 | 明确为“批处理栏 + 底部浮层 + 条件出现” |
| **批处理操作 Schema（Batch Actions Schema）** | JSON | 批处理操作按钮定义（key、label、type、icon） |
| **视觉规范** | Figma 变体 | 浮层样式（高度、背景、阴影、分割线）、按钮状态（默认/禁用/加载中） |
| **状态表现** | Figma 变体 | 隐藏/可见/操作禁用/操作加载中 |
| **响应式规范** | 设计稿 | 操作按钮过多时的折叠策略（溢出菜单） |
| **无障碍标注** | 设计稿 | 实时区域（aria-live）、焦点管理 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 资产示意图（视觉结构、状态变体、响应式折叠）     |
|                                                      |
|                                                      |
-------------------------------------------------------
图：BatchBar 的视觉结构（选中计数、操作组、清除按钮）、三种状态（隐藏/可见/禁用）
```

#### **详细交付指南**

1. **视觉结构**
    
    `BatchBar` 通常位于 Table **底部浮层**（首选）或 Table **顶部吸附层**（备选）
    
    ```
    ┌─────────────────────────────────────────────────────────────┐
    │  ✅ 已选 X 项  │  [删除]  [导出]  [···]  │  ✕ 清除选择  │
    │  ← 选中计数    │  ← 主操作组          │  ← 辅助操作    │
    └─────────────────────────────────────────────────────────────┘
    ```
    
    | **区域** | **内容** | **说明** |
    | --- | --- | --- |
    | 选中指示器（Selection Indicator） | “已选 X 项” | 中间，显示当前选中数量 |
    | 主操作区（Primary Actions） | 主要批处理操作按钮 | 右侧，高频操作（删除/导出/更新） |
    | 溢出菜单（Overflow Menu） | `···` 更多菜单 | 右侧，收纳低频操作 |
    | 清除选择（Clear Selection） | `✕` 清除选择 | 左侧，清空所有选中 |
2. **视觉规范**
    
    
    | **属性** | **规范** |
    | --- | --- |
    | 高度 | 40px（由密度决定） |
    | 浮层 | 阴影（Light Shadows） |
    | 背景 | `var(--effect-mask)` |
    | 分割线 | 中间 0.5px `var(--stroke-divider-page)` |
    | 圆角 | 底部圆角 `var(--scale-full)` |
    | 容器内边距 | 水平 `var(--scale-1)`，垂直 `var(--scale-1)` |
    | 加载 | 按钮上的“icon animation” |
    
    > **关键规则**：
    > 
    > - ❌ 不允许遮挡表头排序区域
    > - ❌ 不允许影响列宽
    > - ✔ 必须与 Table 滚动（scroll）解耦（独立于滚动容器）
    > - ✔ 必须支持响应式压缩（操作溢出折叠）
3. **状态表现**
    
    
    | **状态** | **表现** |
    | --- | --- |
    | `hidden`（隐藏） | 无选中行，BatchBar 不渲染 |
    | `visible`（可见） | 有选中行，BatchBar 显示，操作按钮可点击 |
    | `disabled-action`（操作禁用） | 选中行不符合操作条件（如无权限），对应按钮置灰 |
    | `loading-action`（操作加载中） | 操作执行中，按钮显示加载状态，禁用点击 |
4. **响应式规范**
    - 当操作按钮过多（>4 个）或容器宽度不足时：
    - 主操作区保留 **2 个核心按钮**（如“删除”、“导出”）
    - 其余操作收纳到 `···` **溢出菜单（Overflow Menu）** 中
    - 溢出菜单使用下拉菜单（`flotation`）展示
    - `BatchBar` 隐藏时完全移除 DOM，不占位
5. **出现与消失动效**
    - **出现（显示）**：淡入效果，透明度从 0 到 1，持续时间 150ms，缓动函数 ease-out
    - **消失（隐藏）**：淡出效果，透明度从 1 到 0，持续时间 150ms，缓动函数 ease-in
    - 动效应用于整个 BatchBar 容器

> ✅ 允许：设计不同状态变体、响应式折叠方案、底部/顶部两种位置、出现/消失淡入淡出动效
> 
> 
> ❌ 禁止：遮挡表头排序、影响列宽、无选中时显示 BatchBar
> 

## PM and Others

#### **须定义的内容清单**

| **条目** | **说明** | **示例** |
| --- | --- | --- |
| **批处理操作 Schema（Batch Actions Schema）** | 批处理操作按钮定义 | `{ key: "delete", label: "删除", type: "danger" }` |
| **选择规则（Selection Rules）** | 选择规则 | 是否允许跨页选择、是否允许全选、最大选择数量 |
| **操作权限矩阵（Action Permission Matrix）** | 每个操作所需的权限 | `delete → admin only` |
| **操作可撤销性** | 是否支持撤销（Undo） | `delete 不可撤销，需二次确认` |
| **异步操作反馈** | 操作执行后的反馈方式 | `export → Toast 提示“导出任务已创建”` |
| **操作后行为** | 操作完成后是否清空选中 | `delete → 清空选中；export → 保留选中` |

#### **详细交付指南（示例：订单列表批处理）**

1. **定义批处理操作 Schema（Batch Actions Schema）**：
    
    ```json
    {
      "actions": [
        { "key": "delete", "label": "删除", "type": "danger", "icon": "Trash" },
        { "key": "export", "label": "导出", "type": "default", "icon": "Download" },
        { "key": "update_status", "label": "更新状态", "type": "default", "icon": "Edit" }
      ]
    }
    ```
    
2. **定义选择规则（Selection Rules）**：
    
    
    | **规则** | **值** |
    | --- | --- |
    | 允许跨页选择 | 是（跨页选中需持久化） |
    | 允许全选 | 是（但受最大数量限制） |
    | 最大选择数量 | 100 行 |
3. **定义操作权限矩阵（Action Permission Matrix）**：
    
    
    | **操作（Action）** | **所需权限** |
    | --- | --- |
    | delete | `order:delete` |
    | export | `order:export` |
    | update_status | `order:update` |
4. **定义操作行为**：
    
    
    | **操作（Action）** | **二次确认** | **可撤销** | **操作后清空选中** | **反馈方式** |
    | --- | --- | --- | --- | --- |
    | delete | ✅ 必须 | ❌ 不可撤销 | ✅ 清空 | `Toast` 成功/失败 |
    | export | ❌ 不需要 | ❌ 不可撤销 | ❌ 保留 | `Toast`“导出任务已创建” |
    | update_status | ❌ 不需要 | ✅ 可撤销 | ❌ 保留 | `Toast` 成功/失败 |

> ✅ **允许**：定义操作 Schema、权限矩阵、选择规则
> 
> 
> ❌ **禁止**：允许无权限用户看到批处理操作入口（应直接隐藏或置灰）
> 

## DEV

- **核心架构**
    
    ```
    Table Selection Store
            ↓
    BatchBar (Consumer)
    ├── 选中指示器（Selection Indicator）
    ├── 操作组（Action Group）
    │   ├── 主操作区（Primary Actions）
    │   └── 溢出菜单（Overflow Menu）
    ├── 清除按钮（Clear Button）
    └── 加载覆盖层（Loading Overlay）
    ```
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 组件架构图                                |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：BatchBar 依赖 Table Selection Store，消费 selectedRows 状态
    ```
    
- **触发条件**
    
    ```tsx
    const visible = selectedRows.length > 0
    ```
    
    BatchBar 不拥有状态，它只消费 Table Selection Store 中的 `selectedRowIds`。
    
    ```tsx
    interface TableState {
      selectedRowIds: string[]
      // 其他表格状态...
    }
    ```
    
- **主要 Props API**
    
    
    | **Prop** | **类型** | **默认值** | **描述** |
    | --- | --- | --- | --- |
    | `selectedCount` | `number` | **必填** | 当前选中行数量 |
    | `actions` | `BatchAction[]` | **必填** | 批处理操作按钮配置 |
    | `onAction` | `(key: string) => Promise<void>` | **必填** | 操作执行回调 |
    | `onClear` | `() => void` | **必填** | 清除选中回调 |
    | `loading` | `boolean` | `false` | 是否正在执行操作 |
    | `disabledKeys` | `string[]` | `[]` | 禁用指定操作的 key 列表 |
    | `position` | `'top' | 'bottom'` | `'bottom'` | BatchBar 位置 |
    | `density` | `'compact' | 'default'` | `'default'` | 密度 |
    | `maxVisibleActions` | `number` | `4` | 主操作区最多显示按钮数，超出折叠 |
- **Vue 实现示例**
    
    ```html
    <template>
      <Transition name="batch-bar-fade">
        <div v-if="visible" class="batch-bar" :class="[position, density]">
          <span class="selection-indicator">
            ✅ 已选 {{ selectedCount }} 项
          </span>
    
          <div class="action-group">
            <!-- 主操作区：只显示前 N 个 -->
            <button
              v-for="action in visibleActions"
              :key="action.key"
              class="action-btn"
              :class="action.type"
              :disabled="isDisabled(action.key) || loading"
              @click="handleAction(action.key)"
            >
              <Icon :name="action.icon" />
              {{ action.label }}
            </button>
    
            <!-- 溢出菜单（Overflow Menu） -->
            <Dropdown v-if="overflowActions.length > 0">
              <template #trigger>
                <button class="more-btn">···</button>
              </template>
              <DropdownItem
                v-for="action in overflowActions"
                :key="action.key"
                :disabled="isDisabled(action.key) || loading"
                @click="handleAction(action.key)"
              >
                {{ action.label }}
              </DropdownItem>
            </Dropdown>
          </div>
    
          <button class="clear-btn" @click="onClear" :disabled="loading">
            ✕ 清除选择
          </button>
        </div>
      </Transition>
    </template>
    
    <script setup>
    import { computed } from 'vue'
    
    const visible = computed(() => props.selectedCount > 0)
    
    const visibleActions = computed(() => props.actions.slice(0, props.maxVisibleActions))
    const overflowActions = computed(() => props.actions.slice(props.maxVisibleActions))
    
    const handleAction = async (key) => {
      await props.onAction(key)
    }
    </script>
    
    <style>
    .batch-bar-fade-enter-active,
    .batch-bar-fade-leave-active {
      transition: opacity 150ms ease;
    }
    .batch-bar-fade-enter-from,
    .batch-bar-fade-leave-to {
      opacity: 0;
    }
    </style>
    ```
    
- **性能策略**
    - 选择防抖（selection debounce）：选中状态变化防抖 100ms，避免频繁渲染
    - 操作懒渲染（action lazy render）：操作按钮按需渲染，非可见时不渲染
    - 溢出菜单懒加载（overflow menu lazy mount）：下拉菜单内容懒加载
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 组件结构拆解图                            |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：列表各层级模块标注，突出底部批处理工具栏和操作列更多菜单
    ```
    

> ✅ **允许**：使用 store 监听 `selectedRows` 驱动显示
> 
> 
> ❌ **禁止**：手动控制 `show/hide`（必须由选择状态驱动）
> 
> ❌ **禁止**：绕过选择状态（selection state）直接绑定行 UI
> 
> ❌在 `BatchBar` 内部修改选择存储（selection store）（只读消费）
> 

---

# 4. 结构拆解

| **层级** | **组件** | **职责** |
| --- | --- | --- |
| Container | `BatchBarContainer` | 浮层容器，管理位置、阴影、背景 |
| 选中指示器（Selection Indicator） | `SelectionIndicator` | 显示“已选 X 项” |
| 操作组（Action Group） | `ActionGroup` | 操作按钮组，含主操作和溢出菜单 |
| 主操作按钮（Primary Action） | `PrimaryAction` | 主要操作按钮（删除/导出/更新） |
| 溢出菜单（Overflow Menu） | `OverflowMenu` | `···` 下拉菜单，收纳低频操作 |
| 清除按钮（Clear Button） | `ClearButton` | 清除选择按钮 |
| 加载覆盖层（Loading Overlay） | `LoadingOverlay` | 操作执行时的加载状态 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 结构拆解图                                |
|                                                      |
|                                                      |
-------------------------------------------------------
图：BatchBar 各层级模块标注
```

---

# 5.  变体与状态系统

## 变体

| **变体** | **说明** |
| --- | --- |
| `position: bottom` | 底部浮层（默认） |
| `position: top` | 顶部吸附层（备选） |
| `density: compact` | 紧凑模式（高度 32px） |
| `density: default` | 默认模式（高度 40px） |

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

## 状态

| **状态** | **说明** |
| --- | --- |
| `hidden`（隐藏） | 无选中行，不渲染 |
| `visible`（可见） | 有选中行，正常显示 |
| `disabled-action`（操作禁用） | 部分按钮因权限/条件禁用 |
| `loading-action`（操作加载中） | 操作执行中，所有按钮禁用 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 状态变体图（visible / disabled / loading）|
|                                                      |
|                                                      |
-------------------------------------------------------
图：三种状态的视觉表现
```

---

# 6. 交互行为

| **行为** | **触发** | **响应** |
| --- | --- | --- |
| 显示 BatchBar | 任意行被选中（`selectedCount > 0`） | 淡入动画 150ms |
| 隐藏 BatchBar | 所有行取消选中（`selectedCount === 0`） | 淡出动画 150ms |
| 点击操作按钮 | 点击主操作按钮或溢出菜单项 | 触发 `onAction(key)`，按钮进入加载状态 |
| 异步操作完成 | API 返回成功/失败 | 显示 Toast 反馈，按钮恢复正常 |
| 清除选择 | 点击“✕ 清除选择” | 触发 `onClear()`，清空所有选中 |
| 操作中点击其他按钮 | 任一操作执行中（loading） | 所有按钮禁用，阻止二次点击 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 交互流程图（显示→操作→反馈→清除）         |
|                                                      |
|                                                      |
-------------------------------------------------------
图：完整交互流程（选择 → BatchBar 显示 → 操作执行 → 反馈 → 清除）
```

---

# 7. 数据模型与逻辑

## 模式 Schema

```json
{
  "selectedCount": 12,
  "actions": [
    { "key": "delete", "label": "删除", "type": "danger" },
    { "key": "export", "label": "导出", "type": "default" }
  ],
  "loading": false,
  "disabledKeys": []
}
```

## 映射规则

| **字段** | **UI 表示** | **规则** |
| --- | --- | --- |
| `selectedCount` | “已选 X 项” | `> 0` 时显示 BatchBar |
| `actions` | 操作按钮组 | 最多显示 2 个，其余折叠到溢出菜单 |
| `loading` | 按钮加载状态 | `true` 时所有按钮禁用 |
| `disabledKeys` | 按钮禁用状态 | 对应 key 的按钮置灰不可点击 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 数据模型映射示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：数据 → UI 的映射关系
```

---

# 8. 使用规范

## 允许

- 选择状态（selection）驱动显示（`selectedCount > 0`）
- 操作（action）必须有权限控制（通过 `disabledKeys` 或权限系统）
- 批处理（batch）操作必须可追踪（有日志/审计）
- 操作完成后根据业务规则决定是否清空选中
- 删除等危险操作必须二次确认（由业务方在 `onAction` 中实现）

## 禁止

- 不允许手动控制显示/隐藏（show/hide）（必须由选择状态驱动）
- 不允许绕过选择状态（selection state）（不能直接绑定行 UI）
- 不允许在 BatchBar 内部修改选择存储（selection store）（只读消费）
- 不允许无权限用户看到可点击的操作入口（应直接隐藏或置灰）

## 约束

| **约束项** | **限制** |
| --- | --- |
| 最大选择数量 | 100 行（由业务方定义，默认不限制） |
| 主操作区按钮 | > 4 个（超出折叠到溢出菜单） |
| 操作执行防抖 | 300ms（避免重复点击） |
| 异步操作超时 | 30 秒（由业务方处理） |
| 撤销能力 | 由业务方实现 |

---

# 9. 开发实现

## 技术栈

- 框架：Vue 3 / React
- 状态管理：Table Selection Store（Pinia / Redux）
- 样式：CSS Variables + SCSS

## 依赖项

- Table Selection Engine（提供 `selectedRowIds`）
- Permission System（控制按钮可用性）
- API Batch Layer（执行批处理操作）

## **批处理流程**

```
选择行 → BatchBar 显示 → 点击操作 → 权限校验 → API 请求 → 更新 Table 状态 → 清空选中（可选）
```

## **关键实现要点**

- `BatchBar` 不拥有状态，只消费 `selectedRowIds`
- 操作执行时，所有按钮进入加载状态，阻止二次点击
- 异步操作完成后，根据结果展示 Toast 反馈

---

# 10. 组合与依赖关系

## 依赖项

- `eds-org-data-table-view` / `eds-org-data-list` / **其他组件**（提供选中状态）
- Selection Engine（管理选中状态）
- Permission Layer（权限校验）
- API Batch Service（批处理操作接口）

## 被依赖项

- 后台管理系统（订单管理、用户管理、商品管理）
- 数据管理平台（CRM / ERP）

## 组合规则

- **允许** ：
    - **允许**：与 `eds-org-data-table-view`、`eds-org-data-list` 及其他支持多选的组件组合使用
- **禁止** ：
    - 与无选择（selection）功能的组件组合
    - 与表单提交流程混合使用
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 组合关系示意图                            |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：BatchBar 与 Data Table / Selection Engine / Permission Layer / API Service 的组合关系
    ```
    

---

# 11. 无障碍

- **WCAG Level**：AA
- **实时区域（aria-live）**：选中状态变化时，使用 `aria-live="polite"` 朗读“已选 X 项”
- **键盘支持**：
    - Tab 键在操作按钮间导航
    - Enter / Space 触发操作
    - Escape 关闭溢出菜单
- **焦点管理**：
    - BatchBar 出现时，焦点不自动移动（避免打断用户）
    - 溢出菜单打开时，焦点限制（Focus Trap）在菜单内
- **按钮语义**：操作按钮使用 `aria-label` 描述具体操作（如“批量删除”）

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 无障碍 ARIA 标注示意图                    |
|                                                      |
|                                                      |
-------------------------------------------------------
图：实时区域（aria-live）、按钮 aria-label、键盘导航示意
```

---

# 12. 性能限制

| **指标** | **限制** | **备注** |
| --- | --- | --- |
| 最大选择数量 | 100 行 | 超过时提示用户分批操作 |
| 选择防抖（selection debounce） | 100ms | 避免频繁渲染 |
| 操作懒渲染（action lazy render） | 按需渲染 | 非可见时不渲染 |
| 溢出菜单懒加载（overflow menu lazy mount） | 点击时才加载 | 减少初始渲染开销 |
| 全表重渲染 | 禁止 | 使用 `shallowRef` / `React.memo` 隔离 |

---

# 13. 边界

| **场景** | **处理方式** |
| --- | --- |
| **选择 + 排序冲突（selection + sort conflict）** | 排序操作时应**保留选中状态**，但若数据重新加载，选中状态应清空（避免引用失效） |
| **跨页选择（selection across pagination）** | 跨页选择需在选择存储（Selection Store）中持久化 `selectedRowIds`，切换页面时保留选中。使用 sessionStorage 或 Pinia persist。 |
| **异步批处理部分失败（async batch partial failure）** | 批处理部分成功时，展示“成功 X 项，失败 Y 项”，失败项提供重试入口 |
| **操作中权限降级（permission downgrade mid-selection）** | 若用户权限在操作前被降级，操作按钮应置灰并提示“权限不足” |
| **快速切换选中** | 使用防抖（100ms）避免频繁显隐闪烁 |
| **操作执行中取消选择** | 操作执行中禁用清除选择按钮，防止状态混乱 |
| **空选（0项）** | `BatchBar` 自动隐藏 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 边界情况处理示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：跨页选择、部分失败、权限降级等边界处理示意
```

---

# 14. 拓展性

| **扩展点** | **方式** | **说明** |
| --- | --- | --- |
| **插件操作（Plugin Actions）** | 通过 `actions` 配置注入 | 业务方可自定义批处理操作 |
| **自定义操作处理器** | 通过 `onAction` 回调 | 业务方实现具体操作逻辑 |
| **跨表批量编排** | 多 Table 共享 Selection Store | 支持跨 Table 批处理操作 |
| **操作确认钩子** | `beforeAction` / `afterAction` | 操作前后插入自定义逻辑 |

**限制**：禁止绕过 Selection Store 直接传入 `selectedCount`（必须由 Store 驱动）

---

# 15. 生命周期与版本管理

## 当前版本

v1.0

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 新增 | 权限系统集成，支持基于角色的按钮禁用。优化样式来适配深浅色模式 | 无 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 无

## 迁移指南

1. 接入 Table Selection Store，提供 `selectedRowIds`
2. 将分散的批处理操作按钮统一配置为 `actions` Schema
3. 实现 `onAction` 回调，处理具体业务逻辑
4. 实现 `onClear` 回调，清空选中状态
5. 移除原有的工具栏批处理操作按钮