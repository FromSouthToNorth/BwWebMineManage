<template>
  <div ref="chartRef" style="width: 100%; height: 280px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ColumnarChart' })

import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useECharts, darkChartTheme } from '@/composables/useECharts'

const props = withDefaults(defineProps<{
  deiviceName?: string
  countDate?: string
}>(), {
  deiviceName: '',
  countDate: '',
})

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption } = useECharts(chartRef)

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
        return (Array.isArray(params) ? params : [params])
          .map((p: any) => `${p.marker} ${p.seriesName}: ${p.value ?? '--'}`)
          .join('<br/>')
      },
    },
    grid: { top: 16, bottom: 28, left: 44, right: 16 },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
    },
    yAxis: {
      type: 'value',
      name: '吨',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [{
      name: '产量',
      type: 'bar',
      data: [820, 932, 901, 934, 1290, 1330, 1120],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: cssVar('--color-primary-light') || '#60a5fa' },
          { offset: 1, color: cssVar('--color-primary-dark') || '#1d4ed8' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: { color: cssVar('--color-primary') || '#3b82f6' },
      },
    }],
  })
}

watch(() => [props.deiviceName, props.countDate], () => {
  if (chart.value) renderChart()
})

onMounted(() => {
  if (!init()) return
  renderChart()
})
</script>
