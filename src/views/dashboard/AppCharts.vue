<template>
  <div class="app-charts">
    <!-- KPI 统计图表 -->
    <div class="chart-card">
      <div class="chart-card__title">运行概览</div>
      <div ref="kpiRef" class="chart-canvas chart-canvas--kpi" :style="{ height: `${kpiChartHeight}px` }" />
    </div>

    <!-- 柱状图 -->
    <div class="chart-card">
      <div class="chart-card__title">监测分类统计</div>
      <div ref="barRef" class="chart-canvas" />
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

import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { useECharts, darkChartTheme, createLinearGradient, getCssVar } from '@/composables/useECharts'
import { getData } from '@/api/system/bar'
import { getKpiData } from '@/api/system/safetyMonitoring'

const loading = ref(true)

const barRef = ref<HTMLDivElement>()
const pieRef = ref<HTMLDivElement>()
const kpiRef = ref<HTMLDivElement>()

const { chart: barChart, init: initBar, setOption: setBar } = useECharts(barRef)
const { chart: kpiChart, init: initKpi, setOption: setKpi } = useECharts(kpiRef)

let resizeObserver: ResizeObserver | null = null

const KPI_CONFIG: Record<string, { label: string; valueClass?: string }> = {
  total: { label: '监测总数' },
  alarmPoint: { label: '报警', valueClass: 'kpi-alarm' },
  analog: { label: '模拟量' },
  switch: { label: '开关量' },
  substation: { label: '分站' },
  other: { label: '其他' },
  devicesNeedCalibration: { label: '需标校', valueClass: 'kpi-warn' },
}

const kpiList = ref<{ key: string; label: string; value: number; valueClass?: string }[]>([])

const kpiChartHeight = computed(() => {
  const itemCount = kpiList.value.filter(item => item.key !== 'total').length
  if (itemCount === 0) return 180
  return Math.min(320, Math.max(160, itemCount * 42 + 48))
})

function getAdaptiveSize() {
  const width = window.innerWidth
  const fontSize = width < 360 ? 9 : width < 414 ? 10 : 11
  return { fontSize }
}

async function loadCharts() {
  loading.value = true
  try {
    const res = await getData()
    const raw = (res.data || []) as any[]
    const data = raw.filter((d: any) => d.txt !== '全部')
    const categories = data.map((d: any) => d.txt || '')
    const values = data.map((d: any) => d.num || 0)

    const { fontSize } = getAdaptiveSize()
    const maxCategoryLen = categories.reduce((max, c) => Math.max(max, c.length), 1)
    const bottomMargin = 36 + maxCategoryLen * fontSize * 1.45

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
        grid: { top: 12, bottom: bottomMargin, left: 40, right: 12 },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            color: '#64748b',
            fontSize,
            interval: 0,
            formatter: (value: string) => value.split('').join('\n'),
          },
          axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
          axisLabel: {
            color: '#64748b',
            fontSize,
          },
        },
        series: [{
          type: 'bar',
          data: values,
          barMaxWidth: 28,
          itemStyle: {
            color: createLinearGradient(0, 0, 0, 1, [
              { offset: 0, color: getCssVar('--color-primary-light', '#60a5fa') },
              { offset: 1, color: getCssVar('--color-primary-dark', '#1d4ed8') },
            ]),
            borderRadius: [6, 6, 0, 0],
            shadowBlur: 8,
            shadowColor: 'rgba(59, 130, 246, 0.25)',
            shadowOffsetY: 4,
          },
          emphasis: {
            itemStyle: {
              color: createLinearGradient(0, 0, 0, 1, [
                { offset: 0, color: getCssVar('--chart-2', '#22c55e') },
                { offset: 1, color: getCssVar('--color-primary', '#3b82f6') },
              ]),
              shadowBlur: 12,
              shadowColor: 'rgba(59, 130, 246, 0.4)',
            },
          },
          animationDelay: (idx: number) => idx * 60,
        }],
      })
    }
  } catch (e) {
    console.error('加载图表数据失败', e)
  } finally {
    loading.value = false
  }
}

