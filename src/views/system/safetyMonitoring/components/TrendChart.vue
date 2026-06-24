<template>
  <div class="trend-chart glass-panel" :class="{ 'trend-chart--collapsed': collapsed }">
    <!-- header -->
    <div class="trend-chart__header">
      <div class="trend-chart__title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>趋势曲线</span>
        <span v-if="sensorName" class="trend-chart__device">{{ sensorName }}</span>
      </div>
      <div class="trend-chart__actions">
        <!-- AQ6201-2019 §5.6.9: 游标切换 -->
        <button class="tc-action-btn" :class="{ active: cursorEnabled }" title="游标" @click="cursorEnabled = !cursorEnabled">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
        </button>
        <button class="tc-action-btn" :class="{ active: showThresholdZones }" title="门限区域" @click="showThresholdZones = !showThresholdZones">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
        </button>
        <div class="trend-chart__timerange">
          <button v-for="r in timeRanges" :key="r.value"
            class="range-btn"
            :class="{ active: activeRange === r.value }"
            @click="activeRange = r.value">{{ r.label }}</button>
        </div>
        <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? '展开' : '收起'">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"
            :style="{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0)' }">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>

    <!-- legend: AQ6201-2019 §5.6.9 门限线颜色说明 -->
    <div v-show="!collapsed" class="trend-chart__legend">
      <span class="tc-legend-item"><span class="tc-legend-line tc-legend-line--alarm" />报警门限</span>
      <span class="tc-legend-item"><span class="tc-legend-line tc-legend-line--cutoff" />断电门限</span>
      <span class="tc-legend-item"><span class="tc-legend-line tc-legend-line--reconnect" />复电门限</span>
    </div>

    <!-- chart body -->
    <div v-show="!collapsed" class="trend-chart__body">
      <div ref="chartRef" class="trend-chart__canvas" />

      <!-- empty -->
      <div v-if="!loading && chartData.length === 0" class="trend-chart__empty">
        <span>暂无趋势数据</span>
        <span class="trend-chart__hint">选择监测点以查看实时趋势</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TrendChart' })

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useECharts, darkChartTheme, getCssVar } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

export interface TrendDataPoint {
  time: string
  value: number
  max?: number
  avg?: number
  min?: number
  /** AQ6201-2019 §5.6.12.3: 报警级别 (0-4) */
  alarmLevel?: number
  /** 是否馈电异常 */
  feedAbnormal?: boolean
}

const props = withDefaults(defineProps<{
  data?: TrendDataPoint[]
  sensorName?: string
  unit?: string
  alarmThreshold?: number | null
  cutoffThreshold?: number | null
  reconnectThreshold?: number | null
  loading?: boolean
}>(), {
  data: () => [],
  sensorName: '',
  unit: '',
  alarmThreshold: null,
  cutoffThreshold: null,
  reconnectThreshold: null,
  loading: false,
})

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

const collapsed = ref(false)
const activeRange = ref('1h')
const cursorEnabled = ref(true)        // AQ6201 §5.6.9: 游标
const showThresholdZones = ref(true)   // 门限区域色块

const timeRanges = [
  { label: '1h', value: '1h' },
  { label: '8h', value: '8h' },
  { label: '24h', value: '24h' },
]

let resizeObs: ResizeObserver | null = null

const chartData = computed(() => props.data || [])

