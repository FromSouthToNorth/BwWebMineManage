<template>
  <div class="alarm-timeline" :class="{ 'alarm-timeline--horizontal': horizontal, 'glass-panel': true, 'glass-panel--danger-top': !horizontal }">
    <!-- header -->
    <div class="alarm-timeline__header">
      <div class="alarm-timeline__title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
          class="alarm-timeline__bell">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>实时告警</span>
        <span v-if="data.length > 0" class="alarm-timeline__count">{{ data.length }}</span>
        <!-- AQ6201-2019 §5.6.12.3: 分级计数 -->
        <span v-if="l4Count > 0" class="alarm-timeline__grade-count grade-l4">{{ l4Count }}</span>
        <span v-if="l3Count > 0" class="alarm-timeline__grade-count grade-l3">{{ l3Count }}</span>
      </div>
      <div class="alarm-timeline__actions">
        <span class="alarm-timeline__live" />
        <span class="alarm-timeline__live-label">LIVE</span>
        <el-button link size="small" @click="openHistory">历史 &rarr;</el-button>
      </div>
    </div>

    <!-- scroll body -->
    <div class="alarm-timeline__body" v-loading="loading" element-loading-text="加载告警...">
      <!-- empty -->
      <div v-if="!loading && data.length === 0" class="alarm-timeline__empty">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"
          style="color: var(--color-success); opacity: 0.3;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>系统运行正常，无告警</span>
      </div>

      <!-- horizontal cards -->
      <TransitionGroup v-if="horizontal" name="alarm-enter" tag="div" class="alarm-timeline__cards"
        @enter="onEnter">
        <div v-for="(item, idx) in displayItems" :key="item._key" class="alarm-card"
          :class="[`alarm-card--lv${item.level}`, { 'alarm-card--new': idx === 0, 'alarm-card--feed-abnormal': item.feedAbnormal }]">
          <div class="alarm-card__side" :class="`alarm-card--lv${item.level}`">
            <span class="alarm-card__level-badge" :class="`level-badge--lv${item.level}`">L{{ item.level }} {{ item.levelLabel }}</span>
          </div>
          <div class="alarm-card__body">
            <div class="alarm-card__top">
              <span class="alarm-card__device" :title="item.devName">{{ item.devName }}</span>
              <span class="alarm-card__time">{{ item.timeStr }}</span>
            </div>
            <div class="alarm-card__content" :title="item.content">
              {{ item.content }}
              <span v-if="item.feedAbnormal" class="alarm-card__feed-tag">馈电异常</span>
            </div>
          </div>
          <div v-if="idx === 0" class="alarm-card__new-badge">NEW</div>
        </div>
      </TransitionGroup>

      <!-- vertical timeline items -->
      <TransitionGroup v-else name="alarm-enter" tag="div" class="alarm-timeline__list">
        <div v-for="(item, idx) in displayItems" :key="item._key" class="alarm-tl-item"
          :class="[`alarm-tl-item--lv${item.level}`, { 'alarm-tl-item--new': idx === 0, 'alarm-tl-item--feed-abnormal': item.feedAbnormal }]">
          <div class="alarm-tl-item__dot" :class="`alarm-tl-item__dot--lv${item.level}`" />
          <div class="alarm-tl-item__line" />
          <div class="alarm-tl-item__body">
            <div class="alarm-tl-item__top">
              <span class="alarm-tl-item__device">{{ item.devName }}</span>
              <!-- AQ6201-2019 §5.6.12.3: 分级色标 -->
              <span class="alarm-tl-item__level-badge" :class="`level-badge--lv${item.level}`">L{{ item.level }} {{ item.levelLabel }}</span>
              <span class="alarm-tl-item__time">{{ item.timeStr }}</span>
            </div>
            <div class="alarm-tl-item__content">
              {{ item.content }}
              <!-- 馈电异常标记 -->
              <span v-if="item.feedAbnormal" class="alarm-tl-item__feed-tag">馈电异常</span>
            </div>
            <div v-if="idx === 0" class="alarm-tl-item__new-badge">NEW</div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>

  <!-- 历史报警弹窗 -->
  <el-dialog v-model="showHistory" width="760px" top="5vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon" style="color: var(--color-danger); background: rgba(239,68,68,0.1);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">历史报警</div>
          <div class="dialog-header-sub">历史报警查询与筛选</div>
        </div>
      </div>
    </template>

    <!-- 筛选栏 -->
    <div class="alarm-history-filters">
      <div class="ah-filter-item">
        <label class="ah-filter-label">地点</label>
        <el-input v-model="historyFilter.address" placeholder="输入地点" clearable size="small" style="width:140px;" />
      </div>
      <div class="ah-filter-item">
        <label class="ah-filter-label">类型</label>
        <el-select v-model="historyFilter.typeName" placeholder="全部" clearable size="small" style="width:110px;">
          <el-option v-for="t in historyTypeOptions" :key="t.txt" :label="t.txt" :value="t.txt" />
        </el-select>
      </div>
      <div class="ah-filter-item">
        <label class="ah-filter-label">时间</label>
        <el-date-picker v-model="historyDateRange" type="datetimerange" range-separator="至" start-placeholder="开始" end-placeholder="结束"
          value-format="YYYY-MM-DD HH:mm:ss" size="small" style="width:260px;" />
      </div>
      <el-button type="primary" size="small" class="ah-search-btn" @click="searchHistory">查询</el-button>
    </div>

    <!-- 历史列表 -->
    <div v-loading="historyLoading" class="alarm-history-list">
      <div v-for="item in historyData" :key="item._key" class="alarm-history-item" :class="`alarm-history-item--lv${item.level}`">
        <div class="alarm-history-item__dot" :class="`alarm-tl-item__dot--lv${item.level}`"></div>
        <div class="alarm-history-item__body">
          <div class="alarm-history-item__top">
            <span class="alarm-history-item__device">{{ item.devName }}</span>
            <span class="alarm-history-item__badge" :class="`level-badge--lv${item.level}`">L{{ item.level }} {{ item.levelLabel }}</span>
            <span v-if="item.categoryName" class="alarm-history-item__cat">{{ item.categoryName }}</span>
            <span class="alarm-history-item__time">{{ item.timeStr }}</span>
          </div>
          <div class="alarm-history-item__content">{{ item.content }}</div>
        </div>
      </div>
      <div v-if="!historyLoading && historyData.length === 0" class="alarm-history-empty">无匹配记录</div>
    </div>

    <div v-if="historyTotal > 0" class="alarm-history-pagination">
      <Pagination :total="historyTotal" :page="historyFilter.pageNum" :limit="historyFilter.pageSize" :small="true"
        @update:page="onHistoryPage" @pagination="onHistoryPagination" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'AlarmTimeline' })

