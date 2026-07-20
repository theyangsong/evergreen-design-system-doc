# 预览

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组件能力全景示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：标注了动态添加行、表格整体提交、依赖校验、状态机（idle/editing/submitting/success/error）等能力
```

# AI总结

```
-------------------------------------------------------
| 1、eds-org-data-table-edit 是可编辑表格：动态加行、整体提交，
|    由 Data Submission 引擎管理状态。
| 2、使用：填写各行 → 整体提交 → 引擎校验发送；可删行（至少
|    保留 1 行）；提交中全表只读。
| 3、可配置：列 Schema、dependencyGraph、操作列（固定/拖拽，
|    不支持排序）、DS Hook / 管线扩展。
| 4、行状态：idle / editing / submitting / success / error。
| 5、注意：仅整体提交；只读用 table-view；依赖须显式声明。
-------------------------------------------------------
```

# 1. 定位

`eds-org-data-table-edit` 是一个**可编辑的结构化数据表格**，用于动态创建和编辑业务数据。它的核心特征：

- **动态添加行**：表格默认展示 1 行（空数据），点击“添加行”按钮可无限制增加空白行
- **行级编辑**：所有行数据一次性提交，无行内保存按钮
- **状态机驱动**：每行拥有独立状态（`idle` / `editing` / `submitting` / `success` / `error`），由 Data Submission 引擎管理
- **依赖计算**：支持跨字段联动校验（如“总额 = 数量 × 单价”）
- **集成 Data Submission**：复用 `eds-biz-data-submission` 的状态机、管线、分类器能力
- 操作列：每行最右侧固定操作列，支持列固定、列宽拖拽等交互，与只读表格 `eds-org-data-table-view` 逻辑一致（但不支持排序）
- 删除行：每行操作列提供删除按钮，点击后移除当前行（若只有一行，禁止删除）

> 该组件与只读表格完全独立，不共享代码逻辑
> 

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 编辑表格核心能力图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：动态添加行、整体提交按钮、依赖校验示意
```

## 设计目标

- 提供动态添加行、行级编辑与提交的统一体验
- 集成 Data Submission 引擎，标准化提交流程
- 支持依赖校验（跨字段），实时反馈错误
- 支持无限制添加空白行（客户端动态增加）
- 保持与只读表格一致的列配置能力（宽度、列固定等），包含操作列的列固定、列宽拖拽交互，与只读表格逻辑一致，但**不支持排序**（编辑模式下排序易造成数据混乱）

## 解决的问题

- 批量创建数据场景（如批量录入加密货币价格、批量添加配置）缺乏统一组件
- 多行数据提交的状态管理混乱（loading、error 散落各处）
- 依赖校验逻辑重复实现，且与 UI 耦合
- 动态添加行时，整体提交需校验所有行

## 使用边界

### **可使用场景**

- 批量创建/编辑表单
- 批量添加配置项、标签
- 多行数据校验（如财务表格、配置表格）
- 需要动态增删行的数据录入场景

### **不适用场景**

- 纯只读展示 → 使用 `eds-org-data-table-view`
- 需要行级独立提交（每行单独保存） → 本组件仅支持整体提交

---

# 2. 设计决策与演进

## 设计原则

- 状态机外置：整体提交状态由 Data Submission 引擎管理，表格组件只消费状态
- 整体提交：所有行数据一次性提交，简化后端接口
- 依赖显式声明：跨行/跨字段依赖通过 `dependencyGraph` 声明，禁止硬编码
- 提交前校验：字段级校验（必填、格式） + 依赖校验，通过后才提交
- 提交时锁定：`submitting` 状态时整个表格只读，防重复提交
- 动态添加行：支持无限制添加空白行

## 设计权衡

- **整体提交 vs 行级独立提交 → 整体提交**
    - 整体提交：前端逻辑简单，后端接口统一，避免部分成功带来的复杂 UI
    - 行级独立提交：每行可单独保存，但增加前端状态复杂度和后端接口数量
    - 结论：为简化批量创建场景，选择整体提交
- **无横向滚动 vs 信息密度 → 支持横向滚动**
    - 无横向滚动：避免用户左右拖拽，但限制列数
    - 信息密度：通过横向滚动可显示更多列，满足复杂业务
    - 结论：支持横向滚动，允许用户自定义列宽和固定列
