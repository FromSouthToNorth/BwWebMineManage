<template>
  <div class="monitor-point-list glass-panel">
    <!-- header -->
    <div class="mpl__header">
      <div class="mpl__header-left">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span>监测点列表</span>
        <span class="mpl__total">
          共 {{ totalCount }} 条
          <template v-if="activeCategory || activeArea">（筛选 {{ filteredItems.length }}/{{ props.items?.length || 0 }}）</template>
        </span>
        <span v-if="activeCategory" class="mpl__filter-badge">
          {{ activeCategory }}
          <button @click="$emit('clearFilter')">&times;</button>
        </span>
        <span v-if="activeArea" class="mpl__filter-badge">
          {{ activeArea }}
          <button @click="$emit('clearAreaFilter')">&times;</button>
        </span>
      </div>
      <button class="mpl__more-btn" @click="onMoreClick">更多</button>
    </div>

    <!-- legend -->
    <div class="mpl__legend">
      <span class="mpl-legend"><span class="mpl-legend__dot mpl-legend__dot--primary" />分站</span>
      <span class="mpl-legend"><span class="mpl-legend__dot mpl-legend__dot--normal" />正常</span>
      <span class="mpl-legend"><span class="mpl-legend__dot mpl-legend__dot--alarm" />报警</span>
      <span class="mpl-legend"><span class="mpl-legend__dot mpl-legend__dot--fault" />故障</span>
      <span class="mpl-legend"><span class="mpl-legend__dot mpl-legend__dot--offline" />离线</span>
    </div>

    <!-- list header -->
    <div class="mpl__list-header">
      <span class="mpl__col mpl__col--label">点号</span>
      <span class="mpl__col mpl__col--name">名称</span>
      <span class="mpl__col mpl__col--value">状态值</span>
      <span class="mpl__col mpl__col--time">时间</span>
      <span class="mpl__col mpl__col--status">状态</span>
    </div>

    <!-- list body -->
    <div ref="listRef" class="mpl__body">
      <template v-if="pagedItems.length > 0">
        <div v-for="item in pagedItems" :key="item._key" class="mpl__row" :class="rowClass(item)"
          @click="onRowClick(item)">
          <span class="mpl__col mpl__col--label" :title="item.devLabel">{{ item.devLabel }}</span>
          <span class="mpl__col mpl__col--name" :title="displayName(item)">
            <span class="mpl__name-main">{{ displayName(item) }}</span>
          </span>
          <span class="mpl__col mpl__col--value" :title="displayStateText(item)">
            {{ displayStateText(item) }}
          </span>
          <span class="mpl__col mpl__col--time" :title="formatTimeFull(item.valueUpdateDT)">
            {{ formatTime(item.valueUpdateDT) }}
          </span>
          <span class="mpl__col mpl__col--status">
            <span class="mpl__status-tag" :class="statusTagClass(item)">{{ statusText(item) }}</span>
          </span>
        </div>
      </template>
      <div v-else-if="!loading" class="mpl__empty">暂无监测数据</div>
    </div>

    <!-- pagination -->
    <Pagination v-if="totalCount > 0" :total="totalCount" :page="effectivePage" :limit="pageSize"
      :page-sizes="[20, 50, 100, 200, 500]" layout="total, sizes, prev, pager, next, jumper" :small="true"
      class="mpl__pagination" @update:page="emit('update:page', $event)" @update:limit="emit('update:pageSize', $event)"
      @pagination="onPagination" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MonitoringPointList' })

import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

export interface ListItem {
  devLabel: string
  devName: string
  devArea: string
  stationNo: string
  category: string
  alarmStatus: string
  _key: string
  _isAlarm: boolean
  _isOffline: boolean
  _alarmLevel?: number
  isFault?: boolean
  detectionValue?: number
  unit?: string
  alarmThreshold?: number | null
  cutoffThreshold?: number | null
  reconnectThreshold?: number | null
  detectionParam?: string
  valueUpdateDT?: string
  categoryStateText?: string
  statusTxt?: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  items: any[]
  filterCategory?: string | null
  filterArea?: string | null
  loading?: boolean
  page?: number
  pageSize?: number
}>(), {
  filterCategory: null,
  filterArea: null,
  loading: false,
  page: 1,
  pageSize: 50,
})

const emit = defineEmits<{
  cellClick: [item: any]
  areaClick: [area: string]
  clearFilter: []
  clearAreaFilter: []
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  pagination: [value: { page: number; pageSize: number }]
}>()

const router = useRouter()

const activeCategory = computed(() => props.filterCategory)
const activeArea = computed(() => props.filterArea)

