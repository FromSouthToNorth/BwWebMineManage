<template>
  <div class="station-matrix glass-panel">
    <!-- header -->
    <div class="station-matrix__header">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      <span>分站监测矩阵</span>
      <span class="station-matrix__total">{{ totalCount }} 个监测点</span>
      <span v-if="activeCategory" class="station-matrix__filter-badge">
        {{ activeCategory }}
        <button @click="$emit('clearFilter')">&times;</button>
      </span>
      <span v-if="activeArea" class="station-matrix__filter-badge">
        {{ activeArea }}
        <button @click="$emit('clearAreaFilter')">&times;</button>
      </span>
    </div>

    <!-- legend -->
    <div class="station-matrix__legend">
      <span class="mx-legend"><span class="mx-legend__dot mx-legend__dot--primary" />分站</span>
      <span class="mx-legend"><span class="mx-legend__dot mx-legend__dot--normal" />正常</span>
      <span class="mx-legend"><span class="mx-legend__dot mx-legend__dot--alarm" />报警</span>
      <span class="mx-legend"><span class="mx-legend__dot mx-legend__dot--fault" />故障</span>
      <span class="mx-legend"><span class="mx-legend__dot mx-legend__dot--offline" />离线</span>
    </div>

    <!-- chart -->
    <div ref="chartRef" class="station-matrix__canvas" />

    <!-- empty / loading -->
    <div v-if="!loading && treemapData.length === 0" class="station-matrix__empty">暂无监测数据</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'StationMatrix' })

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useECharts, darkChartTheme, getCssVar } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

export interface MatrixItem {
  devLabel: string
  devName: string
  devArea: string
  stationNo: string
  category: string
  alarmStatus: string
  _key: string
  _isAlarm: boolean
  _isOffline: boolean
  [key: string]: any
}

const props = withDefaults(defineProps<{
  items: any[]
  filterCategory?: string | null
  filterArea?: string | null
  loading?: boolean
}>(), {
  filterCategory: null,
  filterArea: null,
  loading: false,
})

const emit = defineEmits<{
  cellClick: [item: any]
  areaClick: [area: string]
  clearFilter: []
  clearAreaFilter: []
}>()

const activeCategory = computed(() => props.filterCategory)
const activeArea = computed(() => props.filterArea)

const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

let resizeObs: ResizeObserver | null = null

// ── filter & map items ──
const filteredItems = computed<MatrixItem[]>(() => {
  let list = props.items || []

  if (props.filterCategory) {
    list = list.filter((item: any) => item.category === props.filterCategory)
  }
  if (props.filterArea) {
    list = list.filter((item: any) =>
      (item.area || item.devArea || '') === props.filterArea
    )
  }

  return list.map((item: any, i: number) => {
    const devLabel = item.devLabel || item.devName || ''
    const isAlarm = item._isAlarm ?? (item.alarmStatus === '报警' || item.alarmType === 1 || item.alarmType === '1')
    const isOffline = item._isOffline ?? (item.alarmStatus === '离线' || item.devStatus === '离线')
    return {
      ...item,
      devLabel,
      devName: item.devName || item.devAddress || '',
      devArea: item.devArea || item.area || '',
      stationNo: String(item.stationNo ?? item.substation ?? ''),
      category: item.category || item.categoryName || '',
      alarmStatus: item.alarmStatus || (isAlarm ? '报警' : ''),
      _key: item._key || `${devLabel}_${i}`,
      _isAlarm: isAlarm,
      _isOffline: isOffline,
      // pass through enhanced fields from index.vue mapping
      _alarmLevel: item._alarmLevel ?? (isAlarm ? 2 : 0),
      isFault: item.isFault ?? false,
      detectionValue: item.detectionValue,
      unit: item.unit,
      alarmThreshold: item.alarmThreshold,
      cutoffThreshold: item.cutoffThreshold,
      reconnectThreshold: item.reconnectThreshold,
      maxValue: item.maxValue,
      minValue: item.minValue,
      avgValue: item.avgValue,
      feedStatus: item.feedStatus,
      sensorStatus: item.sensorStatus,
    }
  })
})