- **本地存储持久化 vs 隐私 → 只存储非敏感配置**
    - 本地存储持久化：保存列宽、固定列等用户偏好，提升体验
    - 隐私风险：存储内容可能包含敏感数据
    - 结论：只存储非敏感配置（列宽、固定列），不存储数据

## 演进记录

| **阶段** | **核心特征** | **存在的主要问题** |
| --- | --- | --- |
| **阶段一：静态表格** | 纯展示 | 无编辑能力 |
| **阶段二：单元格编辑** | 单元格直接编辑，无统一提交 | 状态混乱，无法批量提交 |
| **阶段三：当前版本** | 动态添加行 + 整体提交 + Data Submission 引擎 | 统一、可控 |

---

# 3. 使用者指南

本系统将角色分为三层：UED（交互/视觉）、PM and Others、DEV（前端/后端）。每一层都有明确的输入、输出和协作边界。

## UED

#### **须交付的设计资产**

| **资产** | **格式** | **说明** |
| --- | --- | --- |
| **Table 标识** | FigJam / 文档 | 明确为“可编辑表格 + 动态添加行 + 整体提交” |
| **Column UI Schema** | JSON | 每列的 `key`、`label`、`type`、`minWidth`、`editable` |
| **Field Schema** | JSON | 字段级校验规则（required、maxLength、min 等） |
| **依赖关系声明** | JSON | 跨行/跨字段联动校验条件 |
| **整体提交状态视觉** | Figma 变体 | 表格顶部提交按钮状态（idle / submitting / success / error） |
| **行状态视觉规范** | Figma 变体 | 正常行、错误行（红色背景） |
| **单元格编辑交互** | 设计稿 | 单击进入编辑、blur 校验、Enter 提交表格？注意：Enter 应触发表格整体提交？需要明确。通常建议 Enter 触发表格整体提交。但为了符合用户习惯，可以设计为：在任意单元格中按 Enter 触发表格整体提交。 |
| **添加行按钮** | 设计稿 | 表格上方或下方，“+ 添加行”按钮 |
| **错误反馈** | 设计稿 | 单元格红色背景 + Tooltip（字段级）；行级红色背景 + Toast（手动关闭） |
| **依赖校验错误反馈** | 设计稿 | 行级 Toast，说明依赖失败原因 |
| 操作列规范 | 设计稿 | 最右侧固定操作列，支持列固定、列宽拖拽，与只读表格一致（但无排序） |
| 删除行交互规范 | 设计稿 | 操作列中删除按钮样式、禁用状态 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 资产示意图（列配置、行状态、编辑交互、错误反馈）|
|                                                      |
|                                                      |
-------------------------------------------------------
图：Column Schema 结构、行状态变体、编辑交互、错误反馈示意
```

#### **详细交付指南**

1. **整体提交状态视觉**
    
    
    | **状态** | **UI 规则** | **触发条件** |
    | --- | --- | --- |
    | `idle` | 提交按钮正常 | 未提交 |
    | `editing` | 提交按钮可用 | 表格处于编辑模式（有未保存更改） |
    | `submitting` | 提交按钮显示加载中，禁用点击 | 提交中 |
    | `success` | 提交按钮短暂显示“成功”，恢复 idle | 提交成功 |
    | `error` | 提交按钮显示“失败”，可重试 | 提交失败 |
2. **行状态视觉规范**
    
    
    | **状态** | **UI 规则** | **触发条件** |
    | --- | --- | --- |
    | 正常行 | 白底 | 无错误 |
    | 错误行 | 整行浅红色背景，红色边框 | 该行至少一个字段校验失败或依赖失败 |
    
    > 禁止仅用颜色表达错误，必须配合 `Toast` 或 `Tooltip`
    > 
3. **单元格编辑交互**
    
    
    | **操作** | **行为** |
    | --- | --- |
    | 单击可编辑单元格（`editable: true`） | 进入编辑模式，显示输入框，聚焦，原值保留 |
    | 修改内容后按 Enter | 触发表格整体提交（若通过校验） |
    | 按 Escape | 取消编辑，恢复原值 |
    | 失焦（blur） | 触发字段级校验，若失败显示红色背景 + Tooltip，但不提交 |
    - 同时只能有一个单元格处于编辑状态
    - 编辑状态不影响其他行的样式
4. **整体提交按钮**
    - 位置：表格下方通用的Action
    - 交互：点击后触发表格整体提交，进入 `submitting` 状态，整个表格禁用编辑
    - 提交成功后，表格变为 `idle` 状态，可继续编辑
    - 提交失败时，显示错误 Toast，并高亮错误行/单元格
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |            📷 交互流程图                            |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：交互示意图
    ```
    
