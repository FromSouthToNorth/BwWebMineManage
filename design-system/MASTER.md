# BwWebMineManage 设计系统

> 煤矿安全监测系统 — 工业级监控仪表盘
> 生成日期: 2026-06-12

---

## 目录

- [品牌与设计理念](#品牌与设计理念)
- [配色系统](#配色系统)
- [字体排版](#字体排版)
- [布局与栅格](#布局与栅格)
- [组件规范](#组件规范)
- [图表规范](#图表规范)
- [动效规范](#动效规范)
- [无障碍](#无障碍)
- [反模式](#反模式)
- [附录：CSS 变量映射](#附录css-变量映射)

---

## 品牌与设计理念

| 维度 | 定义 |
|------|------|
| **产品定位** | 煤矿安全生产综合监控管理平台 |
| **目标用户** | 监控中心调度员、安全管理人员、矿领导、巡检人员 |
| **使用场景** | 监控大屏（7×24h）、PC 管理端、移动巡检端 |
| **核心价值** | 实时感知、快速告警、数据驱动决策 |
| **设计关键词** | 专业、清晰、可靠、高效、科技感 |

### 设计原则

1. **安全信号优先** — 告警状态必须在任何界面中一眼可辨
2. **数据密度平衡** — 信息丰富但不拥挤，关键指标突出
3. **暗色优先** — 监控室环境以深色为主，浅色模式作为辅助
4. **一致性** — 跨 PC/移动端保持统一的设计语言

---

## 配色系统

### 语义色（安全色）— 最高优先级

安全色在整个系统中具有固定语义，**不得**在不同上下文中重新定义：

| 状态 | 色值 (Dark) | 色值 (Light) | CSS 变量 | 用途 |
|------|-------------|-------------|----------|------|
| 🟢 正常 | `#22C55E` | `#16A34A` | `--color-success` | 设备运行正常、数据在阈值内 |
| 🟡 警告 | `#EAB308` | `#D97706` | `--color-warning` | 参数偏离但可控 |
| 🔴 报警 | `#EF4444` | `#DC2626` | `--color-danger` | 需立即处理的告警 |
| 🔵 信息 | `#3B82F6` | `#2563EB` | `--color-primary` | 主要操作、链接、信息提示 |
| ⚪ 离线 | `#6B7280` | `#6B7280` | `--color-info` | 设备断线、未知状态 |

**核心规则：** 安全色使用 `--color-{success/warning/danger}` 变量，而非硬编码。红色**只能**用于报警状态。

### 主色（品牌色）

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--color-primary` | `#3B82F6` | `#2563EB` | 主按钮、激活态、链接 |
| `--color-primary-light` | `#60A5FA` | `#3B82F6` | 悬停态、高亮 |
| `--color-primary-dark` | `#2563EB` | `#1D4ED8` | 按下态 |
| `--color-primary-gradient` | `linear-gradient(135deg, #3b82f6, #2563eb)` | 同上 | 渐变元素 |

### 强调色

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--color-accent` | `#EA580C` | `#EA580C` | 特殊标记、选中态备选 |
| -- | `#8B5CF6` | `#7C3AED` | 图表强调、筛选激活 |

### 暗色模式核心色板

```
Background hierarchy (沉浸感优先):
  bg-primary:   #070B15  → 最底层
  bg-secondary: #0F1729  → 页面背景
  bg-card:      #141D2F  → 卡片/面板
  bg-elevated:  #1E2A45  → 弹窗/下拉/悬浮层

Text hierarchy (高对比度):
  text-primary:   #F0F2F5  → 正文、标题
  text-secondary: #94A3B8  → 次要信息
  text-muted:     #64748B  → 辅助文字、禁用
```

### 浅色模式核心色板

```
Background hierarchy:
  bg-primary:   #F1F5F9  → 页面背景
  bg-secondary: #FFFFFF  → 卡片/面板
  bg-card:      #FFFFFF  → 卡片 (同上，保持白色)
  bg-elevated:  #FFFFFF  → 弹窗

Text hierarchy:
  text-primary:   #1E293B  → 正文、标题
  text-secondary: #64748B  → 次要信息
  text-muted:     #94A3B8  → 辅助文字
```

### 图表色板 (ECharts)

```css
--chart-1: #3B82F6  --chart-2: #22C55E  --chart-3: #EAB308
--chart-4: #EF4444  --chart-5: #8B5CF6  --chart-6: #EC4899
--chart-7: #14B8A6  --chart-8: #F97316
```

---

## 字体排版

### 字体栈

| 角色 | 字体 | 权重 | 回退 |
|------|------|------|------|
| UI 中文 | `PingFang SC` | 400/500/600/700 | `Microsoft YaHei`, sans-serif |
| UI 英文/数字 | `Inter` | 400/500/600/700 | -apple-system, sans-serif |
| 数据/等宽 | `JetBrains Mono` | 400/600 | Consolas, monospace |

**定义:** `--font-family` 和 `--font-mono`

### 字号层级

```css
--font-size-xs:  11px  → 标签、单位、辅助信息
--font-size-sm:  13px  → 表格内容、次要文字
--font-size-base:14px  → 正文（默认）
--font-size-lg:  16px  → 卡片标题、导航
--font-size-xl:  20px  → 页面标题
--font-size-xxl: 26px  → 监控主数值
--font-size-hero:32px  → 大屏关键指标 (新增)
```

### 行高规范

- 正文: `1.6`
- 表格: `1.4`
- 标题: `1.3`
- 数据展示: `1.2`
- 行高可与 `line-height` 工具类配合

### 数据展示规范

- 监控数值必须使用 `JetBrains Mono` 等宽字体
- 数字对 `letter-spacing: 1px` 提升可读性
- 单位使用 `--font-size-sm` + `--text-muted`

---

## 布局与栅格

### 页面结构

```
┌──────────────────────────────────────────┐
│  Sidebar (240px / 64px collapsed)         │
│  ┌────────────────────────────────────┐   │
│  │  TopBar (导航 + 操作)               │   │
│  ├────────────────────────────────────┤   │
│  │                                    │   │
│  │  Page Content                      │   │
│  │  ├── KPI Bar (metric-grid)         │   │
│  │  ├── Filter/Query Card             │   │
│  │  ├── Content Area                  │   │
│  │  │   ├── Chart Panel               │   │
│  │  │   └── Table / Card Grid         │   │
│  │  └── Pagination                    │   │
│  │                                    │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 间距系统

```css
--spacing-xs:  4px    → 紧凑元素间距
--spacing-sm:  8px    → 标签间距、图标间距
--spacing-md:  16px   → 卡片内边距、元素间距
--spacing-lg:  24px   → 区块间距、卡片间距
--spacing-xl:  32px   → 页面内边距、大区块间距
```

### 圆角系统

```css
--radius-sm:  6px   → 按钮、输入框、标签
--radius-md:  10px  → 卡片、面板、弹窗
--radius-lg:  16px  → 大弹窗、特殊容器
--radius-xl:  20px  → 全圆角元素
```

### z-index 层级

```css
--z-content:   10    → 页面内容
--z-sticky:    20    → 固定导航、侧边栏
--z-dropdown:  30    → 下拉菜单、Popover
--z-overlay:   50    → Modal / Dialog
--z-notify:    100   → 通知 / Message
--z-loading:   200   → Loading 全局遮罩
```

### 响应式断点

| 断点 | 宽度 | 目标设备 |
|------|------|---------|
| xs | `< 768px` | 手机 |
| sm | `768px` | 平板竖屏 |
| md | `1024px` | 平板横屏 / 小屏 PC |
| lg | `1280px` | PC 标准 |
| xl | `1536px` | 监控大屏 |

---

## 组件规范

### 1. 监控卡片 (MonitorCard)

**用途:** 监测点数据展示（核心组件）

```
┌─────────────────────┐
│ 设备名称        🔴报警│
│                     │
│    23.5  (数值)      │
│                     │
│ [瓦斯] [#1 分站]     │
│                     │
│    [详情 | 历史]     │  ← hover 显示
└─────────────────────┘
```

**规范:**
- 宽高比: `280px` 最小宽度，高度自适应
- 状态装饰: 左侧 4px 彩色指示条
- 数值: `--font-mono` `--font-size-xxl` `font-weight: 700`
- hover: `translateY(-2px)` + `box-shadow` 增强
- 告警态: 红色边框 + 脉冲动画
- 适用: PC 端监测列表

### 2. 告警徽标 (AlarmBadge)

**用途:** 告警状态标记

| 状态 | 样式 | 动画 |
|------|------|------|
| 正常 | 绿色 6px 实心圆 dot | 无 |
| 警告 | 黄色 6px dot | 慢速呼吸 (2s) |
| 报警 | 红色 6px dot + badge | 快速脉冲 (1.5s) |
| 离线 | 灰色 6px 空心圆 | 无 |

文字 badge (用于卡片内部):
```css
background: rgba(239, 68, 68, 0.15);
color: var(--color-danger);
border: 1px solid rgba(239, 68, 68, 0.2);
border-radius: 10px;
padding: 2px 8px;
```

### 3. KPI 指标栏 (KpiBar)

**用途:** 页面顶部的关键统计指标

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📊 监测总数│ │🔔 报警点数│ │✅ 运行正常│ │⚠️ 异常设备│
│   128     │ │    3     │ │   125    │ │    7     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**规范:**
- 排列: 水平排列，中间分隔线
- 图标: 左侧 36px 圆底图标容器
- 数值: `--font-mono` `--font-size-xxl` `font-weight: 700`
- 报警数值: `--color-danger` + `text-shadow`
- 正常数值: `--color-success`

### 4. 表格 (Table)

Element Plus 表格覆盖规范:
- 表头: 深色背景 `--table-header-bg`，字体 `--font-size-sm`，weight 600
- 表头底部: 2px 渐变装饰条
- 行高: 44px（触摸友好）
- 字体: 14px
- 斑马纹: 交替行背景
- 悬停: 高亮 + 左侧 3px 蓝色指示条
- 固定首列: 设备名或位置

### 5. 详情弹窗 (DetailDialog)

```
┌─────────────────────────────────┐
│ 🛈 监测点详情                    │
│     1# 瓦斯传感器                │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │       23.5          正常 🟢 │ │  ← hero 区
│ └─────────────────────────────┘ │
│ ┌──────────┐ ┌──────────┐      │
│ │ 分站 #1  │ │ 类别 瓦斯 │      │  ← 信息网格
│ │ 区域 A区  │ │ 地点 ... │      │
│ │ 阈值 1.0 │ │ 标识 ... │      │
│ └──────────┘ └──────────┘      │
└─────────────────────────────────┘
```

**规范:**
- `glass-dialog` 类: 毛玻璃背景 (`--glass-bg`)
- 头部: 图标 + 标题 + 副标题
- Hero 区: 大数值 + 状态色背景
- 信息网格: 2 列 grid，`gap: 12px`

### 6. 查询卡片 (QueryCard)

**用途:** 筛选条件区域

- 背景: `--bg-card`
- 内边距: `--spacing-md` `--spacing-lg`
- 边框: `--border-color`
- hover: 边框轻微高亮 + `--shadow-md`
- Element Plus 的 `el-form` 内联模式 `inline`

### 7. 分页 (Pagination)

当前已有一个 `Pagination/index.vue` 组件。规范:
- 居中显示
- 按钮圆角 `--radius-sm`
- 激活页: `--color-primary` 背景
- 间隔: `2px`

---

## 页面规范

### 安全监控页面 (safetyMonitoring)

```
┌───────────────────────────────────────┐
│  KPI 栏: 监测总数 | 报警 | 正常 | 异常   │
├───────────────────────────────────────┤
│  统计图区域 (ECharts 柱状图 + 饼图)      │
├───────────────────────────────────────┤
│  筛选条件 (分站/类型/类别/区域/站点)      │
├───────────────────────────────────────┤
│  监测卡片网格 (auto-fill minmax(280px)) │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│  │卡 1  │ │卡 2  │ │卡 3  │ │卡 4  │    │
│  └─────┘ └─────┘ └─────┘ └─────┘    │
├───────────────────────────────────────┤
│  分页                                   │
└───────────────────────────────────────┘
```

### 人员定位页面 (personnel_location)

```
┌───────────────────────────────────────┐
│  KPI 栏: 井下人数 | 设备数 | 报警       │
├───────────────────────────────────────┤
│  ├── 饼图 (区域分布)                    │
│  ├── 柱状图 (趋势)                     │
│  └── 表格 (人员列表/设备列表)            │
└───────────────────────────────────────┘
```

### 矿压监测页面 (minePressure)

```
┌───────────────────────────────────────┐
│  KPI 栏: 支架数 | 压力超限 | 正常       │
├───────────────────────────────────────┤
│  ├── 折线图 (压力趋势)                  │
│  ├── 热力图 (支架分布)                  │
│  └── 表格 (支架压力列表)                │
└───────────────────────────────────────┘
```

---

## 图表规范

### ECharts 通用设置

```javascript
// 暗色模式默认
{
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderColor: 'rgba(148,163,184,0.15)',
    textStyle: { color: '#f0f2f5', fontSize: 12 }
  },
  grid: { top: 24, bottom: 28, left: 48, right: 16 },
  textStyle: { fontFamily: '"Inter", "PingFang SC", sans-serif' }
}
```

### 图表类型选择指南

| 数据类型 | 推荐图表 | 说明 |
|---------|---------|------|
| 单分类对比 | 柱状图 | 瓦斯浓度对比、产量对比 |
| 占比分布 | 饼图/环形图 | 区域分布、工种分布 |
| 时间趋势 | 折线图 | 压力趋势、浓度变化 |
| 多系列对比 | 分组柱状图 | 多日对比、多站点对比 |
| 二维分布 | 热力图 | 支架压力分布、工作面分布 |
| 累计对比 | 堆叠柱状图 | 产量构成、时间累计 |
| 实时数据 | 仪表盘/Gauge | 单点实时值展示 |

### 图表交互规范

- tooltip 始终显示精确数值（`trigger: 'axis'`）
- 图例可点击筛选
- 数据为空时显示 "暂无数据"，不显示 0
- 首次渲染动画: 800~1000ms
- 数据更新动画: 300ms

---

## 动效规范

| 场景 | 时长 | 缓动函数 | 属性 |
|------|------|----------|------|
| hover 状态 | 150ms | ease | color, background, border |
| 卡片悬浮 | 200ms | ease-out | transform, box-shadow |
| 面板展开 | 200ms | ease-in-out | height, opacity |
| Modal 显隐 | 250ms | ease-out | opacity, transform |
| 路由切换 | 200ms | ease | opacity |
| 数值更新 | 300ms | ease-out | 数字、图表数据 |
| 告警闪烁 | 1.5s | ease-in-out | opacity (pulse) |
| 实时指示器 | 2s | ease-in-out | opacity (live-pulse) |

**尊重 `prefers-reduced-motion`**: 当存在媒体查询时，关闭所有非必要动画。

---

## 无障碍规范

| 类别 | 标准 |
|------|------|
| 对比度 | 正文 ≥ 4.5:1，大文本 ≥ 3:1 |
| 焦点指示 | 所有交互元素 `outline: 2px solid --color-primary` |
| Tab 顺序 | 匹配视觉顺序 |
| 语义色 | 红色/绿色从不单独使用，配合图标/文字说明 |
| 触摸目标 | ≥ 44x44px（移动端），告警按钮 ≥ 48px |
| 图片 | 有意义的图片加 `alt` 描述 |
| 表单 | 使用 `<label>` 标签 + `for` 属性 |

---

## 反模式（避免）

### ❌ 视觉与交互
- **过度玻璃拟态** — 降低数据可读性，卡片透明度应 ≥ 0.85
- **装饰性渐变** — 纯装饰渐变干扰数据层级
- **夸张动效** — 实时监控场景减少非必要动画
- **缩放导致布局抖动** — hover 使用 `box-shadow`/`color`，避免 `scale` 触发重排

### ❌ 色彩
- **红色用于非告警元素** — 红色只能表示危险/报警
- **安全色在不同上下文含义不同** — 绿=正常，黄=警告，红=报警，全局一致
- **低对比度文字** — 正文永不使用 `--text-muted` 色值

### ❌ 数据
- **空数据显示 0** — 应显示 "--" 或 "无数据"
- **缺少 loading 态** — 异步请求必须有加载指示
- **告警无配套文字** — 颜色不能作为唯一告警指示

### ❌ 布局
- **横向滚动** — 确保所有内容适配视口宽度
- **内容被固定导航遮挡** — 页面容器需 `padding-top` 留出导航高度

---

## 附录: CSS 变量映射

### 当前 CSS 变量完整清单

```css
/* 语义色 */
--color-primary, --color-primary-light, --color-primary-dark, --color-primary-gradient
--color-success, --color-success-light, --color-success-glow
--color-warning, --color-warning-light, --color-warning-glow
--color-danger, --color-danger-light, --color-danger-glow
--color-info, --color-accent, --color-accent-light, --color-accent-glow

/* 背景 */
--bg-primary, --bg-secondary, --bg-card, --bg-card-hover
--bg-elevated, --bg-hover, --bg-mask, --bg-gradient

/* 文字 */
--text-primary, --text-secondary, --text-muted, --text-inverse

/* 边框 */
--border-color, --border-color-light, --border-active

/* 阴影 */
--shadow-sm, --shadow-md, --shadow-lg
--shadow-glow-primary, --shadow-glow-danger, --shadow-glow-success

/* 毛玻璃 */
--glass-bg, --glass-border, --glass-blur

/* 圆角 */
--radius-sm, --radius-md, --radius-lg, --radius-xl

/* 间距 */
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl

/* 字体 */
--font-family, --font-mono
--font-size-xs, --font-size-sm, --font-size-base, --font-size-lg, --font-size-xl, --font-size-xxl

/* 侧边栏 */
--sidebar-width, --sidebar-bg, --sidebar-text, --sidebar-active
--sidebar-active-bg, --sidebar-border

/* 表格 */
--table-header-bg, --table-header-text
--table-row-odd, --table-row-even, --table-row-hover
--table-border, --table-row-separator

/* 图表 */
--chart-grid, --chart-text

/* 滚动条 */
--scrollbar-thumb, --scrollbar-thumb-hover, --scrollbar-track

/* 过渡 */
--transition-fast, --transition-base, --transition-slow

/* 需要新增的变量 */
--z-content: 10
--z-sticky: 20
--z-dropdown: 30
--z-overlay: 50
--z-notify: 100
--z-loading: 200
--font-size-hero: 32px
--chart-1 through --chart-8
```

---

*本设计系统作为项目的 Source of Truth。页面级覆盖请见 `design-system/pages/`。*
