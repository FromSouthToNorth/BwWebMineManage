# 领域指南补充

> 图表、UX、Vue 实现最佳实践

---

## 一、ECharts 图表指南

### 当前模式分析

项目中所有图表组件遵循同一模式：

```typescript
// 通用模式
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function initChart() {
  chart = echarts.init(chartRef.value!)
  chart.setOption({ /* 配置 */ })
}

onMounted(() => {
  initChart()
  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    chart?.dispose()
  })
})
```

### 推荐: 共享组合式函数

抽取为 `useECharts` composable 避免重复：

```typescript
// src/composables/useECharts.ts
import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import * as echarts from 'echarts'

export function useECharts(
  chartRef: Ref<HTMLDivElement | undefined>,
  options: echarts.EChartsOption,
  deps?: () => any // 响应式依赖，变化时更新
) {
  let chart: echarts.ECharts | null = null

  function init() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    chart.setOption(options)
  }

  function update(opt: echarts.EChartsOption) {
    chart?.setOption(opt)
  }

  onMounted(() => {
    init()
    const handler = () => chart?.resize()
    window.addEventListener('resize', handler)
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handler)
      chart?.dispose()
    })
  })

  return { chart, init, update }
}
```

### 暗色主题默认配置

```typescript
// src/utils/chartTheme.ts
export const chartDefaults = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderColor: 'rgba(148,163,184,0.15)',
    textStyle: { color: '#f0f2f5', fontSize: 12 },
    formatter: (params: any) => {
      // 数值为空显示 "--"
      if (!params || params.length === 0) return '无数据'
      return Array.isArray(params)
        ? params.map((p: any) =>
            `${p.marker} ${p.seriesName}: ${p.value ?? '--'}`
          ).join('<br/>')
        : `${params.value ?? '--'}`
    }
  },
  grid: { top: 24, bottom: 28, left: 48, right: 16 },
  textStyle: {
    fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  // 使用 CSS 变量色值，需在 JS 中读取
  // 读取方式: getComputedStyle(document.documentElement).getPropertyValue('--chart-1')
}
```

### 图表颜色读取方式

```typescript
// 从 CSS 变量读取图表颜色 (响应主题切换)
function getChartColor(index: number): string {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue(`--chart-${index}`).trim() || '#3b82f6'
}

// 使用方式
const chartColors = [1,2,3,4,5,6,7,8].map(i => getChartColor(i))
```

### 图表组件检查清单

- [ ] 容器 `width: 100%` + 固定高度
- [ ] `onBeforeUnmount` 中 `chart.dispose()`
- [ ] `window.resize` 监听自动 `chart.resize()`
- [ ] tooltip 显示精确数值，空值显示 "--"
- [ ] 数据为空时 `chart.clear()` 或显示空态占位
- [ ] 动画时长: 首次 800ms，更新 300ms
- [ ] 使用 CSS 变量色值而非硬编码

---

## 二、UX 深度指南

### 工业监控系统 UX 核心原则

| 原则 | 说明 |
|------|------|
| **告警可见性** | 告警必须在任何界面、任何状态下可见 |
| **信息层级** | 状态 > 数值 > 位置 > 时间 |
| **最小认知负荷** | 一眼看懂当前状态，无需解读 |
| **容错设计** | 关键操作有确认，误触可恢复 |
| **持续可用** | 数据加载失败不影响已展示内容 |

### 告警设计规范

**告警分级：**

```
级别 1 — 红色闪烁 + 声音提示  → 瓦斯超限、断电
级别 2 — 红色静态 + 状态条    → 设备故障、通讯中断
级别 3 — 黄色 + 图标          → 参数偏离、维护提醒
级别 4 — 蓝色信息             → 系统通知、状态变更
```

**告警交互规则：**
- 告警产生时，页面标题栏显示闪烁的告警计数
- 点击告警计数跳转到告警详情
- 告警确认后，闪烁停止，保留红色标记直至故障恢复
- 告警列表按时间倒序，最新告警置顶
- 告警声音可配置开关

### 移动端 UX 特化

| 特性 | 实现方式 |
|------|---------|
| 触摸目标 | ≥ 44x44px，告警按钮 ≥ 48px |
| 手势 | 下拉刷新、左滑操作 |
| 底部导航 | Vant Tabbar，4~5 个 tab |
| 列表 | 单列，每项 84~96px 高度 |
| 固定搜索 | 顶部搜索栏，支持模糊匹配 |
| 省流量 | 非活跃页面停止数据轮询 |

### 加载策略

```
页面加载:
  1. 骨架屏（Skeleton）即时显示
  2. 关键数据优先加载（KPI 指标 → 列表 → 图表）
  3. 非关键数据懒加载

数据刷新:
  PC 监控: 10 秒轮询（自动）
  移动端: 手动下拉刷新 + 30 秒轮询
  大屏: 5 秒轮询

失败处理:
  请求失败 → 显示缓存数据 + 错误标记
  网络断开 → 显示"离线"指示器 + 最后更新时间
  超时 → 显示超时提示 + 重试按钮
```