import { ref, reactive, computed } from 'vue'
import { listHistoricalAlarm } from '@/api/system/ealTimeAlarm'
import { typeSelect } from '@/api/system/safetyMonitoring'
import { getRecentDayRange } from '@/utils/util'

export interface AlarmItem {
  devName: string
  content: string
  alarmTime: string
  _key: string
  /** AQ6201-2019 §5.6.12.3: 报警级别 1-4 */
  level?: number
  /** 级别标签 */
  levelLabel?: string
  /** 馈电异常 */
  feedAbnormal?: boolean
}

const props = withDefaults(defineProps<{
  data: AlarmItem[]
  loading?: boolean
  maxItems?: number
  l3Count?: number
  l4Count?: number
  horizontal?: boolean
}>(), {
  loading: false,
  maxItems: 8,
  l3Count: 0,
  l4Count: 0,
  horizontal: false,
})

defineEmits<{
  viewMore: []
}>()

const showHistory = ref(false)
const historyData = ref<any[]>([])
const historyTotal = ref(0)
const historyLoading = ref(false)
const historyTypeOptions = ref<any[]>([])
const historyDateRange = ref<[string, string] | null>(null)

const historyFilter = reactive({
  pageNum: 1,
  pageSize: 20,
  address: '',
  typeName: '',
})

async function openHistory() {
  showHistory.value = true
  if (historyData.value.length === 0) {
    historyDateRange.value = getRecentDayRange(3)
    getTypeOptions()
    await searchHistory()
  }
}

