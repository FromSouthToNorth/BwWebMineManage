<template>
  <div class="app-charts">
    <!-- 柱状图 -->
    <div class="chart-card">
      <div class="chart-card__title">监测分类统计</div>
      <div ref="barRef" class="chart-canvas" />
    </div>

    <!-- 饼图 -->
    <div class="chart-card">
      <div class="chart-card__title">分类占比</div>
      <div ref="pieRef" class="chart-canvas" />
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="chart-loading">
      <div v-for="n in 2" :key="n" class="sk-chart">
        <div class="sk-chart__title" />
        <div class="sk-chart__area" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppCharts' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useECharts, darkChartTheme } from '@/composables/useECharts'
import { getData } from '@/api/system/bar'

const loading = ref(true)

const barRef = ref<HTMLDivElement>()
const pieRef = ref<HTMLDivElement>()

const { chart: barChart, init: initBar, setOption: setBar } = useECharts(barRef)
const { chart: pieChart, init: initPie, setOption: setPie } = useECharts(pieRef)

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

async function loadCharts() {
  loading.value = true
  try {
    const res = await getData()
    const raw = (res.data || []) as any[]
    const data = raw.filter((d: any) => d.txt !== '全部')
    const categories = data.map((d: any) => d.txt || '')
    const values = data.map((d: any) => d.num || 0)
    const colors = [1, 2, 3, 4, 5, 6, 7, 8].map(i => cssVar(`--chart-${i}`))

    // 柱状图
    if (initBar()) {
      setBar({
        ...darkChartTheme(),
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            if (!params || params.length === 0) return '无数据'
            const p = Array.isArray(params) ? params[0] : params
            return `${p.axisValue}<br/>${p.value ?? '--'}`
          },
        },
        grid: { top: 12, bottom: 28, left: 40, right: 12 },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: { color: '#64748b', fontSize: 10, interval: 0, rotate: categories.length > 6 ? 35 : 0 },
          axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
          axisLabel: { color: '#64748b', fontSize: 10 },
        },
        series: [{
          type: 'bar',
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: cssVar('--color-primary-light') || '#60a5fa' },
              { offset: 1, color: cssVar('--color-primary-dark') || '#1d4ed8' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: { itemStyle: { color: cssVar('--color-primary-light') || '#93c5fd' } },
        }],
      })
    }

    // 饼图
    if (initPie()) {
      setPie({
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
          radius: ['40%', '65%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          padAngle: 2,
          itemStyle: { borderRadius: 4, borderColor: cssVar('--bg-card') || '#141d2f', borderWidth: 2 },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            color: cssVar('--text-secondary') || '#94a3b8',
            fontSize: 10,
          },
          labelLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
          data: categories.map((c: string, i: number) => ({ name: c, value: values[i] || 0 })),
        }],
      })
    }
  } catch (e) {
    console.error('加载图表数据失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCharts()
  const handler = () => {
    barChart.value?.resize()
    pieChart.value?.resize()
  }
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => window.removeEventListener('resize', handler))
})
</script>

<style scoped>
.app-charts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 12px;
}

.chart-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-left: 4px;
}

.chart-canvas {
  width: 100%;
  height: 260px;
}

/* 加载骨架 */
.chart-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-chart {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 12px;
}

.sk-chart__title {
  height: 14px;
  width: 120px;
  border-radius: 7px;
  background: var(--border-color);
  margin-bottom: 12px;
  animation: sk-pulse 1.5s ease-in-out infinite;
}

.sk-chart__area {
  height: 240px;
  border-radius: 8px;
  background: var(--border-color);
  animation: sk-pulse 1.5s ease-in-out infinite;
}

@keyframes sk-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
</style>