5. **错误反馈规范**
    - **字段级**：单元格背景色变为浅红色，鼠标悬停时显示 Tooltip，内容为具体错误文案
    - **行级**：整行背景浅红色，同时弹出一个 Toast（位于页面顶部或表格上方），显示错误摘要，需手动关闭
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |            📷 反馈流程图                            |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：反馈示意图
    ```
    
6. **动态添加行**
    - 表格默认显示 1 行（所有单元格为空，可编辑）
    - 表格上方或下方提供“+ 添加行”按钮，点击后在表格末尾增加一行空白行
    - 可无限添加行，无数量限制
7. **操作列规范**
    - 删除按钮：点击后**直接删除**当前行，无二次确认弹窗（立即生效）。若删除后表格为空，自动添加一行空白行
8. **其他交互**
    - 不支持排序：列标题不可点击排序
    - 列宽拖拽：允许，不影响编辑状态
    - 列固定：支持钉在左侧（最多1列），与只读表格一致
    - 删除行：删除按钮位置、样式。删除后自动聚焦下一行

> ✅ 允许：设计整体提交按钮状态、动态添加行、错误反馈组件
> 
> 
> ❌ 禁止：遗漏 `submitting` 态；使用纯文本表示错误；设计排序控件
> 

## PM and Others

#### **须定义的内容清单**

| **条目** | **说明** | **示例** |
| --- | --- | --- |
| **Table 归属的 Base**（可选） | 数据域 ID | `baseId: "crypto_price_base"` |
| **列定义** | 字段名、标签、是否可编辑 | `{ key: "symbol", label: "币种", editable: true }` |
| **字段校验规则** | 必填、格式、范围 | `{ required: true, min: 0 }` |
| **依赖关系** | 跨行/跨字段校验条件 | `price * quantity <= total_limit` |
| **提交策略** | 整体提交 | - |

#### **详细交付指南（示例：加密货币价格批量创建）**

1. 指定 Base：`baseId = "crypto_price_base"`
2. 提供 Column Schema：
    
    
    | **key** | **字段 label** | **类型 type** | **编辑 editable** | 最小宽度 minWidth |
    | --- | --- | --- | --- | --- |
    | `symbol` | 币种 | string | true | UED |
    | `price_usd` | 价格（USD） | number | true | UED |
    | `quantity` | 数量 | number | true | UED |
    | `total` | 总额 | number | false（计算字段） | UED |
3. 提供 Field Schema（字段级校验规则）：
    
    ```json
    {
      "symbol": { "required": true, "pattern": "^[A-Z]{3,5}$" },
      "price_usd": { "required": true, "min": 0 },
      "quantity": { "required": true, "min": 0.00000001 }
    }
    ```
    
    > Field Schema 内容清单：
    > 
    > - `required`：是否必填（布尔值）
    > - `pattern`：正则表达式校验（字符串）
    > - `min`：最小值（数字）
    > - `max`：最大值（数字）
    > - `minLength` / `maxLength`：字符串长度限制
    > - `custom`：自定义校验函数（可选，由开发实现）
4. 定义依赖关系（跨行/跨字段联动校验）：
    
    ```
    {
      "id": "total_calculation",
      "condition": "row.price_usd * row.quantity === row.total",
      "errorMessage": "总额必须等于价格 × 数量",
      "affectedFields": ["price_usd", "quantity", "total"]
    }
    ```
    
    > 依赖关系内容清单：
    > 
    > - `id`：唯一标识
    > - `condition`：校验条件表达式（字符串或函数，由开发解析）
    > - `errorMessage`：校验失败时的提示文案
    > - `affectedFields`：受影响的字段列表（用于高亮或错误定位）

> ✅ **允许**：定义校验规则、依赖关系、动态添加行的业务逻辑
> 
> 
> ❌ **禁止**：要求行级独立提交（本组件仅支持整体提交）；忽略依赖校验
> 

## DEV

- **核心架构**
    
    ```
    eds-org-data-table-edit
    ├── 表格容器（支持横向滚动、列固定）
    ├── Data Submission（整体状态）
    ├── 整体提交按钮
    ├── 表头（列标题、列宽拖拽，无排序）
    ├── Body（行渲染）
    │   ├── 行数据管理（受控组件）
    │   ├── 编辑模式（受控输入组件）
    │   └── 校验反馈组件（红色背景 + Tooltip/Toast）
    ├── 添加行按钮
    └── 空状态
    ```
    
    ```
    -------------------------------------------------------
    |                                                      |
    |                                                      |
    |         📷 组件架构图（含 Engine 集成）              |
    |                                                      |
    |                                                      |
    -------------------------------------------------------
    图：组件内部模块划分，突出整体提交引擎、行数据管理
    ```
    
- **主要 Props API**
    
    ```tsx
    // ============================================================
    // 类型定义
    // ============================================================
    
    /** 列定义 */
    interface Column {
      key: string;                    // 字段唯一标识
      label: string;                  // 列标题
      minWidth: number;               // 最小宽度（px），用于响应式/列宽拖拽
      editable: boolean;              // 是否可编辑
      type?: 'string' | 'number' | 'date' | 'select'; // 字段类型
      sortable?: boolean;             // 是否支持排序（默认 false，编辑表格不支持排序）
      resizable?: boolean;            // 是否支持列宽拖拽（默认 true）
      fixedable?: boolean;            // 是否允许固定到左侧（默认 false，仅操作列可设为 true）
      fixed?: boolean;                // 初始是否固定（仅由持久化或设计决定）
      options?: Array<{ label: string; value: any }>; // type 为 select 时的选项
    }
    
    /** 行数据 */
    interface Row {
      id: string;                     // 行唯一标识
      [key: string]: any;             // 动态字段，由 columns 中的 key 决定
    }
    
    /** 字段校验规则 */
    interface FieldSchema {
      required?: boolean;             // 是否必填
      pattern?: string;               // 正则表达式校验
      min?: number;                   // 最小值
      max?: number;                   // 最大值
      minLength?: number;             // 最小长度
      maxLength?: number;             // 最大长度
      custom?: (value: any) => boolean; // 自定义校验函数
      message?: string;               // 自定义错误文案
    }
    
    /** 依赖校验规则 */
    interface DependencyRule {
      id: string;                     // 唯一标识
      condition: string | ((data: any) => boolean); // 校验条件
      errorMessage: string;           // 校验失败时的提示文案
      affectedFields: string[];       // 受影响的字段列表
    }
    
    /** 批量提交结果 */
    interface SubmitResult {
      success: boolean;
      message?: string;
      data?: any;
    }
    
    // ============================================================
    // Props API
    // ============================================================
    
    interface DataTableEditProps {
      // ---------- 基础配置 ----------
      /** 所属 Base 的 ID（可选，用于权限控制） */
      baseId?: string;
    
      /** 列定义（必填） */
      columns: Column[];
    
      /** 行数据（初始至少包含一个空行） */
      rows: Row[];
    
      // ---------- 校验配置 ----------
      /** 字段级校验规则（可选） */
      fieldSchema?: Record<string, FieldSchema>;
    
      /** 依赖校验规则（可选） */
      dependencyGraph?: DependencyRule[];
    
      // ---------- 回调函数 ----------
      /** 整体提交函数（必填），接收所有行数据，返回 Promise */
      onSubmit: (data: Row[]) => Promise<SubmitResult>;
    
      /** 删除行回调（可选），返回 Promise 或 void */
      onDeleteRow?: (rowId: string) => Promise<void> | void;
    
      /** 行数据变更回调（可选），用于父组件同步数据 */
      onRowChange?: (rowId: string, newData: any) => void;
    
      /** 添加行回调（可选），默认在末尾增加空白行 */
      onAddRow?: (newRow: Row) => void;
    
      /** 自定义校验函数（可选），在 fieldSchema 和 dependencyGraph 之后执行 */
      customValidate?: (allRows: Row[]) => { valid: boolean; errors: any[] };
    
      // ---------- 列固定配置 ----------
      /** 固定列（最多1列），传入列的 key */
      primaryColumn?: string;
    
      // ---------- 样式配置 ----------
      /** 行高密度：'compact' | 'normal'，默认 'normal' */
      density?: 'compact' | 'normal';
    
      // ---------- 状态配置 ----------
      /** 整体加载状态（外部控制） */
      loading?: boolean;
    
      // ---------- 删除行控制 ----------
      /** 是否允许删除某行，返回 false 则禁用删除按钮 */
      canDeleteRow?: (row: Row, allRows: Row[]) => boolean;
    
      // ---------- 插槽（由实现框架决定） ----------
      /** 自定义单元格渲染插槽 */
      cellSlot?: (params: { column: Column; row: Row; value: any }) => React.ReactNode;
    
      /** 自定义操作列插槽 */
      actionSlot?: (params: { row: Row; onSave: () => void; onDelete: () => void }) => React.ReactNode;
    }
    ```
    
    | **Prop** | **类型** | **默认值** | **描述** |
    | --- | --- | --- | --- |
    | `baseId` | `string` | 可选 | 所属 Base 的 ID，用于权限控制 |
    | `columns` | `Column[]` | **必填** | 列定义（含 `key`, `label`, `minWidth`, `editable`、`fixedable`、`resizable`） |
    | `rows` | `Row[]` | **必填** | 行数据，初始至少包含一个空行 |
    | `fieldSchema` | `Record<string, FieldSchema>` | `{}` | 字段级校验规则 |
    | `dependencyGraph` | `DependencyRule[]` | `[]` | 依赖校验规则（跨字段联动） |
    | `onSubmit` | `(data: Row[]) => Promise<SubmitResult>` | **必填** | 整体提交函数，接收所有行数据 |
    | `onDeleteRow` | `(rowId: string) => Promise<void> | void` | 可选 | 删除行回调，删除后父组件需同步更新 `rows` |
    | `onRowChange` | `(rowId: string, newData: any) => void` | 可选 | 行数据变更回调，用于父组件同步数据 |
    | `onAddRow` | `(newRow: Row) => void` | 可选 | 添加行回调，默认在末尾增加空白行 |
    | `customValidate` | `(allRows: Row[]) => { valid: boolean; errors: any[] }` | 可选 | 自定义校验函数，在 `fieldSchema` 和 `dependencyGraph` 之后执行 |
    | `primaryColumn` | `string` | 可选 | 固定列（最多1列），传入列的 `key` |
    | `density` | `'compact' | 'normal'` | `'normal'` | 行高密度 |
    | `loading` | `boolean` | `false` | 整体加载状态（外部控制） |
    | `canDeleteRow` | `(row: Row, allRows: Row[]) => boolean` | `() => allRows.length > 1` | 默认最后一行禁用删除（`allRows.length <= 1` 时返回 `false`） |
    | `cellSlot` | `(params) => React.ReactNode` | 可选 | 自定义单元格渲染插槽 |
    | `actionSlot` | `(params) => React.ReactNode` | 可选 | 自定义操作列插槽 |
- **与 Data Submission 引擎集成**
    
    使用一个引擎实例管理整体提交状态：
    
    ```tsx
    const { state, submit, updateData, data, error } = useDataSubmission({
      initialData: rows,
      onSubmit: (allRows) => onSubmit(allRows),
      validate: (allRows) => customValidate(allRows, fieldSchema, dependencyGraph),
      dependencyGraph: globalDependencyGraph // 跨行依赖
    });
    ```
    
    - `data` 是整个表格的行数组
    - 每行编辑时，调用 `updateData` 更新对应行的数据
    - 提交时，引擎自动执行校验和依赖计算，然后调用 `onSubmit`
    - 删除操作不触发 Data Submission 引擎，直接操作 `data` 数组（删除行），由父组件同步更新
- **动态添加行**
    
    ```tsx
    const handleAddRow = () => {
      const newRow = { id: generateId(), ...emptyRowData };
      updateData([...data, newRow]);
    };
    ```
    
- **性能策略**
    - 使用虚拟滚动（行数 > 200）
    - 使用 `React.memo` 或 `shallowRef` 避免行重绘
    - 依赖校验防抖（300ms）

---

# 4. 结构拆解

| **层级** | **组件** | **职责** |
| --- | --- | --- |
| Container | `eds-org-data-table-edit` | 管理列配置、行数据、虚拟滚动 |
| Toolbar | `Toolbar` | 整体提交按钮、添加行按钮 |
| Header | `TableHeader` | 列标题、列宽拖拽（无排序） |
| Body | `TableBody` | 虚拟滚动容器 |
| Row | `TableRow` | 渲染单行（含编辑/只读单元格） |
| Cell Renderer | `TableCell` | 根据 `editable` 渲染输入框或文本 |
| Add Row Button | `AddRowButton` | 添加新行 |
| Action Column | `ActionColumn` | 删除操作通过 `row.id` 定位并移除数据 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组件结构拆解图                            |
|                                                      |
|                                                      |
-------------------------------------------------------
图：表格各层级模块标注，突出整体提交按钮和添加行按钮
```