async function getTypeOptions() {
  try {
    const res = await typeSelect()
    historyTypeOptions.value = res.data || []
  } catch (e) { /* ignore */ }
}

async function searchHistory() {
  historyFilter.pageNum = 1
  await doFetchHistory()
}

async function doFetchHistory() {
  historyLoading.value = true
  try {
    const res = await listHistoricalAlarm({
      pageNum: historyFilter.pageNum,
      pageSize: historyFilter.pageSize,
      address: historyFilter.address,
      typeName: historyFilter.typeName,
      category: '',
      startTime: historyDateRange.value?.[0] || '',
      endTime: historyDateRange.value?.[1] || '',
    })
    const items: any[] = res.data?.items || []
    historyData.value = items.map((item: any) => ({
      devName: item.devLabel || item.devAddress || '',
      content: item.detectionParam || item.devAddress || item.devLabel || '',
      categoryName: item.categoryName || '',
      alarmTime: item.faultBeginDT || item.valueUpdateDT || '',
      _key: `${item.devLabel}_${item.faultBeginDT || Date.now()}_${Math.random()}`,
      level: String(item.faultState).includes('报警') ? 2 : 1,
      levelLabel: String(item.faultState).includes('报警') ? '报警' : '预警',
      timeStr: formatAlarmTime(item.faultBeginDT || item.valueUpdateDT || ''),
    }))
    historyTotal.value = res.data?.total || 0
  } catch (e) {
    console.error('获取历史报警失败', e)
  } finally {
    historyLoading.value = false
  }
}

function onHistoryPage(page: number) {
  historyFilter.pageNum = page
  doFetchHistory()
}

function onHistoryPagination({ page, limit }: { page: number; limit: number }) {
  historyFilter.pageNum = page
  historyFilter.pageSize = limit
  doFetchHistory()
}

const displayItems = computed(() => {
  return props.data.slice(0, props.maxItems).map((item, i) => ({
    ...item,
    level: item.level ?? 2,
    levelLabel: item.levelLabel ?? getLevelLabel(item.level ?? 2),
    timeStr: formatAlarmTime(item.alarmTime),
    _idx: i,
  }))
})

const LEVEL_LABELS: Record<number, string> = {
  1: '预警',
  2: '报警',
  3: '紧急',
  4: '突出',
}

function getLevelLabel(level: number): string {
  return LEVEL_LABELS[level] || '报警'
}

function formatAlarmTime(t: string): string {
  if (!t) return ''
  const m = t.match(/(\d{2}:\d{2}:\d{2})/)
  return m ? m[1] : t.slice(0, 8)
}

function onEnter(el: Element) {
  if (props.horizontal && el.parentElement) {
    el.parentElement.scrollTo({ left: 0, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.alarm-timeline {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  min-height: 320px;
  max-height: 400px;
}

/* header */
.alarm-timeline__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.alarm-timeline__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.alarm-timeline__bell {
  color: var(--color-danger);
  filter: drop-shadow(0 0 3px var(--color-danger-glow));
}

.alarm-timeline__count {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: var(--color-danger);
  padding: 0 6px;
  border-radius: 8px;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
}

/* 分级计数小圆点 */
.alarm-timeline__grade-count {
  font-size: 9px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: 8px;
  line-height: 15px;
  min-width: 15px;
  text-align: center;
}

.grade-l3 {
  color: #fff;
  background: #f97316;
}

.grade-l4 {
  color: #fff;
  background: #a855f7;
  animation: grade-l4-pulse 1s ease-in-out infinite;
}

@keyframes grade-l4-pulse {
  0%, 100% { box-shadow: 0 0 4px rgba(168,85,247,0.4); }
  50% { box-shadow: 0 0 10px rgba(168,85,247,0.7); }
}

.alarm-timeline__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alarm-timeline__live {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger-glow);
  animation: live-pulse 1.5s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.alarm-timeline__live-label {
  font-size: 9px;
  font-weight: 700;
  color: var(--color-danger);
  letter-spacing: 1px;
}

/* body */
.alarm-timeline__body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.alarm-timeline__body::-webkit-scrollbar {
  width: 3px;
}

.alarm-timeline__body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.12);
  border-radius: 2px;
}

/* empty */
.alarm-timeline__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

/* timeline items */
.alarm-timeline__list {
  position: relative;
  padding-left: 16px;
}

.alarm-tl-item {
  position: relative;
  padding: 6px 0 6px 14px;
  min-height: 48px;
}

/* Level-based dot colors */
.alarm-tl-item__dot {
  position: absolute;
  left: -16px;
  top: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
}

.alarm-tl-item__dot--lv1 { background: var(--color-warning); box-shadow: 0 0 4px rgba(234,179,8,0.3); }
.alarm-tl-item__dot--lv2 { background: var(--color-danger); box-shadow: 0 0 6px var(--color-danger-glow); }
.alarm-tl-item__dot--lv3 { background: #f97316; box-shadow: 0 0 8px rgba(249,115,22,0.5); }
.alarm-tl-item__dot--lv4 { background: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.6); animation: dot-lv4-pulse 0.8s ease-in-out infinite; }

@keyframes dot-lv4-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(168,85,247,0.4); }
  50% { box-shadow: 0 0 14px rgba(168,85,247,0.7), 0 0 24px rgba(168,85,247,0.3); }
}

