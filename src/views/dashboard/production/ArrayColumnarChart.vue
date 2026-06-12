<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ArrayColumnarChart' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { darkChartTheme, DARK_CHART_COLORS } from '@/composables/useECharts'

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    ...darkChartTheme(),
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
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
    series: [
      {
        name: '产量A',
        type: 'bar',
        data: [],
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '产量B',
        type: 'bar',
        data: [],
        itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
      },
    ],
  })

  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    chart?.dispose()
  })
})
</script>