---

# 5.  变体与状态系统

## 变体

- **样式**：支持 `compact`（36px）、`normal`（48px）行高
- **尺寸**：宽度 100%，高度自适应

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 行密度对比图（compact / normal）          |
|                                                      |
|                                                      |
-------------------------------------------------------
图：紧凑模式与正常模式下行高对比
```

## 状态

| **状态** | **说明** |
| --- | --- |
| `idle` | 未提交 |
| `editing` | 表格处于编辑模式（有未保存更改） |
| `submitting` | 表格提交中 |
| `success` | 提交成功（短暂闪烁） |
| `error` | 提交失败，显示错误 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|   📷 行状态视觉（default / hover / selected / loading）|
|                                                      |
|                                                      |
-------------------------------------------------------
图：四种状态的视觉表现
```

## **行状态**

- 正常行：无特殊背景。
- 错误行：整行浅红色背景（由校验结果决定，不独立于整体状态）

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 行状态视觉（正常 / 错误）                 |
|                                                      |
|                                                      |
-------------------------------------------------------
图：正常行白底，错误行浅红色背景 + 红色边框
```

---

# 6. 交互行为

| **行为** | **触发** | **响应** |
| --- | --- | --- |
| 进入编辑 | 单击可编辑单元格 | 显示输入框 |
| 编辑内容 | 修改输入框值 | 更新对应行数据，触发表单脏检查 |
| 整体提交 | 点击“提交”按钮或按 Enter | 执行整体校验 → 调用 `onSubmit` → 更新状态 |
| 取消编辑 | 按 Escape | 恢复原值，退出编辑模式 |
| 添加行 | 点击“+ 添加行”按钮 | 增加空白行，滚动到新行 |
| 列宽拖拽 | 拖拽列边界 | 实时调整，保存宽度 |
| 列固定 | 表头菜单“钉在左侧” | 固定列至左侧（最多1列） |
| 删除行 | 点击删除按钮 | **直接删除**该行数据，无二次确认 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 关键交互流程示意图（编辑→整体提交）       |
|                                                      |
|                                                      |
-------------------------------------------------------
图：单元格编辑、整体提交按钮、成功/失败反馈流程
```

