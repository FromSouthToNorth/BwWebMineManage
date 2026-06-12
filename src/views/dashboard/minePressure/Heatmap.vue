<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressureHeatmap' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { darkChartTheme } from '@/composables/useECharts'

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
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
        color: ['#1a365d', '#2563eb', '#22c55e', '#facc15', '#ef4444', '#991b1b'],
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

  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    chart?.dispose()
  })
})
</script>
