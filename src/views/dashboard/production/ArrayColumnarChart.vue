<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ArrayColumnarChart' })
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category' }, yAxis: { type: 'value' }, series: [] })
  const h = () => chart?.resize()
  window.addEventListener('resize', h)
  onBeforeUnmount(() => { window.removeEventListener('resize', h); chart?.dispose() })
})
</script>