const listRef = ref<HTMLDivElement>()

// 当 API 未返回 categoryStateText 时，从 value/unit/statusTxt 推导状态值文本
function buildStateText(item: any): string {
  if (item.stateText) return item.stateText
  if (item.valueText) return item.valueText
  const unit = item.unit || ''
  const raw = item.detectionValue ?? item.value
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = Number(raw)
    if (!Number.isNaN(n) && unit) {
      return `${n.toFixed(2)} ${unit}`
    }
  }
  return item.statusTxt || item.state || ''
}

// ── filter & map items ──
const filteredItems = computed<ListItem[]>(() => {
  let list = props.items || []

  if (props.filterCategory) {
    list = list.filter((item: any) => item.category === props.filterCategory)
  }
  if (props.filterArea) {
    list = list.filter((item: any) =>
      (item.area || item.devArea || '') === props.filterArea
    )
  }

  return list
    .map((item: any, i: number) => {
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
        _alarmLevel: item._alarmLevel ?? (isAlarm ? 2 : 0),
        isFault: item.isFault ?? false,
        detectionValue: item.detectionValue,
        unit: item.unit,
        alarmThreshold: item.alarmThreshold,
        cutoffThreshold: item.cutoffThreshold,
        reconnectThreshold: item.reconnectThreshold,
        detectionParam: item.detectionParam || '',
        valueUpdateDT: item.valueUpdateDT || '',
        statusTxt: item.statusTxt || item.state || '',
        categoryStateText: item.categoryStateText || buildStateText(item),
      }
    })
    .sort((a, b) => {
      // 报警/故障/分站优先，同区域内按分站号排序
      if (a._isAlarm !== b._isAlarm) return a._isAlarm ? -1 : 1
      if (a.isFault !== b.isFault) return a.isFault ? -1 : 1
      if (a._isOffline !== b._isOffline) return a._isOffline ? 1 : -1
      if (a.devArea !== b.devArea) return a.devArea.localeCompare(b.devArea)
      return a.stationNo.localeCompare(b.stationNo)
    })
})

const totalCount = computed(() => filteredItems.value.length)

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / props.pageSize)))

const effectivePage = computed(() => {
  if (props.page > totalPages.value) return totalPages.value
  return props.page
})

const pagedItems = computed(() => {
  const start = (effectivePage.value - 1) * props.pageSize
  return filteredItems.value.slice(start, start + props.pageSize)
})

// reset to first page when filters change
watch(() => [props.filterCategory, props.filterArea, props.pageSize], () => {
  if (props.page !== 1) emit('update:page', 1)
}, { deep: true })

function onPagination({ page, limit }: { page: number; limit: number }) {
  emit('update:page', page)
  emit('update:pageSize', limit)
  emit('pagination', { page, pageSize: limit })
}

// ── interactions ──
function onAreaClick(area: string) {
  emit('areaClick', area)
}

function onRowClick(item: ListItem) {
  emit('cellClick', item)
}

function onMoreClick() {
  router.push('/safetyMonitoringMore')
}

// ── display helpers ──
const isFLabel = (label: string) => String(label).indexOf('F') !== -1

function displayName(item: ListItem): string {
  return item.detectionParam || item.devName || item.devLabel
}

function showValue(item: ListItem): boolean {
  return item.detectionValue !== undefined && item.detectionValue !== null && !Number.isNaN(item.detectionValue)
}

function formatValue(val: number | undefined): string {
  if (val === undefined || val === null || Number.isNaN(val)) return '-'
  return Number(val).toFixed(2)
}

function displayStateText(item: ListItem): string {
  const text = item.categoryStateText
  if (!text && text !== '0') return '-'
  const n = Number(text)
  if (!Number.isNaN(n) && item.unit) {
    return `${text} ${item.unit}`
  }
  return String(text)
}

function formatTime(t: string | undefined): string {
  if (!t) return '-'
  try {
    const d = new Date(t)
    if (Number.isNaN(d.getTime())) return String(t)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  } catch {
    return String(t)
  }
}

function formatTimeFull(t: string | undefined): string {
  if (!t) return ''
  try {
    const d = new Date(t)
    return Number.isNaN(d.getTime()) ? String(t) : d.toLocaleString('zh-CN', { hour12: false })
  } catch {
    return String(t)
  }
}

function statusText(item: ListItem): string {
  const level = item._alarmLevel || 0
  if (level >= 4) return '突出'
  if (level >= 3) return '紧急'
  if (level >= 2) return '报警'
  if (level >= 1) return '预警'
  if (item.isFault) return '故障'
  if (item._isOffline) return '离线'
  if (isFLabel(item.devLabel)) return '分站'
  return '正常'
}