const totalCount = computed(() => filteredItems.value.length)

// ── build treemap data ──
interface TreemapLeaf {
  name: string
  value: number
  itemStyle: { color: string; shadowBlur?: number; shadowColor?: string }
  _raw: MatrixItem
}

interface TreemapNode {
  name: string
  children: TreemapLeaf[]
}

const treemapData = computed<TreemapNode[]>(() => {
  const areaGroups = new Map<string, MatrixItem[]>()
  for (const item of filteredItems.value) {
    const area = item.devArea || '未分组'
    if (!areaGroups.has(area)) areaGroups.set(area, [])
    areaGroups.get(area)!.push(item)
  }

  const primary = getCssVar('--color-primary', '#3b82f6')
  const success = getCssVar('--color-success', '#22c55e')
  const danger = getCssVar('--color-danger', '#ef4444')
  const warning = getCssVar('--color-warning', '#f59e0b')
  const info = getCssVar('--color-info', '#64748b')

  const isFLabel = (label: string) => String(label).indexOf('F') !== -1

  return Array.from(areaGroups.entries())
    .sort((a, b) => {
      const aAlarms = a[1].filter(i => i._isAlarm).length
      const bAlarms = b[1].filter(i => i._isAlarm).length
      return bAlarms - aAlarms
    })
    .map(([area, items]) => ({
      name: area,
      children: items
        .sort((a, b) => {
          if (a._isAlarm !== b._isAlarm) return a._isAlarm ? -1 : 1
          if (a.isFault !== b.isFault) return a.isFault ? -1 : 1
          return a.stationNo.localeCompare(b.stationNo)
        })
        .map(item => {
          let colorStyle: { color: string; shadowBlur?: number; shadowColor?: string }
          if (item._isAlarm) {
            // Graded alarm colors by level
            const level = item._alarmLevel || 2
            if (level >= 4) {
              colorStyle = { color: '#a855f7', shadowBlur: 8, shadowColor: 'rgba(168, 85, 247, 0.4)' }
            } else if (level >= 3) {
              colorStyle = { color: danger, shadowBlur: 8, shadowColor: 'rgba(239, 68, 68, 0.5)' }
            } else {
              colorStyle = { color: danger, shadowBlur: 6, shadowColor: 'rgba(239, 68, 68, 0.3)' }
            }
          } else if (item.isFault) {
            colorStyle = { color: warning, shadowBlur: 4, shadowColor: 'rgba(245, 158, 11, 0.3)' }
          } else if (item._isOffline) {
            colorStyle = { color: info }
          } else if (isFLabel(item.devLabel)) {
            colorStyle = { color: primary }
          } else {
            colorStyle = { color: success }
          }
          return {
            name: (item.detectionParam || item.devName || item.devLabel).slice(0, 20),
            value: 1,
            itemStyle: colorStyle,
            _raw: item,
          }
        }),
    }))
})

