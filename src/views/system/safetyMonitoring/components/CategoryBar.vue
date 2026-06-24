<template>
  <div class="cat-bar glass-panel">
    <div class="cat-bar__header">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="10" width="4" height="11" rx="1" />
        <rect x="10" y="6" width="4" height="15" rx="1" />
        <rect x="17" y="2" width="4" height="19" rx="1" />
      </svg>
      <span>分类统计</span>
      <span class="cat-bar__total">总计 {{ total }}</span>
    </div>
    <div ref="chartRef" class="cat-bar__canvas" />
    <div v-if="!loading && categories.length === 0" class="cat-bar__empty">暂无统计数据</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CategoryBar' })

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useECharts, darkChartTheme, createLinearGradient, getCssVar } from '@/composables/useECharts'

const props = withDefaults(defineProps<{
  categories: string[]
  values: number[]
  total: number
  activeCategory?: string | null
  loading?: boolean
}>(), {
  activeCategory: null,
  loading: false,
})

const emit = defineEmits<{
  chartClick: [category: string]
}>()

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

let resizeObs: ResizeObserver | null = null

function draw() {
  if (!init()) return
  if (props.categories.length === 0) {
    setOption({ ...darkChartTheme(), series: [] })
    return
  }

  const primary = getCssVar('--color-primary', '#3b82f6')
  const primaryLight = getCssVar('--color-primary-light', '#60a5fa')
  const primaryDark = getCssVar('--color-primary-dark', '#1d4ed8')
  const textPrimary = getCssVar('--text-primary', '#f0f2f5')
  const textSecondary = getCssVar('--text-secondary', '#94a3b8')

  const cats = props.categories
  const vals = props.values

  setOption({
    ...darkChartTheme(),
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      textStyle: { color: textPrimary, fontSize: 12 },
    },
    grid: { top: 6, bottom: 6, left: 56, right: 40, containLabel: false },
    xAxis: {
      type: 'value',
      splitLine: { show: false },
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: cats.slice().reverse(),
      axisLabel: {
        color: textPrimary,
        fontSize: 11,
        fontWeight: 500,
        width: 52,
        overflow: 'truncate',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      cursor: 'pointer',
      barWidth: '65%',
      barGap: '20%',
      barMinHeight: 12,
      data: vals.slice().reverse().map((v) => ({
        value: v,
        itemStyle: {
          color: createLinearGradient(0, 0, 1, 0, [
            { offset: 0, color: primaryLight },
            { offset: 1, color: primaryDark },
          ]),
          borderRadius: [0, 6, 6, 0],
          shadowBlur: 8,
          shadowColor: 'rgba(59, 130, 246, 0.25)',
          shadowOffsetY: 2,
        },
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 14,
          shadowColor: 'rgba(59, 130, 246, 0.45)',
        },
      },
      label: {
        show: true,
        position: 'right',
        color: textSecondary,
        fontSize: 10,
        fontFamily: getCssVar('--font-mono', 'monospace'),
        formatter: (p: any) => p.value > 0 ? p.value : '',
      },
      animationDelay: (_idx: number) => 0,
    }],
    animationEasing: 'elasticOut',
    animationDuration: 600,
  })

  // click handler
  const inst = chart.value
  if (!inst) return

  inst.off('click')
  inst.on('click', (params: any) => {
    let name: string | undefined
    if (params.componentType === 'series') {
      name = params.name
    } else {
      const point = [params.event?.offsetX ?? 0, params.event?.offsetY ?? 0]
      const yVal = inst.convertFromPixel({ yAxisIndex: 0 }, point)
      if (Array.isArray(yVal) && yVal.length > 0) {
        const idx = Math.round(yVal[0])
        if (idx >= 0 && idx < cats.length) {
          name = cats.slice().reverse()[idx]
        }
      }
    }
    if (name) emit('chartClick', name)
  })
}

watch([() => props.categories, () => props.values, () => props.loading], ([c, v, loading]) => {
  if (loading) return
  draw()
}, { immediate: true })

onMounted(() => {
  resizeObs = new ResizeObserver(() => resize())
  if (chartRef.value) resizeObs.observe(chartRef.value)
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  dispose()
})
</script>

<style scoped>
.cat-bar {
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
}

.cat-bar__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  flex-shrink: 0;
}

.cat-bar__total {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: auto;
}

.cat-bar__canvas {
  flex: 1;
  min-height: 0;
}

.cat-bar__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