function rowClass(item: ListItem): Record<string, boolean> {
  const level = item._alarmLevel || 0
  return {
    'is-alarm': item._isAlarm,
    'is-level-1': level === 1,
    'is-level-2': level === 2,
    'is-level-3': level === 3,
    'is-level-4': level >= 4,
    'is-fault': !!item.isFault,
    'is-offline': item._isOffline,
    'is-substation': isFLabel(item.devLabel),
  }
}

function statusTagClass(item: ListItem): Record<string, boolean> {
  const level = item._alarmLevel || 0
  return {
    'tag-level-1': level === 1,
    'tag-level-2': level === 2,
    'tag-level-3': level === 3,
    'tag-level-4': level >= 4,
    'tag-fault': !!item.isFault,
    'tag-offline': item._isOffline,
    'tag-substation': isFLabel(item.devLabel) && level < 1,
    'tag-normal': !item._isAlarm && !item.isFault && !item._isOffline,
  }
}
</script>

<style scoped>
.monitor-point-list {
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  overflow: hidden;
}

.mpl__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.mpl__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mpl__more-btn {
  margin-left: auto;
  padding: 3px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.mpl__more-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.35);
}

.mpl__total {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 4px;
}

.mpl__filter-badge {
  font-size: 11px;
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

.mpl__filter-badge button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  line-height: 1;
}

/* legend */
.mpl__legend {
  display: flex;
  gap: 16px;
  margin: 8px 0;
  flex-shrink: 0;
}

.mpl-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.mpl-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.mpl-legend__dot--primary {
  background: rgba(59, 130, 246, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.mpl-legend__dot--normal {
  background: rgba(34, 197, 94, 0.6);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.mpl-legend__dot--alarm {
  background: rgba(239, 68, 68, 0.7);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.3);
}

.mpl-legend__dot--fault {
  background: rgba(245, 158, 11, 0.6);
  border: 1px solid rgba(245, 158, 11, 0.5);
}

.mpl-legend__dot--offline {
  background: rgba(100, 116, 139, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.4);
}

/* list header */
.mpl__list-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.mpl__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: 6px;
  padding-right: 2px;
}

.mpl__body::-webkit-scrollbar {
  width: 4px;
}

.mpl__body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 2px;
}

.mpl__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  /* 默认正常状态：左侧绿色散射渐变光晕 */
  --mpl-glow: rgba(34, 197, 94, 0.9);
  --mpl-glow-soft: rgba(34, 197, 94, 0.25);
}

.mpl__row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--mpl-glow) 0%, var(--mpl-glow-soft) 100%);
  box-shadow: 0 0 5px 1px var(--mpl-glow-soft), 0 0 12px 3px var(--mpl-glow-soft);
  opacity: 0.8;
  pointer-events: none;
}

.mpl__row:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.18);
}

.mpl__row+.mpl__row {
  margin-top: 2px;
}

.mpl__row.is-level-1 {
  --mpl-glow: rgba(234, 179, 8, 0.95);
  --mpl-glow-soft: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.06);
}

.mpl__row.is-level-2,
.mpl__row.is-alarm:not(.is-level-3):not(.is-level-4) {
  --mpl-glow: rgba(239, 68, 68, 1);
  --mpl-glow-soft: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.08);
}

.mpl__row.is-level-3 {
  --mpl-glow: rgba(249, 115, 22, 1);
  --mpl-glow-soft: rgba(249, 115, 22, 0.5);
  background: rgba(249, 115, 22, 0.1);
}

.mpl__row.is-level-3::before {
  animation: mpl-l3-glow 1.2s ease-in-out infinite;
}

.mpl__row.is-level-4 {
  --mpl-glow: rgba(168, 85, 247, 1);
  --mpl-glow-soft: rgba(168, 85, 247, 0.5);
  background: rgba(168, 85, 247, 0.12);
}

.mpl__row.is-level-4::before {
  animation: mpl-l4-glow 0.8s ease-in-out infinite;
}

.mpl__row.is-fault {
  --mpl-glow: rgba(245, 158, 11, 0.95);
  --mpl-glow-soft: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.06);
}

.mpl__row.is-offline {
  --mpl-glow: rgba(100, 116, 139, 0.8);
  --mpl-glow-soft: rgba(100, 116, 139, 0.25);
  opacity: 0.75;
}

.mpl__row.is-substation:not(.is-alarm):not(.is-fault):not(.is-offline) {
  --mpl-glow: rgba(59, 130, 246, 0.95);
  --mpl-glow-soft: rgba(59, 130, 246, 0.35);
}