// AQ6201-2019 §5.6.9: 曲线显示规范
function draw() {
  if (!init()) return

  const textPrimary = getCssVar('--text-primary', '#f0f2f5')
  const textSecondary = getCssVar('--text-secondary', '#94a3b8')
  const primary = getCssVar('--color-primary', '#3b82f6')
  const success = getCssVar('--color-success', '#22c55e')
  const danger = getCssVar('--color-danger', '#ef4444')
  const warning = getCssVar('--color-warning', '#f59e0b')
  const purple = '#a855f7'
  const alarmL1 = '#eab308'
  const alarmL2 = '#ef4444'
  const alarmL3 = '#f97316'
  const alarmL4 = '#a855f7'

  const data = chartData.value

  if (data.length === 0) {
    setOption({ ...darkChartTheme(), series: [] })
    return
  }

  const times = data.map(d => d.time)
  const values = data.map(d => d.value)
  const maxValues = data.map(d => d.max ?? null)
  const avgValues = data.map(d => d.avg ?? null)
  const minValues = data.map(d => d.min ?? null)

  const hasStats = maxValues.some(v => v != null)

  // ── Grade-colored scatter points per AQ6201-2019 §5.6.12.3 ──
  const gradePoints = data
    .filter((d): d is TrendDataPoint & { alarmLevel: number } => d.alarmLevel != null && d.alarmLevel >= 1)
    .map(d => ({
      name: d.time,
      value: [d.time, d.value] as [string, number],
      itemStyle: {
        color: d.alarmLevel === 4 ? alarmL4
             : d.alarmLevel === 3 ? alarmL3
             : d.alarmLevel === 2 ? alarmL2
             : alarmL1,
        shadowBlur: d.alarmLevel >= 3 ? 12 : 6,
        shadowColor: d.alarmLevel >= 3 ? 'rgba(239,68,68,0.5)' : 'rgba(234,179,8,0.3)',
        borderColor: '#fff',
        borderWidth: d.alarmLevel >= 3 ? 1.5 : 1,
      },
      symbolSize: d.alarmLevel >= 3 ? 10 : 8,
    }))

  // ── Series ──
  const series: any[] = [
    // Main monitoring value line
    {
      name: '监测值',
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: primary, width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.15)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.01)' },
          ],
        },
      },
      // AQ6201-2019 §5.6.9: markLine for thresholds
      markLine: buildThresholdMarkLines(textSecondary, warning, danger, success),
      // AQ6201-2019 §5.6.9: markArea for threshold zones
      markArea: showThresholdZones.value ? buildThresholdZones(warning, danger) : undefined,
    },
    // Grade-colored scatter (报警点标记)
    ...(gradePoints.length > 0 ? [{
      name: '报警点',
      type: 'scatter',
      data: gradePoints,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {},
      z: 10,
    }] : []),
  ]

  // Statistics lines (max/avg/min)
  if (hasStats) {
    series.push(
      {
        name: '最大值',
        type: 'line',
        data: maxValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: danger, width: 1, type: 'dotted', opacity: 0.5 },
      },
      {
        name: '平均值',
        type: 'line',
        data: avgValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: warning, width: 1, type: 'dashed', opacity: 0.5 },
      },
      {
        name: '最小值',
        type: 'line',
        data: minValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: success, width: 1, type: 'dotted', opacity: 0.5 },
      },
    )
  }

  const unitLabel = props.unit || ''

  // AQ6201-2019 §5.6.9: 游标交互 (axisPointer)
  const axisPointerCfg = cursorEnabled.value ? ({
    axisPointer: {
      link: [{ xAxisIndex: 'all' as any }],
      label: { backgroundColor: 'rgba(15,23,42,0.9)' },
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      textStyle: { color: textPrimary, fontSize: 12 },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return ''
        const p0 = params[0]
        // Find original data point for this time
        const idx = times.indexOf(p0.axisValue)
        const dp = idx >= 0 ? data[idx] : null

        let html = `<div style="font-weight:600;font-size:13px;margin-bottom:4px;">${p0.axisValue}</div>`

        // Monitoring value (first series that's not scatter/statistics)
        const mainP = params.find((p: any) => p.seriesName === '监测值')
        if (mainP && mainP.value != null) {
          const valColor = dp?.alarmLevel && dp.alarmLevel >= 2 ? danger
            : dp?.alarmLevel === 1 ? warning : primary
          html += `<div style="margin-bottom:2px;">`
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${valColor};margin-right:4px;"></span>`
          html += `监测值: <strong style="color:${valColor};font-size:15px;font-family:monospace;">${Number(mainP.value).toFixed(2)}</strong> ${unitLabel}`
          html += `</div>`
        }

        // Alarm level badge
        if (dp?.alarmLevel && dp.alarmLevel >= 1) {
          const lvColors = ['', warning, danger, danger, purple]
          const lvLabels = ['', '预警', '报警', '紧急', '突出']
          html += `<div style="margin-top:2px;margin-bottom:4px;">`
          html += `<span style="display:inline-block;padding:0 6px;border-radius:3px;background:${lvColors[dp.alarmLevel]}33;color:${lvColors[dp.alarmLevel]};font-size:11px;font-weight:600;">L${dp.alarmLevel} ${lvLabels[dp.alarmLevel]}</span>`
          if (dp.feedAbnormal) {
            html += ` <span style="display:inline-block;padding:0 6px;border-radius:3px;background:${danger}33;color:${danger};font-size:11px;">馈电异常</span>`
          }
          html += `</div>`
        }

        // Statistics
        const statLines = params.filter((p: any) => ['最大值', '平均值', '最小值'].includes(p.seriesName))
        for (const p of statLines) {
          if (p.value == null) continue
          html += `<div style="font-size:11px;color:rgba(255,255,255,0.5);display:flex;align-items:center;gap:4px;">`
          html += `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${p.color};"></span>`
          html += `${p.seriesName}: ${Number(p.value).toFixed(2)} ${unitLabel}`
          html += `</div>`
        }

        // Thresholds
        if (props.alarmThreshold != null || props.cutoffThreshold != null) {
          html += `<div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(148,163,184,0.15);font-size:11px;color:rgba(255,255,255,0.4);">`
          const alarmColor = warning
          const cutoffColor = danger
          const reconColor = success
          if (props.alarmThreshold != null) {
            const isOver = (mainP?.value ?? 0) >= props.alarmThreshold
            html += `<span ${isOver ? `style="color:${alarmColor}"` : ''}>报警 ${props.alarmThreshold}${isOver ? ' ⚠' : ''}</span> `
          }
          if (props.cutoffThreshold != null) {
            const isOver = (mainP?.value ?? 0) >= props.cutoffThreshold
            html += `<span ${isOver ? `style="color:${cutoffColor}"` : ''}>断电 ${props.cutoffThreshold}${isOver ? ' ⛔' : ''}</span> `
          }
          if (props.reconnectThreshold != null) {
            html += `<span style="color:${reconColor}">复电 ${props.reconnectThreshold}</span>`
          }
          html += `</div>`
        }

        return html
      },
    },
  }) : ({
    tooltip: { show: false },
    axisPointer: { type: 'none' },
  }) as any

  const option: EChartsOption = {
    ...darkChartTheme(),
    ...axisPointerCfg,
    legend: {
      show: true,
      bottom: 0,
      textStyle: { color: textSecondary, fontSize: 10 },
      data: [
        { name: '监测值' },
        ...(gradePoints.length > 0 ? [{ name: '报警点', icon: 'circle' }] : []),
        ...(hasStats ? [
          { name: '最大值', textStyle: { color: 'rgba(239,68,68,0.5)', fontSize: 10 } },
          { name: '平均值', textStyle: { color: 'rgba(245,158,11,0.5)', fontSize: 10 } },
          { name: '最小值', textStyle: { color: 'rgba(34,197,94,0.5)', fontSize: 10 } },
        ] : []),
      ] as any,
    },
    grid: { top: 16, bottom: 32, left: 48, right: 16 },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
      axisTick: { show: false },
      axisLabel: { color: textSecondary, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: unitLabel,
      nameTextStyle: { color: textSecondary, fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
      axisLabel: { color: textSecondary, fontSize: 10 },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        minValueSpan: 10,
      },
      {
        type: 'slider',
        bottom: 24,
        height: 16,
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
        handleStyle: { color: primary, borderColor: primary },
        textStyle: { color: textSecondary, fontSize: 10 },
      },
    ],
    series,
  }

  setOption(option)
}

