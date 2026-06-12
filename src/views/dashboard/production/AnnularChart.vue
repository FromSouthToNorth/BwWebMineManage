<template>
  <div ref="chartRef" style="width: 100%; height: 280px"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AnnularChart' })

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
  const colors = [1, 2, 3, 4, 5, 6].map(i => cssVar(`--chart-${i}`))
  setOption({
    ...darkChartTheme(),
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (!params) return '无数据'
        return `${params.name}: ${params.value ?? '--'} (${params.percent ?? '--'}%)`
      },
    },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      padAngle: 2,
      itemStyle: {
        borderRadius: 6,
        borderColor: cssVar('--bg-card') || '#141d2f',
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        color: cssVar('--text-secondary') || '#94a3b8',
        fontSize: 11,
      },
      labelLine: {
        lineStyle: { color: cssVar('--border-color') || 'rgba(148,163,184,0.15)' },
      },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' },
      },
      data: [
        { value: 335, name: '早班' },
        { value: 280, name: '中班' },
        { value: 198, name: '晚班' },
        { value: 145, name: '检修' },
      ],
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
