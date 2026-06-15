<template>
  <div class="stat-chart">
    <!-- 头部 -->
    <div class="stat-chart__header">
      <div class="stat-chart__title">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"
          style="flex-shrink: 0;">
          <rect x="3" y="10" width="4" height="11" rx="1" />
          <rect x="10" y="6" width="4" height="15" rx="1" />
          <rect x="17" y="2" width="4" height="19" rx="1" />
        </svg>
        <span>监测分类统计</span>
      </div>
      <div class="stat-chart__total">
        总计 <strong>{{ totalCount }}</strong>
      </div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartRef" class="stat-chart__canvas" />

    <!-- 空状态 -->
    <div v-if="!loading && categories.length === 0" class="stat-chart__empty">
      暂无统计数据
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BarChart' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useECharts, darkChartTheme, createLinearGradient, getCssVar } from '@/composables/useECharts'
import { getData } from '@/api/system/bar'

const emit = defineEmits<{
  chartClick: [category: string]
}>()

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption } = useECharts(chartRef)

let resizeObserver: ResizeObserver | null = null

const loading = ref(true)
const totalCount = ref(0)
const categories = ref<string[]>([])

async function initChart() {
  loading.value = true
  if (!init()) return

  try {
    const res = await getData()
    const raw = (res.data || []) as any[]
    const data = raw.filter((d: any) => d.txt !== '全部')
    categories.value = data.map((d: any) => d.txt || '')
    const values = data.map((d: any) => d.num || 0)
    totalCount.value = values.reduce((a: number, b: number) => a + b, 0)

    const primary = getCssVar('--color-primary', '#3b82f6')

    setOption({
      ...darkChartTheme(),
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(148, 163, 184, 0.15)',
        borderWidth: 1,
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '无数据'
          const p = Array.isArray(params) ? params[0] : params
          return `<div style="font-weight:600;font-size:13px;margin-bottom:4px;">${p.axisValue}</div>`
            + `<div style="display:flex;align-items:center;gap:6px;">`
            + `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${primary};"></span>`
            + `监测点数: <strong>${p.value ?? '--'}</strong></div>`
        },
      },
      grid: { top: 8, bottom: 128, left: 36, right: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories.value,
        axisLabel: {
          color: '#64748b',
          // 设置字体垂直
          formatter: function (value) {
            return value.split('')
              .join('\n');
          },
        },
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 9 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [{
        type: 'bar',
        data: values,
        barMaxWidth: 32,
        itemStyle: {
          color: createLinearGradient(0, 0, 0, 1, [
            { offset: 0, color: getCssVar('--color-primary-light', '#60a5fa') },
            { offset: 1, color: getCssVar('--color-primary-dark', '#1d4ed8') },
          ]),
          borderRadius: [6, 6, 0, 0],
          shadowBlur: 8,
          shadowColor: 'rgba(59, 130, 246, 0.25)',
          shadowOffsetY: 4,
        },
        emphasis: {
          itemStyle: {
            color: createLinearGradient(0, 0, 0, 1, [
              { offset: 0, color: getCssVar('--chart-2', '#22c55e') },
              { offset: 1, color: getCssVar('--color-primary', '#3b82f6') },
            ]),
            shadowBlur: 14,
            shadowColor: 'rgba(59, 130, 246, 0.45)',
          },
        },
        // 数据标签
        label: {
          show: true,
          position: 'top',
          color: '#94a3b8',
          fontSize: 10,
          fontWeight: 500,
          fontFamily: getCssVar('--font-mono', 'monospace'),
          formatter: (p: any) => p.value > 0 ? p.value : '',
        },
        animationDelay: (idx: number) => idx * 80,
      }],
      animationEasing: 'elasticOut',
      animationDuration: 800,
    })

    // 点击柱子 → 发射分类
    const inst = chart.value
    if (!inst) return

    inst.on('click', (params: any) => {
      if (params.componentType === 'series' && params.name) {
        emit('chartClick', params.name)
      }
    })

    // 点击空白区域 → 发射分类
    let segments: { start: number; end: number; name: string }[] = []
    function calcSegments() {
      segments = []
      if (!inst || categories.value.length === 0) return
      const first = inst.convertToPixel({ xAxisIndex: 0 }, 0) as number
      const last = inst.convertToPixel({ xAxisIndex: 0 }, categories.value.length - 1) as number
      if (first == null || last == null || !isFinite(first)) return
      const step = (last - first) / (categories.value.length - 1)
      for (let i = 0; i < categories.value.length; i++) {
        segments.push({ start: first + i * step - step / 2, end: first + i * step + step / 2, name: categories.value[i] })
      }
    }
    calcSegments()

    resizeObserver = new ResizeObserver(() => calcSegments())
    resizeObserver.observe(chartRef.value!)

    const zr = (inst as any).getZr()
    if (zr) {
      zr.on('click', (event: any) => {
        const cx = event.offsetX ?? event.zrX ?? 0
        for (const seg of segments) {
          if (cx >= seg.start && cx < seg.end) {
            emit('chartClick', seg.name)
            return
          }
        }
      })
    }
  } catch (e) {
    console.error('BarChart error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initChart()
  const handler = () => chart.value?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    resizeObserver?.disconnect()
    resizeObserver = null
  })
})
</script>

<style scoped>
.stat-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px;
}

/* 头部 */
.stat-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 0;
  flex-shrink: 0;
}

.stat-chart__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

.stat-chart__total {
  font-size: 11px;
  color: var(--text-muted, #64748b);
}

.stat-chart__total strong {
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
}

/* 图表画布 */
.stat-chart__canvas {
  flex: 1;
  width: 100%;
  min-height: 0;
}

/* 空状态 */
.stat-chart__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #64748b);
  font-size: 13px;
}
</style>
