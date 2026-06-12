<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressureChart' })

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { darkChartTheme } from '@/composables/useECharts'

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
    ...darkChartTheme(),
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} MPa',
    },
    grid: { top: 16, bottom: 28, left: 44, right: 16 },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: 'MPa',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
    },
    series: [{
      name: '压力',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        color: '#3b82f6',
        width: 2,
      },
      itemStyle: {
        color: '#3b82f6',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59,130,246,0.25)' },
          { offset: 1, color: 'rgba(59,130,246,0.02)' },
        ]),
      },
      markLine: {
        silent: true,
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
        label: { color: '#ef4444', fontSize: 10, formatter: '报警线' },
        data: [{ yAxis: 40 }],
      },
    }],
  })
}

watch(() => [props.installSiteName, props.type], () => {
  if (chart) initChart()
})

onMounted(() => {
  initChart()
  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    chart?.dispose()
  })
})
</script>
