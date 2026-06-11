<template>
  <div ref="chartRef" style="width: 100%; height: 250px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BarChart' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getData } from '@/api/system/bar'

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

async function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  try {
    const res = await getData('')
    const data = res.data || []
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map((d: any) => d.name || '') },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: data.map((d: any) => d.value || 0), itemStyle: { color: 'var(--color-primary)' } }],
    })
  } catch {
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    })
  }

  const resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
    chart?.dispose()
  })
}

onMounted(() => {
  initChart()
})
</script>