---

# 7. 数据模型与逻辑

## 模式 Schema

```json
{
  "baseId": "crypto_price_base",
  "columns": [
    {
      "key": "symbol",
      "label": "币种",
      "minWidth": 100,
      "editable": true,
      "sortable": false,
      "resizable": true,
      "fixedable": false
    },
    {
      "key": "price_usd",
      "label": "价格（USD）",
      "minWidth": 120,
      "editable": true,
      "type": "number",
      "sortable": false,
      "resizable": true,
      "fixedable": false
    },
    {
      "key": "quantity",
      "label": "数量",
      "minWidth": 100,
      "editable": true,
      "type": "number",
      "sortable": false,
      "resizable": true,
      "fixedable": false
    },
    {
      "key": "total",
      "label": "总额",
      "minWidth": 120,
      "editable": false,
      "type": "number",
      "sortable": false,
      "resizable": true,
      "fixedable": false
    },
    {
      "key": "action",
      "label": "操作",
      "minWidth": 120,
      "editable": false,
      "sortable": false,
      "resizable": true,
      "fixedable": true,
      "fixed": false
    }
  ],
  "fieldSchema": {
    "symbol": { "required": true, "pattern": "^[A-Z]{3,5}$" },
    "price_usd": { "required": true, "min": 0 },
    "quantity": { "required": true, "min": 0.00000001 }
  },
  "dependencyGraph": [
    {
      "id": "total_calculation",
      "condition": "row.price_usd * row.quantity === row.total",
      "errorMessage": "总额必须等于价格 × 数量",
      "affectedFields": ["price_usd", "quantity", "total"]
    }
  ],
  "rows": [
    {
      "id": "temp_1",
      "symbol": "",
      "price_usd": "",
      "quantity": "",
      "total": ""
    }
  ]
}
```

