<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressureHeatmap' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
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
    tooltip: { trigger: 'item' },
    visualMap: { min: 0, max: 100, calculable: true },
    series: [{ type: 'heatmap', data: [] }],
  })
}

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
