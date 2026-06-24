<template>
  <div class="switch-chart glass-panel">
    <!-- header: AQ6201-2019 §5.6.10 屏幕上方标明传感器设置地点、名称、时间 -->
    <div class="switch-chart__header">
      <div class="switch-chart__title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>开关量状态</span>
        <span v-if="deviceName" class="switch-chart__device">{{ deviceName }}</span>
      </div>
      <div class="switch-chart__meta">
        <span v-if="activeCount !== undefined" class="switch-chart__stat">
          <span class="stat-dot stat-dot--on" />运行 {{ activeCount }}
        </span>
        <span v-if="inactiveCount !== undefined" class="switch-chart__stat">
          <span class="stat-dot stat-dot--off" />停止 {{ inactiveCount }}
        </span>
        <span class="switch-chart__range" v-if="timeRange">{{ timeRange }}</span>
      </div>
    </div>

    <!-- 状态图 + 柱状图 -->
    <div ref="chartRef" class="switch-chart__canvas" />

    <!-- empty -->
    <div v-if="!loading && !hasData" class="switch-chart__empty">
      <span>暂无开关量数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SwitchStateChart' })

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useECharts, darkChartTheme, getCssVar } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

export interface SwitchStatePoint {
  /** 时间标签 */
  time: string
  /** 开关状态: 1=开/运行, 0=关/停止 */
  state: 0 | 1
  /** 时间段（用于柱状图） */
  intervalLabel?: string
}

export interface SwitchEfficiency {
  /** 时间段标签 */
  interval: string
  /** 开机效率 (%) */
  efficiency: number
  /** 开机时间 (minutes) */
  uptime: number
  /** 总时间 (minutes) */
  totalTime: number
}

const props = withDefaults(defineProps<{
  /** 开关量状态时间序列 */
  states?: SwitchStatePoint[]
  /** 柱状图效率数据 */
  efficiencies?: SwitchEfficiency[]
  deviceName?: string
  timeRange?: string
  activeCount?: number
  inactiveCount?: number
  loading?: boolean
}>(), {
  states: () => [],
  efficiencies: () => [],
  deviceName: '',
  timeRange: '',
  loading: false,
  activeCount: undefined,
  inactiveCount: undefined,
})

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

const hasData = computed(() => props.states.length > 0 || props.efficiencies.length > 0)

let resizeObs: ResizeObserver | null = null

