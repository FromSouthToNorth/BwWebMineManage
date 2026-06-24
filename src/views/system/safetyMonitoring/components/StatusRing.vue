<template>
  <div class="status-ring glass-panel">
    <!-- header -->
    <div class="status-ring__header">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <span>安全状态分布</span>
      <span v-if="faultCount > 0" class="status-ring__fault-hint">{{ faultCount }}故障</span>
      <span v-if="totalAlarm > 0" class="status-ring__alarm-hint">{{ totalAlarm }}报警</span>
    </div>

    <!-- chart -->
    <div ref="chartRef" class="status-ring__canvas" />

    <!-- center overlay -->
    <div v-if="!loading" class="status-ring__center">
      <span class="status-ring__percent">{{ safetyRate }}%</span>
      <span class="status-ring__sub">安全率</span>
    </div>

    <!-- legend: main + grade breakdown -->
    <div class="status-ring__legend">
      <div class="legend-item" :class="{ active: activeFilter === null }" @click="toggleFilter(null)">
        <span class="legend-dot legend-dot--all" />
        <span class="legend-label">全部</span>
        <span class="legend-value">{{ totalCount }}</span>
      </div>
      <div class="legend-item" :class="{ active: activeFilter === 'normal' }" @click="toggleFilter('normal')">
        <span class="legend-dot legend-dot--success" />
        <span class="legend-label">正常</span>
        <span class="legend-value">{{ normalCount }}</span>
      </div>
    </div>

    <!-- AQ6201-2019 §5.6.12.3: 分级报警分解 -->
    <div v-if="totalAlarm > 0" class="status-ring__grades">
      <div class="grade-row grade-row--l1" :class="{ active: activeFilter === 'l1' }" @click="toggleFilter('l1')">
        <span class="grade-dot grade-dot--l1" />
        <span class="grade-label">L1 预警</span>
        <span class="grade-bar-wrap">
          <span class="grade-bar grade-bar--l1" :style="{ width: gradeBarWidth(l1Count) }" />
        </span>
        <span class="grade-value">{{ l1Count }}</span>
      </div>
      <div class="grade-row grade-row--l2" :class="{ active: activeFilter === 'l2' }" @click="toggleFilter('l2')">
        <span class="grade-dot grade-dot--l2" />
        <span class="grade-label">L2 报警</span>
        <span class="grade-bar-wrap">
          <span class="grade-bar grade-bar--l2" :style="{ width: gradeBarWidth(l2Count) }" />
        </span>
        <span class="grade-value">{{ l2Count }}</span>
      </div>
      <div class="grade-row grade-row--l3" :class="{ active: activeFilter === 'l3' }" @click="toggleFilter('l3')">
        <span class="grade-dot grade-dot--l3" />
        <span class="grade-label">L3 紧急</span>
        <span class="grade-bar-wrap">
          <span class="grade-bar grade-bar--l3" :style="{ width: gradeBarWidth(l3Count) }" />
        </span>
        <span class="grade-value">{{ l3Count }}</span>
      </div>
      <div class="grade-row grade-row--l4" :class="{ active: activeFilter === 'l4' }" @click="toggleFilter('l4')">
        <span class="grade-dot grade-dot--l4" />
        <span class="grade-label">L4 突出</span>
        <span class="grade-bar-wrap">
          <span class="grade-bar grade-bar--l4" :style="{ width: gradeBarWidth(l4Count) }" />
        </span>
        <span class="grade-value">{{ l4Count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'StatusRing' })

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useECharts, darkChartTheme, getCssVar } from '@/composables/useECharts'

const props = withDefaults(defineProps<{
  normalCount: number
  alarmCount: number
  faultCount?: number
  /** AQ6201-2019 §5.6.12.3: 各级报警数量 */
  l1Count?: number
  l2Count?: number
  l3Count?: number
  l4Count?: number
  loading?: boolean
}>(), {
  loading: false,
  faultCount: 0,
  l1Count: 0,
  l2Count: 0,
  l3Count: 0,
  l4Count: 0,
})

const emit = defineEmits<{
  filterChange: [filter: string | null]
}>()

const activeFilter = ref<string | null>(null)

function toggleFilter(key: string | null) {
  activeFilter.value = activeFilter.value === key ? null : key
  emit('filterChange', activeFilter.value)
}

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

const totalCount = computed(() => props.normalCount + props.alarmCount + props.faultCount)
const totalAlarm = computed(() => props.alarmCount)
const safetyRate = computed(() => {
  const t = props.normalCount + props.alarmCount
  if (t === 0) return '--'
  return ((props.normalCount / t) * 100).toFixed(1)
})

const maxGradeCount = computed(() => Math.max(props.l1Count, props.l2Count, props.l3Count, props.l4Count, 1))

function gradeBarWidth(count: number): string {
  const pct = (count / maxGradeCount.value) * 100
  return `${Math.max(pct, 4)}%`
}

let resizeObs: ResizeObserver | null = null