@keyframes mpl-l3-glow {

  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

@keyframes mpl-l4-glow {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.mpl__col {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mpl__col--label {
  flex: 0 0 60px;
  font-family: var(--font-mono, monospace);
  color: var(--text-primary);
}

.mpl__col--name {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.mpl__name-main {
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mpl__name-sub {
  font-size: 11px;
  color: var(--text-muted);
}

.mpl__col--value {
  flex: 0 0 110px;
  text-align: center;
  font-family: var(--font-mono, monospace);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mpl__row.is-level-1 .mpl__col--value {
  color: var(--color-warning, #eab308);
}

.mpl__row.is-level-2 .mpl__col--value,
.mpl__row.is-alarm:not(.is-level-3):not(.is-level-4) .mpl__col--value {
  color: var(--color-danger, #ef4444);
}

.mpl__row.is-level-3 .mpl__col--value {
  color: #f97316;
}

.mpl__row.is-level-4 .mpl__col--value {
  color: #a855f7;
}

.mpl__row.is-fault .mpl__col--value {
  color: var(--color-warning, #f59e0b);
}

.mpl__row.is-offline .mpl__col--value {
  color: var(--color-info, #64748b);
}

.mpl__row.is-substation:not(.is-alarm):not(.is-fault):not(.is-offline) .mpl__col--value {
  color: var(--color-primary, #3b82f6);
}

.mpl__col--time {
  flex: 0 0 64px;
  text-align: center;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--text-muted);
}

.mpl__unit {
  font-size: 9px;
  color: var(--text-muted);
  margin-left: 2px;
  font-weight: 400;
}

.mpl__col--status {
  flex: 0 0 50px;
  text-align: center;
}

.mpl__status-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 14px;
}

.tag-normal {
  color: var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.12);
}

.tag-substation {
  color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.12);
}

.tag-level-1 {
  color: var(--color-warning, #eab308);
  background: rgba(234, 179, 8, 0.12);
}

.tag-level-2 {
  color: var(--color-danger, #ef4444);
  background: rgba(239, 68, 68, 0.12);
}

.tag-level-3 {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}

.tag-level-4 {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.15);
  animation: mpl-l4-blink 0.8s ease-in-out infinite;
}

.tag-fault {
  color: var(--color-warning, #f59e0b);
  background: rgba(245, 158, 11, 0.12);
}

.tag-offline {
  color: var(--color-info, #64748b);
  background: rgba(100, 116, 139, 0.12);
}

.mpl__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
  min-height: 120px;
}

.mpl__pagination {
  flex-shrink: 0;
  padding-top: 8px;
  margin-top: auto;
}

.mpl__pagination :deep(.el-pagination) {
  justify-content: flex-end;
}

.mpl__pagination :deep(.el-pagination__total),
.mpl__pagination :deep(.el-pagination__jump) {
  color: var(--text-muted);
  font-size: 12px;
}

.mpl__pagination :deep(.el-pagination__sizes .el-input__inner) {
  background: rgba(15, 23, 42, 0.4);
  border-color: rgba(148, 163, 184, 0.12);
  color: var(--text-secondary);
  font-size: 12px;
}

.mpl__pagination :deep(.el-pager li) {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  color: var(--text-secondary);
  font-size: 12px;
}

.mpl__pagination :deep(.el-pager li.is-active),
.mpl__pagination :deep(.el-pager li:hover) {
  color: var(--color-primary);
  border-color: rgba(59, 130, 246, 0.25);
}

.mpl__pagination :deep(.btn-prev),
.mpl__pagination :deep(.btn-next) {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  color: var(--text-secondary);
}

.mpl__pagination :deep(.btn-prev.is-disabled),
.mpl__pagination :deep(.btn-next.is-disabled) {
  color: var(--text-muted);
  opacity: 0.5;
}

/* ===== Responsive ===== */
@media (max-width: 1280px) {
  .mpl__col--label {
    flex: 0 0 60px;
  }

  .mpl__col--value {
    flex: 0 0 90px;
  }

  .mpl__col--time {
    flex: 0 0 60px;
  }

  .mpl__col--status {
    flex: 0 0 50px;
  }
}

@media (max-width: 900px) {
  .mpl__col--label {
    flex: 0 0 55px;
  }

  .mpl__col--value {
    flex: 0 0 80px;
  }

  .mpl__col--time {
    flex: 0 0 55px;
  }

  .mpl__col--status {
    flex: 0 0 45px;
  }

  .mpl__name-sub {
    display: none;
  }
}
</style>
