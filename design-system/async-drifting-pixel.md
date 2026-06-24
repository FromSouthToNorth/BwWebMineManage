# 安全监测图表化仪表盘 — 设计文档

> 状态：已实现
> 最后更新：2026-06-23

## 目录

- [布局](#布局)
- [组件概览](#组件概览)
- [数据流](#数据流)
- [API 调用](#api-调用)
- [交互联动](#交互联动)
- [图表 watch 模式](#图表-watch-模式)
- [CSS 风格规范](#css-风格规范)
- [文件清单](#文件清单)
- [已知问题](#已知问题)

---

## 布局

```
+───────────────────────────+──────────────────────────────+
| HERO: [监测总数] [报警]    |  4 列均分，毛玻璃卡片           |
|       [正常]   [安全率%]   |  带 glow orb + scatter dots   |
+───────────────────────────+──────────────────────────────+
| LEFT (flex:1)             | RIGHT (380px 固定)            |
| +──────────────────────+  | +──────────────────────────+ |
| | 分站监测矩阵 (treemap) |  | | 分类统计 (水平柱状图)    | |
| | ECharts treemap       |  | | CategoryBar             | |
| | 蓝=分站 绿=监测点     |  | | flex:1, 点击联动矩阵筛选 | |
| | 红=报警 灰=离线       |  | | <- 水平方向, 蓝色渐变   | |
| | 点击 leaf -> 详情弹窗  |  | +──────────────────────────+ |
| | flex:1 撑满           |  | | 安全状态分布 (环形图)    | |
| +──────────────────────+  | | StatusRing              | |
|                           | | flex:1, 中心安全率%      | |
|                           | +──────────────────────────+ |
|                           | | 实时告警时间轴 (紧凑Feed) | |
|                           | | AlarmTimeline            | |
|                           | | 280px 固定高度            | |
|                           | +──────────────────────────+ |
+───────────────────────────+──────────────────────────────+
```

### 响应式断点

- >=1280px: 左右分栏，右栏 380px
- <=1280px: 右栏收窄至 320px
- <=900px: 上下布局，右栏折叠在底部

---

## 组件概览

### HeroCard.vue

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| label | string | --- | 卡片标题 |
| value | number | --- | 显示数值 |
| suffix | string | '' | 数值后缀（如 %） |
| color | 'primary' \| 'success' \| 'danger' \| 'warning' | 'primary' | 主题色 |
| loading | boolean | false | 显示 shimmer 骨架 |

**设计特点：**
- `backdrop-filter: blur(16px)` 毛玻璃背景
- 右上角 glow orb 径向渐变呼吸动画（4s）
- 5 个随机位置的散射光点（`scatter-dot`），`dot-drift` 动画
- hover: `translateY(-2px)` + glow box-shadow
- 颜色变体切换图标容器色、数值色（danger 模式带 text-shadow 发光）
- loading 态: 60px 宽 shimmer 骨架

### StatusRing.vue

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| normalCount | number | 0 | 正常监测点数 |
| alarmCount | number | 0 | 报警监测点数 |
| loading | boolean | false | 加载中 |

| Emit | 参数 | 说明 |
|------|------|------|
| filterChange | 'normal' \| 'alarm' \| null | 点击图例筛选 |

**设计特点：**
- ECharts donut 环形图，radius `['60%', '82%']`
- 中心 overlay: 安全率百分比 + "安全率" 文字
- 图例可点击切换筛选状态（选中时高亮边框）
- 点击扇区联动触发 `filterChange`

### CategoryBar.vue

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| categories | string[] | [] | 分类名称 |
| values | number[] | [] | 各分类数值 |
| total | number | 0 | 总计 |
| activeCategory | string \| null | null | 当前选中分类 |
| loading | boolean | false | 加载中 |

| Emit | 参数 | 说明 |
|------|------|------|
| chartClick | category: string | 点击柱子 -> 切换筛选 |

**设计特点：**
- ECharts 水平柱状图（`yAxis.type: 'category'`）
- 蓝色渐变填充，右端圆角 `border-radius: [0, 6, 6, 0]`
- label 在右侧显示数值
- 蓝色渐变阴影
- 点击任意行（柱/轴/空白）触发筛选

### AlarmTimeline.vue

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| data | AlarmItem[] | [] | `{ devName, content, alarmTime, _key }` |
| loading | boolean | false | 加载中 |
| maxItems | number | 8 | 最多显示条数 |

| Emit | 参数 | 说明 |
|------|------|------|
| viewMore | --- | 点击"历史 ->" |

**设计特点：**
- 红色时间线 + 圆点 dot 脉冲动画
- 最新告警带 `NEW` 闪烁标签
- `<TransitionGroup>` 滑动入场动画
- 红色顶边 `border-top: 2px solid var(--color-danger)`
- 时间戳格式化为 `HH:mm:ss`

### StationMatrix.vue

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | any[] | [] | 原始监测点列表 |
| filterCategory | string \| null | null | 分类筛选 |
| filterArea | string \| null | null | 区域筛选 |
| loading | boolean | false | 加载中 |

| Emit | 参数 | 说明 |
|------|------|------|
| cellClick | item | 点击叶节点 -> 打开详情 |
| clearFilter | --- | 清除分类筛选 |
| clearAreaFilter | --- | 清除区域筛选 |

**设计特点：**
- ECharts treemap 类型
- 第一层: Area 分组（按报警数降序）
- 第二层: 监测点叶节点（颜色编码: 蓝=分站, 绿=监测点, 红=报警带发光, 灰=离线）
- breadcrumb 导航（底部）
- label rich 格式化: 等宽设备标签 + 名称
- tooltip: 点号、区域、状态详情
- 点击叶节点触发 `cellClick`

---

## 数据流

```
Page (index.vue)
  |
  +- onMounted -> fetchAll()
  |   +- listSafetyMonitoring(1954)   -> monitorItems (原始数据)
  |   +- getKpiData(8453)             -> kpi (total / alarmCount / normalCount / safetyRate)
  |   +- getData(1942)                -> catCategories + catValues
  |
  +- onMounted -> fetchAlarms()
  |   +- listEalTimeAlarm(1960)       -> alarmFeed
  |
  +- 子组件绑定
  |   +- HeroCard x4           <- kpi
  |   +- StatusRing            <- kpi.normalCount + kpi.alarmCount
  |   +- CategoryBar           <- catCategories + catValues
  |   +- AlarmTimeline         <- alarmFeed
  |   +- StationMatrix         <- monitorItems (内部 computed 做 filteredItems)
  |   +- SafetyMonitoringDetail <- 弹窗 (v-model + row)
  |
  +- 10s setInterval -> fetchAll + fetchAlarms (自动刷新)
```

---

## API 调用

| 策略 ID | 端点 | 模块 | 用途 |
|---------|------|------|------|
| 1954 | page | `listSafetyMonitoring` | 监测点列表（pageSize=500 一次性加载） |
| 8453 | data | `getKpiData` | KPI 统计 |
| 1942 | data | `getData` (bar) | 分类统计 |
| 1960 | page | `listEalTimeAlarm` | 实时报警列表 |

---

## 交互联动

| 交互 | 触发组件 | 效果 |
|------|---------|------|
| 点击分类柱状图 | CategoryBar | 切换 `filterCategory` -> 筛选 StationMatrix |
| 点击环形图图例 | StatusRing | 发出 `filterChange`（预留） |
| 点击矩阵叶节点 | StationMatrix | 打开 `SafetyMonitoringDetail` 弹窗 |
| 点击"历史 ->" | AlarmTimeline | 路由跳转 `/safetyMonitoringMore` |
| 清除筛选标签 | StationMatrix 头部 badge | 重置 `filterCategory` / `filterArea` |
| 自动刷新 | setInterval 10s | 重新调用 fetchAll + fetchAlarms |

---

## 图表 watch 模式

所有 ECharts 子组件使用统一 watch 模式解决初始渲染和数据更新的时序问题：

```typescript
watch([() => props.data, () => props.loading], ([data, loading]) => {
  if (loading) return
  draw()  // 或 nextTick(() => draw())
}, { immediate: true })
```

关键点：
- `immediate: true` --- 组件挂载时立即执行，处理初始渲染
- 包含 `loading` 依赖 --- 确保数据就绪后才绘制
- 无需在 `onMounted` 中额外调用 draw

---

## CSS 风格规范

| 元素 | 样式 |
|------|------|
| 面板 | `rgba(20, 29, 47, 0.45)`, `backdrop-filter: blur(14px)`, `border: 1px solid rgba(148, 163, 184, 0.08)`, `border-radius: 12px` |
| Hero 卡片 | 同上 + hover `translateY(-2px)` + glow `box-shadow` |
| glow orb | 径向渐变 80px 圆形，`orb-breathe` 呼吸动画 4s |
| 散射光点 | 2-4px 圆点，`dot-drift` 动画 3s，5 个随机位置 |
| 报警装饰 | 红色顶边 `border-top: 2px solid var(--color-danger)` |
| 过渡 | 全部 `transition: all 0.2s ease` |
| 页面背景 | `radial-gradient` 叠加在 `--bg-primary` 上 |

---

## 文件清单

| 路径 | 角色 | 状态 |
|------|------|------|
| `src/views/system/safetyMonitoring/index.vue` | 主仪表盘布局 + 数据聚合 | 已实现 |
| `src/views/system/safetyMonitoring/components/HeroCard.vue` | KPI 毛玻璃卡片 | 已实现 |
| `src/views/system/safetyMonitoring/components/StatusRing.vue` | 安全状态环形图 | 已实现 |
| `src/views/system/safetyMonitoring/components/CategoryBar.vue` | 分类统计水平柱状图 | 已实现 |
| `src/views/system/safetyMonitoring/components/AlarmTimeline.vue` | 实时告警时间轴 | 已实现 |
| `src/views/system/safetyMonitoring/components/StationMatrix.vue` | 分站 treemap 矩阵 | 已实现 |
| `src/components/SafetyMonitoringDetail/index.vue` | 详情弹窗（复用） | 未修改 |
| `src/components/SafetyMonitoringTable/index.vue` | 卡片网格（safetyMonitoringMore 使用） | 未修改 |
| `src/components/TimerAlarmTable/index.vue` | 报警面板（safetyMonitoringMore 使用） | 未修改 |

---

## 已知问题

1. **`devArea` 字段** --- 如果 API 返回的 `devArea` 为空，treemap 会将所有监测点归入"未知区域"。取决于后端 SQL 查询的返回字段。
2. **`stationNo` 数字类型** --- API 可能返回数字类型的 `stationNo`，在 `localeCompare` 前已用 `String()` 转换。
3. **treemap label 截断** --- 设备标签过长时 ECharts 会自动截断，暂无自定义换行策略。
