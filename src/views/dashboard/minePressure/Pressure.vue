<template>
  <div ref="chartRef" style="width: 100%; height: 300px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressureChart' })

import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useECharts, darkChartTheme } from '@/composables/useECharts'

const props = defineProps<{
  installSiteName?: string
  type?: string
}>()

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption } = useECharts(chartRef)

/** 从 CSS 变量读取色值 */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function renderChart() {
  if (!chart.value) return
  setOption({
    ...darkChartTheme(),
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (!params || params.length === 0) return '无数据'
        const p = Array.isArray(params) ? params[0] : params
        return `${p.axisValue}<br/>压力: ${p.value ?? '--'} MPa`
      },
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
        color: cssVar('--color-primary') || '#3b82f6',
        width: 2,
      },
      itemStyle: {
        color: cssVar('--color-primary') || '#3b82f6',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${cssVar('--color-primary') || '#3b82f6'}40` },
          { offset: 1, color: `${cssVar('--color-primary') || '#3b82f6'}05` },
        ]),
      },
      markLine: {
        silent: true,
        lineStyle: { color: cssVar('--color-danger') || '#ef4444', type: 'dashed', width: 1 },
        label: { color: cssVar('--color-danger') || '#ef4444', fontSize: 10, formatter: '报警线' },
        data: [{ yAxis: 40 }],
      },
    }],
  })
}

watch(() => [props.installSiteName, props.type], () => {
  if (chart.value) renderChart()
})

onMounted(() => {
  if (!init()) return
  renderChart()
})
</script>
