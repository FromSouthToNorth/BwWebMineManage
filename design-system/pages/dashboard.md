# 仪表盘 — 页面覆盖

> 覆盖自 `design-system/MASTER.md`

## 通用规范

所有仪表盘/图表组件遵循：

1. 使用 `* as echarts from 'echarts'` 直接初始化
2. 容器 `width: 100%` + 固定 `height`（通常 240px ~ 360px）
3. `onMounted` 初始化，`onBeforeUnmount` dispose
4. window resize 监听自动 `chart.resize()`

## 组件清单

| 组件 | 类型 | 用途 |
|------|------|------|
| `BarChart.vue` | 柱状图 | 通用分类对比 |
| `AnnularChart.vue` | 环形图 | 占比分布 |
| `ColumnarChart.vue` | 柱状图 | 产量统计 |
| `ArrayColumnarChart.vue` | 分组柱状图 | 多系列对比 |
| `OverlayColumnarChart.vue` | 堆叠柱状图 | 累计对比 |
| `Pressure.vue` | 折线图 | 压力趋势 |
| `Heatmap.vue` | 热力图 | 支架分布 |
| `deviceStatus/index.vue` | 综合 | 设备状态面板 |