/**
 * AQ6201-2019 §5.6.9: 门限线
 * 黄色虚线 = 报警浓度, 红色虚线 = 断电浓度, 蓝色虚线 = 复电浓度
 */
function buildThresholdMarkLines(
  textSecondary: string,
  warning: string,
  danger: string,
  success: string,
): any {
  const data: any[] = []

  if (props.alarmThreshold != null) {
    data.push({
      yAxis: props.alarmThreshold,
      label: {
        formatter: `报警 ${props.alarmThreshold}`,
        color: warning,
        fontSize: 10,
        position: 'insideStartTop',
      },
      lineStyle: { color: warning, type: 'dashed', width: 1.5, opacity: 0.7 },
    })
  }
  if (props.cutoffThreshold != null) {
    data.push({
      yAxis: props.cutoffThreshold,
      label: {
        formatter: `断电 ${props.cutoffThreshold}`,
        color: danger,
        fontSize: 10,
        position: 'insideStartTop',
      },
      lineStyle: { color: danger, type: 'dashed', width: 1.5, opacity: 0.7 },
    })
  }
  if (props.reconnectThreshold != null) {
    data.push({
      yAxis: props.reconnectThreshold,
      label: {
        formatter: `复电 ${props.reconnectThreshold}`,
        color: success,
        fontSize: 10,
        position: 'insideStartTop',
      },
      lineStyle: { color: success, type: 'dashed', width: 1.5, opacity: 0.7 },
    })
  }

  return data.length > 0 ? { silent: true, symbol: 'none', data } : undefined
}

