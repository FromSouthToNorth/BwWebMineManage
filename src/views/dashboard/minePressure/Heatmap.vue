<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressureHeatmap' })

import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useECharts, darkChartTheme } from '@/composables/useECharts'

const props = defineProps<{
  installSiteName?: string
  type?: string
}>()

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption } = useECharts(chartRef)

/** 从 CSS 变量读取色值 */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function renderChart() {
  if (!chart.value) return
  setOption({
    ...darkChartTheme(),
    tooltip: { trigger: 'axis' },
    grid: { top: 16, bottom: 28, left: 44, right: 16 },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: [
          cssVar('--chart-1') || '#1a365d',
          cssVar('--color-primary') || '#2563eb',
          cssVar('--chart-2') || '#22c55e',
          cssVar('--chart-3') || '#facc15',
          cssVar('--chart-4') || '#ef4444',
          '#991b1b',
        ],
      },
      textStyle: { color: '#64748b', fontSize: 10 },
    },
    series: [{
      type: 'scatter',
      data: [],
      symbolSize: 12,
      itemStyle: { borderColor: 'rgba(15,23,42,0.4)', borderWidth: 1 },
    }],
  })
}

onMounted(() => {
  if (!init()) return
  renderChart()
})
</script>