// ── draw chart ──
function draw() {
  if (!init()) return

  const textPrimary = getCssVar('--text-primary', '#f0f2f5')
  const textSecondary = getCssVar('--text-secondary', '#94a3b8')
  const bgCard = getCssVar('--bg-card', '#141d2f')

  const data: TreemapNode[] = treemapData.value

  if (data.length === 0) {
    setOption({ ...darkChartTheme(), series: [] })
    return
  }
  console.log(data);

  const flattenedLeaves: any[] = []
  for (const area of data) {
    for (const child of area.children) {
      flattenedLeaves.push({ ...child, groupName: area.name })
    }
  }

  const option: EChartsOption = {
    ...darkChartTheme(),
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      textStyle: { color: textPrimary, fontSize: 12 },
      formatter: (params: any) => {
        if (!params.data) return ''
        const raw = params.data._raw
        if (!raw) {
          // area group header
          const group = data.find(a => a.name === params.name)
          const alarms = group?.children.filter((c: any) => c._raw?._isAlarm).length || 0
          const faults = group?.children.filter((c: any) => c._raw?.isFault).length || 0
          return `<div style="font-weight:600;font-size:13px;margin-bottom:4px;">${params.name}</div>`
            + `<div>监测点: <strong>${group?.children.length || 0}</strong></div>`
            + `<div>报警: <strong style="color:${getCssVar('--color-danger', '#ef4444')}">${alarms}</strong></div>`
            + (faults > 0 ? `<div>故障: <strong style="color:${getCssVar('--color-warning', '#f59e0b')}">${faults}</strong></div>` : '')
        }
        const isAlarm = raw._isAlarm
        const isF = String(raw.devLabel).indexOf('F') !== -1
        const alarmLevel = raw._alarmLevel || 0
        const statusText = alarmLevel >= 4 ? '突出危险' : (alarmLevel >= 3 ? '紧急报警' : (alarmLevel >= 2 ? '报警' : (alarmLevel >= 1 ? '预警' : (isF ? '分站' : '正常'))))
        const statusColor = isAlarm ? getCssVar('--color-danger', '#ef4444') : (isF ? getCssVar('--color-primary', '#3b82f6') : getCssVar('--color-success', '#22c55e'))

        // build detail tooltip per AQ6201-2019 §5.5.5.1
        const displayName = raw.detectionParam || raw.devName || raw.devLabel
        let html = `<div style="font-weight:600;font-size:13px;margin-bottom:4px;">${displayName}</div>`
        html += `<div>点号: <strong>${raw.devLabel}</strong> | 区域: ${raw.devArea || '-'}</div>`
        html += `<div>状态: <strong style="color:${statusColor}">${statusText}</strong>`
        if (raw.isFault) html += ` | <span style="color:${getCssVar('--color-warning', '#f59e0b')}">故障</span>`
        html += `</div>`

        // measurement value with unit
        const val = raw.detectionValue
        const unit = raw.unit || ''
        if (val !== undefined && val !== null && !Number.isNaN(val)) {
          html += `<div style="margin-top:4px;font-size:16px;font-weight:700;font-family:monospace;">${Number(val).toFixed(2)} ${unit}</div>`
        }

        // thresholds
        const alarmTh = raw.alarmThreshold
        const cutoffTh = raw.cutoffThreshold
        const reconTh = raw.reconnectThreshold
        if (alarmTh != null || cutoffTh != null) {
          html += `<div style="margin-top:4px;font-size:11px;color:rgba(255,255,255,0.5);">`
          if (alarmTh != null) html += `报警门限 ≥${alarmTh} `
          if (cutoffTh != null) html += `断电门限 ≥${cutoffTh} `
          if (reconTh != null) html += `复电门限 <${reconTh}`
          html += `</div>`
        }

        // statistics
        if (raw.maxValue > 0 || raw.avgValue > 0 || raw.minValue > 0) {
          html += `<div style="font-size:11px;color:rgba(255,255,255,0.45);">`
          html += `最大值 ${Number(raw.maxValue || 0).toFixed(2)} | 平均值 ${Number(raw.avgValue || 0).toFixed(2)} | 最小值 ${Number(raw.minValue || 0).toFixed(2)}`
          html += `</div>`
        }

        // feed status + station
        const feed = raw.feedStatus
        if (feed) {
          html += `<div style="font-size:11px;color:rgba(255,255,255,0.45);">馈电: ${feed} | 分站: ${raw.stationNo || '-'}</div>`
        }

        return html
      },
    },
    series: [{
      type: 'treemap',
      width: '100%',
      height: '100%',
      roam: false,
      nodeClick: 'link',
      breadcrumb: {
        show: true,
        height: 22,
        bottom: 0,
        itemStyle: {
          color: 'rgba(148, 163, 184, 0.06)',
          borderColor: 'rgba(148, 163, 184, 0.1)',
          borderWidth: 1,
          borderRadius: 4,
          textStyle: { color: textSecondary, fontSize: 10 },
        },
        emphasis: {
          itemStyle: {
            color: 'rgba(59, 130, 246, 0.12)',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            textStyle: { color: textPrimary },
          },
        },
      },
      label: {
        show: true,
        formatter: (params: any) => {
          // leaf nodes show devLabel
          if (!params.data.children && !params.data._raw) {
            // area header
            return `{area|${params.name}} {count|${params.value || 0}}`
          }
          if (params.data._raw) {
            const raw = params.data._raw
            const isAlarm = raw._isAlarm
            return `{label|${raw.devLabel}}\n{name|${raw.devName || ''}}`
          }
          return params.name
        },
        rich: {
          area: {
            fontSize: 12,
            fontWeight: 700,
            color: textPrimary,
            padding: [4, 8, 2, 8],
          },
          count: {
            fontSize: 10,
            color: textSecondary,
          },
          label: {
            fontSize: 11,
            fontWeight: 600,
            fontFamily: getCssVar('--font-mono', 'monospace'),
            color: '#ffffff',
          },
          name: {
            fontSize: 9,
            color: 'rgba(255,255,255,0.7)',
          },
        },
      },
      upperLabel: {
        show: true,
        height: 22,
        color: textSecondary,
        fontSize: 11,
        fontWeight: 500,
      },
      itemStyle: {
        borderColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 1,
        gapWidth: 1,
      },
      emphasis: {
        label: {
          show: true,
        },
        itemStyle: {
          shadowBlur: 16,
          shadowColor: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 2,
        },
      },
      levels: [
        {
          // root
          itemStyle: { borderWidth: 0, gapWidth: 2 },
          upperLabel: { show: false },
        },
        {
          // area group
          color: [bgCard],
          colorMappingBy: 'index',
          itemStyle: { gapWidth: 2, borderWidth: 2, borderColor: 'rgba(15, 23, 42, 0.6)' },
          label: { fontSize: 12, fontWeight: 700, color: textPrimary },
          upperLabel: { show: true },
        },
        {
          // station leaf
          colorMappingBy: 'value',
          itemStyle: { gapWidth: 1, borderWidth: 1 },
        },
      ],
      data: data,
    }],
  }

  setOption(option)

  // click: area block → filter by area; leaf cell → detail dialog
  chart.value?.off('click')
  chart.value?.on('click', (params: any) => {
    // area group click — filter by area
    if (params.data?.children) {
      emit('areaClick', params.name)
      return
    }
    // leaf click — show detail
    if (params.data?._raw) {
      emit('cellClick', params.data._raw)
    }
  })
}

