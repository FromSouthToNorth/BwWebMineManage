<template>
  <div ref="chartRef" style="width: 100%; height: 280px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AnnularChart' })

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
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      padAngle: 2,
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(15,23,42,0.6)',
        borderWidth: 2,
      },
      label: {
        show: true,
        color: '#94a3b8',
        fontSize: 11,
        formatter: '{b}\n{d}%',
      },
      labelLine: {
        lineStyle: { color: 'rgba(148,163,184,0.2)' },
      },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#f0f2f5' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(59,130,246,0.2)' },
      },
      data: [],
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