function draw() {
  if (!init()) return

  const textPrimary = getCssVar('--text-primary', '#f0f2f5')
  const textSecondary = getCssVar('--text-secondary', '#94a3b8')
  const success = getCssVar('--color-success', '#22c55e')
  const danger = getCssVar('--color-danger', '#ef4444')
  const dangerGlow = getCssVar('--color-danger-glow', 'rgba(239,68,68,0.35)')
  const primary = getCssVar('--color-primary', '#3b82f6')
  const info = getCssVar('--color-info', '#64748b')

  if (!hasData.value) {
    setOption({ ...darkChartTheme(), series: [] })
    return
  }

  // ── 状态图数据 (上部分): AQ6201-2019 §5.6.10.1 ──
  // 使用自定义 series 或 line step 显示状态切换
  const stateTimes = props.states.map(s => s.time)
  const stateValues = props.states.map(s => s.state)

  // ── 柱状图数据 (下部分): AQ6201-2019 §5.6.10.2 ──
  const effIntervals = props.efficiencies.map(e => e.interval)
  const effValues = props.efficiencies.map(e => e.efficiency)
  const uptimeValues = props.efficiencies.map(e => e.uptime)
  const totalTimeValues = props.efficiencies.map(e => e.totalTime)

  // 当没有效率数据时，从状态数据推算
  const hasEfficiency = effValues.length > 0

  const unitLabel = '%'

  const option: EChartsOption = {
    ...darkChartTheme(),
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      textStyle: { color: textPrimary, fontSize: 12 },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return ''
        const p0 = params[0]
        let html = `<div style="font-weight:600;margin-bottom:4px;">${p0.axisValue}</div>`
        for (const p of params) {
          if (p.value == null) continue
          const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px;"></span>`
          if (p.seriesName === '运行状态') {
            const state = p.value === 1 ? '运行' : '停止'
            const stateColor = p.value === 1 ? success : danger
            html += `<div>${marker}${p.seriesName}: <strong style="color:${stateColor}">${state}</strong></div>`
          } else if (p.seriesName === '开机效率') {
            html += `<div>${marker}${p.seriesName}: <strong>${Number(p.value).toFixed(1)}%</strong></div>`
            // Show uptime/total detail
            const idx = effIntervals.indexOf(p.axisValue)
            if (idx >= 0) {
              html += `<div style="font-size:11px;color:rgba(255,255,255,0.5);">`
              html += `开机: ${uptimeValues[idx]}min / 总计: ${totalTimeValues[idx]}min`
              html += `</div>`
            }
          }
        }
        return html
      },
    },
    legend: {
      show: true,
      bottom: 0,
      textStyle: { color: textSecondary, fontSize: 10 },
      data: ['运行状态', '开机效率'],
    },
    grid: [
      // 状态图 grid
      { top: 8, bottom: '52%', left: 44, right: 16 },
      // 柱状图 grid
      { top: '54%', bottom: 28, left: 44, right: 16 },
    ],
    xAxis: [
      // 状态图 x轴
      {
        type: 'category',
        data: stateTimes,
        gridIndex: 0,
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
        axisTick: { show: false },
        axisLabel: { show: true, color: textSecondary, fontSize: 9, interval: 'auto' },
        splitLine: { show: false },
      },
      // 柱状图 x轴
      {
        type: 'category',
        data: hasEfficiency ? effIntervals : stateTimes,
        gridIndex: 1,
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
        axisTick: { show: false },
        axisLabel: { color: textSecondary, fontSize: 9, interval: 'auto' },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      // 状态图 y轴 (0/1)
      {
        type: 'value',
        gridIndex: 0,
        min: -0.1,
        max: 1.1,
        splitNumber: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
        axisLabel: {
          color: textSecondary,
          fontSize: 9,
          formatter: (v: number) => v === 1 ? '运行' : '停止',
        },
      },
      // 柱状图 y轴
      {
        type: 'value',
        gridIndex: 1,
        name: unitLabel,
        nameTextStyle: { color: textSecondary, fontSize: 9 },
        min: 0,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
        axisLabel: { color: textSecondary, fontSize: 9, formatter: '{value}%' },
      },
    ],
    series: [
      // ── 状态图: AQ6201-2019 §5.6.10.1 ──
      {
        name: '运行状态',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: stateValues,
        step: 'end',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: primary,
          width: 2,
        },
        itemStyle: {
          color: (params: any) => params.value === 1 ? success : danger,
          borderColor: '#fff',
          borderWidth: 1,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(34,197,94,0.1)' },
              { offset: 1, color: 'rgba(239,68,68,0.05)' },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            { yAxis: 0.5, lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed', width: 1 } },
          ],
          label: { show: false },
        },
        z: 10,
      },
      // ── 柱状图: AQ6201-2019 §5.6.10.2 ──
      {
        name: '开机效率',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: hasEfficiency
          ? effValues.map(v => ({
              value: v,
              itemStyle: {
                color: v >= 80 ? success : v >= 50 ? getCssVar('--color-warning', '#eab308') : danger,
                borderRadius: [2, 2, 0, 0],
              },
            }))
          : [],
        barWidth: '60%',
        barGap: '10%',
        itemStyle: {
          shadowBlur: 4,
          shadowColor: 'rgba(34,197,94,0.15)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(34,197,94,0.3)',
          },
        },
      },
    ],
    // 游标联动: AQ6201-2019 §5.6.10
    axisPointer: {
      link: [{ xAxisIndex: [0, 1] }],
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        bottom: 0,
        height: 14,
        borderColor: 'rgba(148,163,184,0.1)',
        backgroundColor: 'rgba(15,23,42,0.5)',
        dataBackground: {
          lineStyle: { color: 'rgba(148,163,184,0.1)' },
          areaStyle: { color: 'rgba(148,163,184,0.03)' },
        },
        selectedDataBackground: {
          lineStyle: { color: primary },
          areaStyle: { color: 'rgba(59,130,246,0.08)' },
        },
        handleStyle: { color: primary },
        textStyle: { color: textSecondary, fontSize: 9 },
        labelFormatter: (_idx: number, value: string) => value,
      },
    ],
  }

  setOption(option)
}

watch(() => [props.states, props.efficiencies, props.loading], () => {
  if (!props.loading && hasData.value) nextTick(draw)
}, { deep: true })

onMounted(() => {
  if (!props.loading && hasData.value) nextTick(draw)
  resizeObs = new ResizeObserver(() => resize())
  if (chartRef.value) resizeObs.observe(chartRef.value)
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  dispose()
})
</script>

<style scoped>
.switch-chart {
  display: flex;
  flex-direction: column;
  padding: 6px 12px;
}

.switch-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 4px;
  flex-wrap: wrap;
  gap: 4px;
}

.switch-chart__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.switch-chart__device {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 500;
}

.switch-chart__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  color: var(--text-muted);
}

.switch-chart__stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.stat-dot--on {
  background: var(--color-success);
}

.stat-dot--off {
  background: var(--color-danger);
}

.switch-chart__canvas {
  flex: 1;
  min-height: 180px;
}

.switch-chart__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  min-height: 120px;
}
</style>