**操作列配置说明：**

| **属性** | **值** | **说明** |
| --- | --- | --- |
| `key` | `"action"` | 固定列标识，用于渲染操作按钮 |
| `label` | `"操作"` | 列标题 |
| `minWidth` | `120` | 操作列最小宽度，确保按钮完整显示 |
| `editable` | `false` | 操作列不可编辑 |
| `sortable` | `false` | 操作列不支持排序 |
| `resizable` | `true` | 操作列支持列宽拖拽调整 |
| `fixedable` | `true` | 操作列支持固定到左侧 |
| `fixed` | `true` | 初始固定 |

## 映射规则

| **字段** | **UI** | **规则** |
| --- | --- | --- |
| `editable: true` | 可编辑单元格显示输入框 | 单击进入编辑 |
| `fieldSchema` | 实时校验，错误时单元格红色背景 + Tooltip | 失焦或提交时触发 |
| `dependencyGraph` | 行级错误 Toast | 提交前计算，失败阻止提交并显示 Toast |
| `state` | 整体提交按钮状态 | 由 Engine 驱动 |
| `onDeleteRow` | 删除操作 | 删除操作通过 `row.id` 定位并移除数据 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 数据模型映射示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：Schema → UI 的映射关系，校验规则驱动错误反馈
```

---

# 8. 使用规范

## 允许

- 必须为可编辑列提供 `fieldSchema` 校验规则
- 依赖关系必须在 `dependencyGraph` 中显式声明
- 整体提交后自动清空编辑状态（由父组件控制）
- 动态添加行无数量限制
- 删除行直接生效，无二次确认

## 禁止

- 禁止在编辑状态下排序（组件不支持排序）
- 禁止绕过 Data Submission 引擎直接修改行数据
- 禁止行级独立提交（仅支持整体提交）
- 禁止删除最后一行（至少保留一行空白行）

## 约束

| **约束项** | **限制** |
| --- | --- |
| 最大行数 | 建议不超过 500（虚拟滚动） |
| 最小行数 | 1 |
| 最大列数 | 50 |
| 同时编辑单元格数 | 1 |

---

# 9. 开发实现

## 技术栈

- 框架：Vue 3 / React
- 状态管理：组件内部 + Data Submission Engine
- 样式：CSS Variables

## **核心实现要点**

- 用一个 Engine 实例管理整体提交状态
- 行数据存储在 `data` 数组中，每行编辑通过 `updateData` 更新
- 提交时调用 `onSubmit`，传入所有行数据
- 依赖校验可跨行（例如某行价格不能超过全局上限）
- 添加行时生成唯一 `id`

| **属性 Prop** | **类型 Type** | **默认值 Default** | **描述 Desc** |
| --- | --- | --- | --- |
| `baseId` | `string` | 可选 | 所属 Base 的 ID，用于权限控制 |
| `columns` | `Column[]` | **必填** | 列定义（含 `key`、`label`、`minWidth`、`editable`、`fixedable`、`resizable`） |
| `rows` | `Row[]` | **必填** | 行数据，初始至少包含一个空行 |
| `fieldSchema` | `Record<string, FieldSchema>` | `{}` | 字段级校验规则 |
| `dependencyGraph` | `DependencyRule[]` | `[]` | 依赖校验规则（跨字段联动） |
| `onSubmit` | `(data: Row[]) => Promise<SubmitResult>` | **必填** | 整体提交函数，接收所有行数据 |
| `onDeleteRow` | `(rowId: string) => Promise<void> | void` | 可选 | 删除行回调，删除后父组件需同步更新 `rows` |
| `onRowChange` | `(rowId: string, newData: any) => void` | 可选 | 行数据变更回调，用于父组件同步数据 |
| `onAddRow` | `(newRow: Row) => void` | 可选 | 添加行回调，默认在末尾增加空白行 |
| `customValidate` | `(allRows: Row[]) => { valid: boolean; errors: any[] }` | 可选 | 自定义校验函数，在 `fieldSchema` 和 `dependencyGraph` 之后执行 |
| `primaryColumn` | `string` | 可选 | 固定列（最多1列），传入列的 `key` |
| `density` | `'compact' | 'normal'` | `'normal'` | 行高密度 |
| `loading` | `boolean` | `false` | 整体加载状态（外部控制） |
| `canDeleteRow` | `(row: Row, allRows: Row[]) => boolean` | `() => allRows.length > 1` | 控制删除按钮是否禁用，默认最后一行禁用（`allRows.length <= 1` 时禁用） |
| `cellSlot` | `(params: { column: Column; row: Row; value: any }) => React.ReactNode` | 可选 | 自定义单元格渲染插槽 |
| `actionSlot` | `(params: { row: Row; onDelete: () => void }) => React.ReactNode` | 可选 | 自定义操作列插槽 |

## 性能

- 行数 > 200 时启用虚拟滚动”
- 使用 `React.memo` 或 `shallowRef` 避免行重绘

---

# 10. 组合与依赖关系

## 依赖项

- `eds-biz-data-submission`（Data Submission 引擎）
- `eds-org-data-table-view`（共享基础样式，不共享逻辑）

## 被依赖项

- 后台管理系统（加密货币价格管理、配置管理）
- 面向用户的客户端（加密资产记录、订单列表等）

## 组合规则

- 不允许与 `Pagination` 组合
- 禁止与只读表格混合使用（因动态添加行与分页逻辑冲突，本组件不与 `Pagination` 组合使用）

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 组合关系示意图                            |
|                                                      |
|                                                      |
-------------------------------------------------------
图：表格组合
```