### 空状态与边界

| 场景 | 展示内容 |
|------|---------|
| 无监测数据 | 空提示 + 刷新按钮 |
| 无告警 | 绿色"一切正常" + 勾选图标 |
| 搜索无结果 | "未找到匹配数据" + 清除筛选建议 |
| 图表无数据 | "暂无数据" (不显示 0) |
| 加载失败 | 错误提示 + 重试按钮 |
| 权限不足 | 跳转 401 页面 |

### 交互反馈

```
按钮点击:
  异步操作 → 按钮显示 loading 状态 + disabled
  成功 → 简短 Message 提示 (2 秒自动消失)
  失败 → 错误提示 + 按钮恢复

表格操作:
  行点击 → 显示详情弹窗
  表头排序 → 排序图标变化 + 数据重排
  分页跳转 → 页数变化 + 数据更新

弹窗:
  关闭方式: 点击遮罩 + ESC 键 + 关闭按钮
  大内容: 全屏弹窗
  小内容: 居中弹窗
```

---

## 三、Vue 实现最佳实践

### 组合式函数模式

```
src/
├── composables/
│   ├── useECharts.ts      # 图表生命周期管理
│   ├── useRefresh.ts      # 自动轮询逻辑
│   ├── useTheme.ts        # 主题切换
│   └── usePagination.ts   # 分页状态
```

### 组件规范

```
单文件组件结构:
  <template>     ← 模板
  <script setup>  ← 逻辑 (defineOptions → imports → props/emit → state → methods → lifecycle)
  <style scoped>  ← 样式 (使用 CSS 变量)
```

**Props 规范:**
```typescript
// 使用 withDefaults + defineProps
const props = withDefaults(defineProps<{
  title?: string
  visible?: boolean
  items: ItemType[] // 必填项不加 ?
}>(), {
  title: '',
  visible: false,
})
```

**Emits 规范:**
```typescript
// 使用类型化 emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  change: [id: number, value: string]
  click: [item: ItemType]
}>()
```

### 性能优化

- **v-for + key** — 始终使用唯一 key
- **v-show vs v-if** — 频繁切换用 `v-show`
- **计算属性** — 复杂派生数据用 computed
- **watch 清理** — watch 返回的 stop 函数在组件卸载时自动调用
- **大数据列表** — 虚拟滚动考虑 `@tanstack/vue-virtual`
- **ECharts 实例** — 在 `onBeforeUnmount` 中 dispose

### API 层模式

```typescript
// 统一的 Strategy API 调用
import { requestStrategyData, executeStrategy } from '@/utils/request'

// 获取数据 (POST)
export function listData(params: Record<string, any>) {
  return requestStrategyData(STRATEGY_ID, params, 'page')
}

// 获取单个值
export function getMetric(params: Record<string, any>) {
  return requestStrategyData(STRATEGY_ID, params, 'data')
}

// 执行操作
export function doAction(params: Record<string, any>) {
  return executeStrategy(STRATEGY_ID, params)
}
```

---

## 四、TypeScript 类型规范

### API 响应类型

```typescript
// 统一 API 响应 (在 request.ts 中定义)
interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface PageData<T> {
  items: T[]
  total: number
  pageNum: number
  pageSize: number
  statistics?: string // HTML 统计
}

// 通用监测点
interface MonitorPoint {
  devName: string
  devValue: string | number
  devStatus: string
  alarmStatus: '报警' | '' // 空串 = 正常
  substation: string
  category: string
  area: string
  site: string
  alarmThreshold?: string | number
  devLabel?: string
  valueUpdateDT?: string
}
```

---

## 五、主题切换策略

当前已实现 `data-theme` 属性切换。关键点：

1. **切换方式**: `document.documentElement.setAttribute('data-theme', 'theme-dark')`
2. **持久化**: localStorage 存储主题偏好
3. **URL 覆写**: 通过 `DATA_THEME` query 参数可强制覆盖
4. **CSS 变量**: 所有颜色引用 CSS 变量，无硬编码色值
5. **ECharts**: 主题切换时需重新读取 CSS 变量更新图表颜色

### 主题切换钩子示例

```typescript
// src/composables/useTheme.ts
import { useSettingsStore } from '@/stores/settings'
import { DATA_THEME } from '@/utils/constants'

export function useTheme() {
  const settingsStore = useSettingsStore()

  function setTheme(theme: 'theme-dark' | 'theme-light') {
    document.documentElement.setAttribute(DATA_THEME, theme)
    settingsStore.changeSetting({ key: 'theme', value: theme })
    localStorage.setItem(DATA_THEME, theme)
    // 触发 ECharts 重绘
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute(DATA_THEME)
    setTheme(current === 'theme-light' ? 'theme-dark' : 'theme-light')
  }

  return { setTheme, toggleTheme }
}
```

---

*本文档补充了 MASTER.md 中未覆盖的实现细节。*