/**
 * AQ6201-2019 §5.6.9: 门限区域色块
 * 报警门限~断电门限: 黄色半透明
 * 断电门限以上: 红色半透明
 */
function buildThresholdZones(warning: string, danger: string): any {
  const data: any[] = []

  // Alarm zone: alarmThreshold ~ cutoffThreshold (yellow)
  if (props.alarmThreshold != null && props.cutoffThreshold != null) {
    data.push([{
      yAxis: props.alarmThreshold,
      itemStyle: {
        color: `${warning}11`,
        borderColor: `${warning}22`,
        borderWidth: 0,
      },
      label: {
        show: true,
        position: 'insideBottomRight',
        color: `${warning}44`,
        fontSize: 9,
        formatter: '报警区',
      },
    }, {
      yAxis: props.cutoffThreshold,
    }] as any)
  }

  // Cutoff zone: above cutoffThreshold (red)
  if (props.cutoffThreshold != null) {
    data.push([{
      yAxis: props.cutoffThreshold,
      itemStyle: {
        color: `${danger}0d`,
        borderColor: `${danger}22`,
        borderWidth: 0,
      },
      label: {
        show: true,
        position: 'insideBottomRight',
        color: `${danger}44`,
        fontSize: 9,
        formatter: '断电区',
      },
    }, {
      yAxis: 'max',
    }] as any)
  }

  // Reconnect zone: below reconnectThreshold (green)
  if (props.reconnectThreshold != null && props.reconnectThreshold < (props.alarmThreshold ?? Infinity)) {
    data.push([{
      yAxis: 0,
      itemStyle: {
        color: 'rgba(34,197,94,0.04)',
        borderWidth: 0,
      },
      label: {
        show: true,
        position: 'insideTopLeft',
        color: 'rgba(34,197,94,0.3)',
        fontSize: 9,
        formatter: '正常区',
      },
    }, {
      yAxis: props.reconnectThreshold,
    }] as any)
  }

  return data.length > 0 ? { silent: true, data } : undefined
}

watch(() => [props.data, props.loading, props.alarmThreshold, props.cutoffThreshold, props.reconnectThreshold, cursorEnabled, showThresholdZones], () => {
  if (!props.loading) nextTick(draw)
}, { deep: true })

onMounted(() => {
  if (!props.loading) nextTick(draw)
  resizeObs = new ResizeObserver(() => resize())
  if (chartRef.value) resizeObs.observe(chartRef.value)
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  dispose()
})
</script>

<style scoped>
.trend-chart {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.trend-chart--collapsed {
  flex-shrink: 0;
}

/* header */
.trend-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 4px;
  flex-shrink: 0;
}

.trend-chart__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.trend-chart__device {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 500;
}

.trend-chart__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* action buttons */
.tc-action-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.tc-action-btn:hover {
  color: var(--text-primary);
  background: rgba(148, 163, 184, 0.08);
}

.tc-action-btn.active {
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.12);
}

.trend-chart__timerange {
  display: flex;
  gap: 2px;
  background: rgba(148, 163, 184, 0.06);
  border-radius: 6px;
  padding: 2px;
}

.range-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.range-btn:hover {
  color: var(--text-primary);
  background: rgba(148, 163, 184, 0.08);
}

.range-btn.active {
  color: var(--text-primary);
  background: rgba(59, 130, 246, 0.15);
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.15s;
}

.collapse-btn:hover {
  color: var(--text-primary);
  background: rgba(148, 163, 184, 0.08);
}

.collapse-btn svg {
  transition: transform 0.2s ease;
}

/* legend bar */
.trend-chart__legend {
  display: flex;
  gap: 12px;
  padding: 2px 14px 4px;
  flex-shrink: 0;
}

.tc-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.tc-legend-line {
  width: 16px;
  height: 2px;
  border-radius: 1px;
}

.tc-legend-line--alarm {
  background: var(--color-warning);
  opacity: 0.6;
}

.tc-legend-line--cutoff {
  background: var(--color-danger);
  opacity: 0.6;
}

.tc-legend-line--reconnect {
  background: var(--color-success);
  opacity: 0.6;
}

/* body */
.trend-chart__body {
  flex: 1;
  min-height: 0;
  position: relative;
  padding: 4px 12px 4px;
}

.trend-chart__canvas {
  width: 100%;
  height: 100%;
  min-height: 160px;
}

.trend-chart__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 13px;
}

.trend-chart__hint {
  font-size: 11px;
  opacity: 0.6;
}
</style>