---

# 11. 无障碍

- WCAG Level：AA
- 编辑单元格时，使用 `aria-label="编辑"`
- 错误区域使用 `role="alert"`（Toast）或 `aria-describedby`
- 键盘支持：Tab 导航，Enter 提交，Escape 取消
- Toast 使用 `role="status"` 或 `aria-live="polite"`

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 无障碍 ARIA 标注示意图                    |
|                                                      |
|                                                      |
-------------------------------------------------------
图：ARIA 标注位置、键盘 Tab 导航示意
```

---

# 12. 性能限制

| **指标** | **限制** | **备注** |
| --- | --- | --- |
| 最大行数 | 建议 ≤ 500 | 超出需虚拟滚动 |
| 虚拟滚动 | 行数 > 200 时必须 | - |
| 提交数据量 | 所有行数据 | 后端需支持批量接口 |

---

# 13. 边界

| **场景** | **处理方式** |
| --- | --- |
| 编辑中用户刷新页面 | 数据丢失（可集成草稿保存，暂不支持） |
| 依赖校验失败 | 阻止提交，显示行级 Toast，单元格红色背景+Tooltip |
| 提交时网络错误 | 整体状态 → `error`，显示 Toast，用户可重试 |
| 添加行时超出虚拟滚动阈值 | 自动滚动到新行位置 |
| 空表格（至少保留一行） | 删除最后一行时**操作被阻止**，Toast 提示“至少保留一行，无法删除，删除行直接生效，无二次确认。最后一行删除按钮禁用 |

```
-------------------------------------------------------
|                                                      |
|                                                      |
|         📷 边界情况处理示意图                        |
|                                                      |
|                                                      |
-------------------------------------------------------
图：依赖校验失败、网络错误、添加行滚动等边界处理
```

---

# 14. 拓展性

| **扩展点** | **方式** |
| --- | --- |
| 自定义单元格编辑器 | 通过 `cellEditor` 插槽 |
| 自定义校验规则 | 扩展 `fieldSchema` 或 `dependencyGraph` |
| 添加行前校验 | 通过 `canAddRow` 回调 |

---

# 15. 生命周期与版本管理

## 当前版本

v1.0

## 变更日志

| 版本  | 变更时间 | 变更类型 | 描述 | 影响 |
| --- | --- | --- | --- | --- |
| v1.0 | 2026 Q2 | 新增 | 基于 Data Submission 引擎的可编辑表格，支持动态添加行、整体提交 | 无 |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 已弃用

- 无

## 迁移指南

1. 引入 `eds-biz-data-submission`
2. 将整体提交逻辑封装为 `onSubmit`，接收所有行数据
3. 抽取校验规则为 `fieldSchema` 和 `dependencyGraph`
4. 调整 UI 以适配整体提交状态（提交按钮）