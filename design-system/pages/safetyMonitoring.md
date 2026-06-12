# 安全监控 — 页面覆盖

> 覆盖自 `design-system/MASTER.md`

## 布局差异

- KPI 栏固定在页面顶部，随页面滚动始终可见（sticky）
- 统计图区域占页面 40% 高度，可折叠
- 监测卡片网格使用 `auto-fill, minmax(280px, 1fr)`，3~4 列
- 卡片在 hover 时显示底部操作浮层（详情/历史）

## 组件覆盖

### 监测卡片 (MonitorCard)

- 使用毛玻璃效果: `background: rgba(20, 29, 47, 0.55); backdrop-filter: blur(16px)`
- 告警卡片额外: `border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.04)`
- 左侧装饰条 4px 宽，`border-radius: 0 3px 3px 0`
- hover 浮层: 从底部渐变出现（`height: 0 → 48px`）+ `backdrop-filter: blur(8px)`

### 详情弹窗 (DetailDialog)

- 使用 `glass-dialog` 毛玻璃效果
- Hero 区: 大数值 + 状态色背景 (`detail-hero.is-normal` / `is-alarm`)
- 信息网格: 2 列，`gap: 12px`，每个 field 有轻微背景色

### 分类筛选

- 筛选指示条: `rgba(59, 130, 246, 0.06)` 背景
- 激活 tag: 蓝色边框 + 背景

## 移动端差异

- 页面使用简单列表（非卡片网格）
- 详情弹窗全屏
- 顶部固定导航栏（Vant NavBar）

## API 策略

- 策略 ID: 见 `src/api/system/safetyMonitoring.ts`
- 数据流: `listSafetyMonitoring(params)` → `requestStrategyData(id, params, 'page')`
- 自动刷新: 每 10 秒轮询