watch(() => [props.items, props.filterCategory, props.filterArea, props.loading], () => {
  if (!props.loading) draw()
}, { deep: true })

onMounted(() => {
  if (!props.loading) draw()
  resizeObs = new ResizeObserver(() => resize())
  if (chartRef.value) resizeObs.observe(chartRef.value)
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  dispose()
})
</script>

<style scoped>
.station-matrix {
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
}

.station-matrix__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.station-matrix__total {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 4px;
}

.station-matrix__filter-badge {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.1);
  padding: 1px 6px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.station-matrix__filter-badge button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  padding: 0;
  line-height: 1;
}

/* legend */
.station-matrix__legend {
  display: flex;
  gap: 16px;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.mx-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.mx-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.mx-legend__dot--primary {
  background: rgba(59, 130, 246, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.mx-legend__dot--normal {
  background: rgba(34, 197, 94, 0.6);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.mx-legend__dot--alarm {
  background: rgba(239, 68, 68, 0.7);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.3);
}

.mx-legend__dot--fault {
  background: rgba(245, 158, 11, 0.6);
  border: 1px solid rgba(245, 158, 11, 0.5);
}

.mx-legend__dot--offline {
  background: rgba(100, 116, 139, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.4);
}

/* chart */
.station-matrix__canvas {
  flex: 1;
  min-height: 0;
}

.station-matrix__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