async function loadKpi() {
  try {
    const res = await getKpiData()
    const raw = res.data || res || {}
    const kd = Array.isArray(raw) ? raw[0] || {} : raw
    kpiList.value = Object.keys(KPI_CONFIG)
      .filter(k => k in kd)
      .map(k => ({ key: k, label: KPI_CONFIG[k].label, value: kd[k] ?? 0, valueClass: KPI_CONFIG[k].valueClass }))

    // KPI 横向条形图（bullet 风格）
    await nextTick()
    if (!initKpi()) return

    const totalItem = kpiList.value.find(item => item.key === 'total')
    const chartItems = kpiList.value.filter(item => item.key !== 'total')
    if (chartItems.length === 0) return

    const kpiLabels = chartItems.map(item => item.label)
    const kpiValues = chartItems.map(item => Number(item.value) || 0)
    const totalCount = Number(totalItem?.value) || kpiValues.reduce((a, b) => a + b, 0) || 1

    const getColor = (key: string) => {
      if (key === 'alarmPoint') return {
        start: getCssVar('--color-danger-light', '#f87171'),
        end: getCssVar('--color-danger', '#ef4444'),
        shadow: 'rgba(239, 68, 68, 0.35)',
        glow: 'rgba(239, 68, 68, 0.45)',
      }
      if (key === 'devicesNeedCalibration') return {
        start: getCssVar('--color-warning-light', '#fbbf24'),
        end: getCssVar('--color-warning', '#f59e0b'),
        shadow: 'rgba(245, 158, 11, 0.35)',
        glow: 'rgba(245, 158, 11, 0.45)',
      }
      return {
        start: getCssVar('--color-primary-light', '#60a5fa'),
        end: getCssVar('--color-primary', '#3b82f6'),
        shadow: 'rgba(59, 130, 246, 0.35)',
        glow: 'rgba(59, 130, 246, 0.45)',
      }
    }

    const palette = chartItems.map(item => getColor(item.key))
    const { fontSize } = getAdaptiveSize()

    setKpi({
      ...darkChartTheme(),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'rgba(148, 163, 184, 0.15)',
        textStyle: { color: '#f0f2f5', fontSize: 12 },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '无数据'
          const p = Array.isArray(params)
            ? params.find((x: any) => x.seriesName === '数值')
            : params
          if (!p) return '无数据'
          const percent = ((p.value / totalCount) * 100).toFixed(1)
          return `<div style="font-weight:600;margin-bottom:4px;">${p.name}</div>`
            + `<div>数量: <strong>${p.value}</strong></div>`
            + `<div>占比: <strong>${percent}%</strong></div>`
        },
      },
      grid: { top: 8, bottom: 8, left: 64, right: 84, containLabel: false },
      xAxis: {
        type: 'value',
        max: totalCount,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        data: kpiLabels,
        axisLabel: {
          color: '#94a3b8',
          fontSize,
          fontWeight: 500,
          interval: 0,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          // 背景轨道（以监测总数为 100% 参考）
          name: '背景轨道',
          type: 'bar',
          data: kpiValues.map(() => totalCount),
          barGap: '-100%',
          barMaxWidth: 18,
          itemStyle: {
            color: 'rgba(148, 163, 184, 0.08)',
            borderRadius: [8, 8, 8, 8],
          },
          silent: true,
          animation: false,
          z: 1,
        },
        {
          // 实际数值条
          name: '数值',
          type: 'bar',
          data: kpiValues.map((v, i) => ({
            value: v,
            itemStyle: {
              color: createLinearGradient(0, 0, 1, 0, [
                { offset: 0, color: palette[i].start },
                { offset: 1, color: palette[i].end },
              ]),
              borderRadius: [8, 8, 8, 8],
              shadowBlur: 8,
              shadowColor: palette[i].shadow,
            },
          })),
          barMaxWidth: 18,
          emphasis: {
            itemStyle: (params: any) => ({
              shadowBlur: 14,
              shadowColor: palette[params.dataIndex]?.glow || 'rgba(59, 130, 246, 0.45)',
            }),
          },
          label: {
            show: true,
            position: 'right',
            color: '#e2e8f0',
            fontSize,
            fontWeight: 600,
            formatter: (p: any) => {
              const percent = ((p.value / totalCount) * 100).toFixed(1)
              return `${p.value}  (${percent}%)`
            },
          },
          animationDelay: (idx: number) => idx * 100,
          z: 2,
        },
      ],
    })

    kpiChart.value?.resize()
  } catch (e) {
    console.warn('加载 KPI 失败:', e)
  }
}

onMounted(() => {
  loadCharts()
  loadKpi()
  const handler = () => {
    barChart.value?.resize()
    kpiChart.value?.resize()
  }
  window.addEventListener('resize', handler)
  resizeObserver = new ResizeObserver(handler)
  if (barRef.value) resizeObserver.observe(barRef.value)
  if (pieRef.value) resizeObserver.observe(pieRef.value)
  if (kpiRef.value) resizeObserver.observe(kpiRef.value)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    resizeObserver?.disconnect()
    resizeObserver = null
  })
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
  height: 55vh;
  min-height: 220px;
  max-height: 340px;
}

.chart-canvas--kpi {
  height: 260px;
  min-height: 180px;
  max-height: 320px;
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

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
  }
}
</style>
