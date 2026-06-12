<template>
  <div ref="chartRef" style="width: 100%; height: 240px; cursor: pointer;"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BarChart' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getData } from '@/api/system/bar'

const emit = defineEmits<{
  chartClick: [category: string]
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let categories: string[] = []

async function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  try {
    const res = await getData()
    const data = res.data || []
    categories = data.map((d: any) => d.txt || '')

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(148,163,184,0.15)', textStyle: { color: '#f0f2f5' } },
      grid: { top: 16, bottom: 24, left: 40, right: 16 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#64748b', fontSize: 10, interval: 0, rotate: categories.length > 8 ? 45 : 0 },
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 10 },
      },
      series: [{
        type: 'bar',
        data: data.map((d: any) => d.num || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#60a5fa' },
            { offset: 1, color: '#1d4ed8' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: { itemStyle: { color: '#93c5fd' } },
      }],
    })

    chart.on('click', (params: any) => {
      if (params.name) emit('chartClick', params.name)
    })
  } catch {
    chart.clear()
  }
}

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
