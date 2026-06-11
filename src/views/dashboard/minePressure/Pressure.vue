<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressureChart' })

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  installSiteName?: string
  type?: string
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: [], smooth: true }],
  })
}

watch(() => [props.installSiteName, props.type], () => {
  // 当参数变化时刷新图表
})

onMounted(() => {
  initChart()
  const resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
    chart?.dispose()
  })
})
</script>