.alarm-tl-item--new .alarm-tl-item__dot--lv2 {
  animation: dot-lv2-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-lv2-pulse {
  0%, 100% { box-shadow: 0 0 4px var(--color-danger-glow); }
  50% { box-shadow: 0 0 12px var(--color-danger-glow), 0 0 20px rgba(239, 68, 68, 0.4); }
}

.alarm-tl-item__line {
  position: absolute;
  left: -13px;
  top: 24px;
  bottom: 0;
  width: 1px;
  background: rgba(239, 68, 68, 0.12);
}

.alarm-tl-item:last-child .alarm-tl-item__line {
  display: none;
}

.alarm-tl-item__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  position: relative;
}

.alarm-tl-item__top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alarm-tl-item__device {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Level badge */
.alarm-tl-item__level-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.level-badge--lv1 { color: var(--color-warning); background: rgba(234,179,8,0.12); }
.level-badge--lv2 { color: var(--color-danger); background: rgba(239,68,68,0.12); }
.level-badge--lv3 { color: #f97316; background: rgba(249,115,22,0.12); }
.level-badge--lv4 { color: #a855f7; background: rgba(168,85,247,0.15); animation: badge-lv4-blink 1s ease-in-out infinite; }

@keyframes badge-lv4-blink {
  0%, 100% { background: rgba(168,85,247,0.15); }
  50% { background: rgba(168,85,247,0.3); }
}

.alarm-tl-item__time {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
  background: rgba(148, 163, 184, 0.06);
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.alarm-tl-item__content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 馈电异常标记 */
.alarm-tl-item__feed-tag {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.15);
  padding: 0 5px;
  border-radius: 3px;
  line-height: 14px;
  flex-shrink: 0;
}

.alarm-tl-item__new-badge {
  position: absolute;
  right: 0;
  top: 2px;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.12);
  padding: 0 5px;
  border-radius: 3px;
  line-height: 15px;
  animation: new-blink 1.2s ease-in-out infinite;
}

@keyframes new-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* enter animation */
.alarm-enter-enter-active {
  transition: all 0.35s ease;
}

.alarm-enter-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

/* ===== Horizontal mode (top alert bar) ===== */
.alarm-timeline--horizontal {
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  min-height: 72px;
  max-height: 96px;
  padding: 8px 12px;
}

.alarm-timeline--horizontal .alarm-timeline__header {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.alarm-timeline--horizontal .alarm-timeline__title {
  flex-wrap: wrap;
}

.alarm-timeline--horizontal .alarm-timeline__actions {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.alarm-timeline--horizontal .alarm-timeline__body {
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  display: flex;
  align-items: center;
}

.alarm-timeline--horizontal .alarm-timeline__body::-webkit-scrollbar {
  height: 3px;
}

.alarm-timeline--horizontal .alarm-timeline__empty {
  flex-direction: row;
  padding: 0 16px;
}

.alarm-timeline__cards {
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-width: 0;
}

.alarm-card {
  position: relative;
  display: flex;
  align-items: stretch;
  min-width: 220px;
  max-width: 280px;
  flex: 0 0 auto;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  overflow: hidden;
  padding: 8px 10px;
  transition: all 0.2s;
}

.alarm-card:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.18);
}

.alarm-card__side {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-right: 8px;
  margin-right: 8px;
  border-right: 1px solid rgba(148, 163, 184, 0.08);
}

.alarm-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}

.alarm-card__top {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.alarm-card__device {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.alarm-card__time {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
  background: rgba(148, 163, 184, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.alarm-card__content {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
}

.alarm-card__level-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.alarm-card__feed-tag {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.15);
  padding: 0 4px;
  border-radius: 3px;
  line-height: 13px;
  flex-shrink: 0;
}

.alarm-card__new-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 8px;
  font-weight: 700;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.12);
  padding: 0 4px;
  border-radius: 3px;
  line-height: 13px;
  animation: new-blink 1.2s ease-in-out infinite;
}

.alarm-card--lv1 { border-left: 3px solid var(--color-warning); }
.alarm-card--lv2 { border-left: 3px solid var(--color-danger); }
.alarm-card--lv3 { border-left: 3px solid #f97316; }
.alarm-card--lv4 { border-left: 3px solid #a855f7; animation: card-lv4-glow 1s ease-in-out infinite; }

@keyframes card-lv4-glow {
  0%, 100% { box-shadow: inset 3px 0 0 rgba(168,85,247,0.4); }
  50% { box-shadow: inset 3px 0 0 rgba(168,85,247,0.8); }
}

/* horizontal enter animation */
.alarm-timeline--horizontal .alarm-enter-enter-active {
  transition: all 0.35s ease;
}

.alarm-timeline--horizontal .alarm-enter-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1280px) {
  .alarm-timeline--horizontal {
    flex-direction: column;
    min-height: auto;
    max-height: none;
    gap: 6px;
  }

  .alarm-timeline--horizontal .alarm-timeline__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .alarm-timeline--horizontal .alarm-timeline__actions {
    flex-direction: row;
    align-items: center;
  }

  .alarm-timeline--horizontal .alarm-timeline__body {
    min-height: 64px;
  }
}
</style>

<style>
/* alarm history dialog — 非 scoped 以作用于 append-to-body 的 el-dialog */

/* 筛选栏 */
.alarm-history-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: rgba(20, 29, 47, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 8px;
  margin-bottom: 10px;
}

.ah-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ah-filter-label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.ah-search-btn {
  margin-left: auto;
}

/* 列表区域 */
.alarm-history-list {
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 4px;
}

.alarm-history-list::-webkit-scrollbar {
  width: 4px;
}

.alarm-history-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 2px;
}

.alarm-history-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 6px;
  position: relative;
}

.alarm-history-item + .alarm-history-item {
  margin-top: 6px;
}

.alarm-history-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.alarm-history-item__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alarm-history-item__top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alarm-history-item__device {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono, monospace);
}

.alarm-history-item__badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.alarm-history-item__time {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
  background: rgba(148, 163, 184, 0.06);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
  flex-shrink: 0;
}

.alarm-history-item__cat {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  background: rgba(148, 163, 184, 0.08);
  padding: 0 5px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.alarm-history-item__content {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-history-pagination {
  padding: 10px 0 0;
  display: flex;
  justify-content: flex-end;
}

.alarm-history-pagination :deep(.el-pagination__total),
.alarm-history-pagination :deep(.el-pagination__jump),
.alarm-history-pagination :deep(.el-pager li),
.alarm-history-pagination :deep(.el-pagination__sizes .el-input__inner) {
  font-size: 11px;
}

.alarm-history-item--lv1 { border-left: 3px solid var(--color-warning, #eab308); }
.alarm-history-item--lv2 { border-left: 3px solid var(--color-danger, #ef4444); }
.alarm-history-item--lv3 { border-left: 3px solid #f97316; }
.alarm-history-item--lv4 { border-left: 3px solid #a855f7; }

.alarm-history-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
