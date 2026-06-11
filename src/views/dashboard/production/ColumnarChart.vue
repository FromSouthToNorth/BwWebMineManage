<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ColumnarChart' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [] }],
  })
  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    chart?.dispose()
  })
})
</script>