function draw() {
  if (!init()) return

  const success = getCssVar('--color-success', '#22c55e')
  const danger = getCssVar('--color-danger', '#ef4444')
  const warning = getCssVar('--color-warning', '#eab308')
  const orange = '#f97316'
  const purple = '#a855f7'
  const successGlow = getCssVar('--color-success-glow', 'rgba(34,197,94,0.3)')
  const dangerGlow = getCssVar('--color-danger-glow', 'rgba(239,68,68,0.35)')
  const textPrimary = getCssVar('--text-primary', '#f0f2f5')

  // Build series data with grade decomposition pie
  const pieData: any[] = []

  // Normal
  if (props.normalCount > 0) {
    pieData.push({
      value: props.normalCount,
      name: '正常',
      itemStyle: {
        color: success,
        shadowBlur: 12,
        shadowColor: successGlow,
      },
    })
  }

  // Alarm grades (inner donut shows breakdown)
  if (props.l1Count > 0) {
    pieData.push({
      value: props.l1Count,
      name: 'L1预警',
      itemStyle: { color: warning, shadowBlur: 6, shadowColor: 'rgba(234,179,8,0.2)' },
    })
  }
  if (props.l2Count > 0) {
    pieData.push({
      value: props.l2Count,
      name: 'L2报警',
      itemStyle: { color: danger, shadowBlur: 8, shadowColor: 'rgba(239,68,68,0.3)' },
    })
  }
  if (props.l3Count > 0) {
    pieData.push({
      value: props.l3Count,
      name: 'L3紧急',
      itemStyle: { color: orange, shadowBlur: 10, shadowColor: 'rgba(249,115,22,0.35)' },
    })
  }
  if (props.l4Count > 0) {
    pieData.push({
      value: props.l4Count,
      name: 'L4突出',
      itemStyle: { color: purple, shadowBlur: 14, shadowColor: 'rgba(168,85,247,0.4)' },
    })
  }

  // Fault
  if (props.faultCount > 0) {
    pieData.push({
      value: props.faultCount,
      name: '故障',
      itemStyle: {
        color: getCssVar('--color-warning', '#f59e0b'),
        shadowBlur: 8,
        shadowColor: 'rgba(245,158,11,0.3)',
      },
    })
  }

  if (pieData.length === 0) {
    setOption({ ...darkChartTheme(), series: [] })
    return
  }

  setOption({
    ...darkChartTheme(),
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      textStyle: { color: textPrimary, fontSize: 12 },
      formatter: (p: any) => `${p.name}: <strong>${p.value}</strong> (${p.percent}%)`,
    },
    series: [{
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['50%', '46%'],
      avoidLabelOverlap: false,
      silent: false,
      itemStyle: {
        borderColor: 'rgba(15, 23, 42, 0.6)',
        borderWidth: 2,
        borderRadius: 3,
      },
      label: { show: false },
      emphasis: {
        scaleSize: 6,
        label: { show: false },
      },
      data: pieData,
    }],
  })

  chart.value?.off('click')
  chart.value?.on('click', (params: any) => {
    const name = params.name
    if (name === '正常') toggleFilter('normal')
    else if (name === 'L4突出') toggleFilter('l4')
    else if (name === 'L3紧急') toggleFilter('l3')
    else if (name === 'L2报警') toggleFilter('l2')
    else if (name === 'L1预警') toggleFilter('l1')
    else if (name === '故障') toggleFilter('fault')
  })
}

watch([() => props.normalCount, () => props.alarmCount, () => props.l1Count, () => props.l2Count, () => props.l3Count, () => props.l4Count, () => props.loading], () => {
  if (props.loading) return
  nextTick(() => draw())
}, { immediate: true })

onMounted(() => {
  resizeObs = new ResizeObserver(() => resize())
  if (chartRef.value) resizeObs.observe(chartRef.value)
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  dispose()
})
</script>

<style scoped>
.status-ring {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 6px 12px;
}

.status-ring__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  flex-shrink: 0;
}

.status-ring__fault-hint {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.12);
  padding: 0 6px;
  border-radius: 6px;
  line-height: 16px;
}

.status-ring__alarm-hint {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 0 6px;
  border-radius: 6px;
  line-height: 16px;
}

.status-ring__canvas {
  flex: 1;
  min-height: 120px;
}

/* center text overlay */
.status-ring__center {
  position: absolute;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  margin-top: -4px;
}

.status-ring__percent {
  font-family: var(--font-mono, monospace);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
  line-height: 1.1;
}

.status-ring__sub {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

/* legend */
.status-ring__legend {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding-top: 2px;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: rgba(148, 163, 184, 0.06);
}

.legend-item.active {
  border-color: rgba(148, 163, 184, 0.15);
  background: rgba(148, 163, 184, 0.06);
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot--all {
  background: var(--text-secondary);
}

.legend-dot--success {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.legend-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.legend-value {
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ===== Grade Breakdown (AQ6201-2019 §5.6.12.3) ===== */
.status-ring__grades {
  padding: 4px 8px 0;
  flex-shrink: 0;
}

.grade-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.grade-row:hover {
  background: rgba(148, 163, 184, 0.04);
}

.grade-row.active {
  background: rgba(148, 163, 184, 0.08);
}

.grade-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.grade-dot--l1 { background: var(--color-warning); }
.grade-dot--l2 { background: var(--color-danger); }
.grade-dot--l3 { background: #f97316; }
.grade-dot--l4 { background: #a855f7; box-shadow: 0 0 4px rgba(168,85,247,0.5); }

.grade-label {
  font-size: 10px;
  color: var(--text-muted);
  min-width: 48px;
  flex-shrink: 0;
}

.grade-bar-wrap {
  flex: 1;
  height: 4px;
  background: rgba(148, 163, 184, 0.08);
  border-radius: 2px;
  overflow: hidden;
  min-width: 40px;
}

.grade-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.grade-bar--l1 { background: var(--color-warning); opacity: 0.7; }
.grade-bar--l2 { background: var(--color-danger); opacity: 0.7; }
.grade-bar--l3 { background: #f97316; opacity: 0.8; }
.grade-bar--l4 { background: #a855f7; opacity: 0.9; box-shadow: 0 0 4px rgba(168,85,247,0.4); }

.grade-value {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 20px;
  text-align: right;
}
</style>
