<template>
  <div class="safety-dashboard">
    <!-- ===== HERO ROW: KPI 卡片 ===== -->
    <div class="hero-row">
      <HeroCard label="监测总数" :value="kpi.total" color="primary" :loading="loading">
        <template #icon>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </template>
      </HeroCard>
      <HeroCard label="报警点数" :value="kpi.alarmCount" color="danger" :loading="loading">
        <template #icon>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </template>
        <template #footer>
          <div class="hero-alarm-sub" v-if="!loading">
            <!-- AQ6201-2019 §5.6.12.3 分级显示 -->
            <span v-if="kpi.level1Count > 0" class="hero-grade-badge bg-l1">L1 {{ kpi.level1Count }}</span>
            <span v-if="kpi.level2Count > 0" class="hero-grade-badge bg-l2">L2 {{ kpi.level2Count }}</span>
            <span v-if="kpi.level3Count > 0" class="hero-grade-badge bg-l3">L3 {{ kpi.level3Count }}</span>
            <span v-if="kpi.level4Count > 0" class="hero-grade-badge bg-l4">L4 {{ kpi.level4Count }}</span>
            <span v-if="kpi.alarmCount === 0" style="font-size:11px;color:var(--text-muted)">系统运行正常</span>
          </div>
        </template>
      </HeroCard>
      <HeroCard label="正常运行" :value="kpi.normalCount" color="success" :loading="loading">
        <template #icon>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </template>
      </HeroCard>
      <HeroCard label="安全率" :value="kpi.safetyRate" suffix="%" color="warning" :loading="loading">
        <template #icon>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </template>
      </HeroCard>
      <HeroCard label="故障设备" :value="kpi.faultCount" color="danger" :loading="loading">
        <template #icon>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </template>
      </HeroCard>
      <HeroCard label="需标校" :value="kpi.calibCount" color="warning" :loading="loading">
        <template #icon>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </template>
      </HeroCard>
    </div>

    <!-- ===== 突出预警条 AQ6201-2019 §5.5.2.3/§5.5.2.4 ===== -->
    <OutburstWarning :conditions="outburstConditions" :cutoff-range="outburstCutoffRange" @acknowledge="outburstConditions = []" />

    <!-- ===== MAIN: 左右分栏 ===== -->
    <div class="main-area">
      <!-- 左栏：监测点列表 -->
      <div class="left-col">
        <MonitoringPointList :items="monitorItems" :filter-category="filterCategory" :filter-area="filterArea"
          :loading="loading" :page="listPage" :page-size="listPageSize" @cell-click="showDetail"
          @area-click="onAreaClick" @clear-filter="clearCategoryFilter"
          @clear-area-filter="clearAreaFilter" @update:page="listPage = $event"
          @update:page-size="listPageSize = $event" />
      </div>

      <!-- 右栏：实时告警 + 安全状态分解 + 分类统计 + 开关量 -->
      <div class="right-col">
        <!-- AQ6201-2019 §5.6.7.2: 实时告警 -->
        <AlarmTimeline :data="alarmFeed" :loading="alarmLoading" :l3-count="kpi.level3Count"
          :l4-count="kpi.level4Count" />

        <!-- AQ6201-2019 §5.6.12.3: 安全状态分布 -->
        <StatusRing :normal-count="kpi.normalCount" :alarm-count="kpi.alarmCount"
          :fault-count="kpi.faultCount" :l1-count="kpi.level1Count" :l2-count="kpi.level2Count"
          :l3-count="kpi.level3Count" :l4-count="kpi.level4Count" :loading="loading"
          @filter-change="onStatusFilter" />
        <CategoryBar :categories="catCategories" :values="catValues" :total="catTotal" :active-category="filterCategory"
          :loading="loading" @chart-click="onCategoryClick" />

        <!-- quick actions -->
        <div class="quick-actions">
          <button class="quick-action-btn" @click="reportVisible = true">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            日报表
          </button>
          <button class="quick-action-btn" @click="showFeedPanel = !showFeedPanel">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            馈电状态
            <span v-if="feedAbnormalCount > 0" class="quick-alert-dot">{{ feedAbnormalCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Feed Status Panel (底部展开) AQ1029-2019 §9.2.2 ===== -->
    <Transition name="feed-expand">
      <FeedStatusPanel v-if="showFeedPanel" :items="feedItems" class="feed-panel-bottom" />
    </Transition>

    <!-- ===== Report Dialog ===== -->
    <ReportPanel v-model="reportVisible" :items="monitorItems" />

    <!-- ===== Detail Dialog ===== -->
    <SafetyMonitoringDetail v-model="detailVisible" :row="detailRow" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringDashboard' })

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { listSafetyMonitoring, getKpiData } from '@/api/system/safetyMonitoring'
import { getData } from '@/api/system/bar'
import { listEalTimeAlarm } from '@/api/system/ealTimeAlarm'
import { determineAlarmLevel, guessSensorUnit, ALARM_LEVELS, type AlarmLevel } from '@/constants/kpi'
import SafetyMonitoringDetail from '@/components/SafetyMonitoringDetail/index.vue'
import HeroCard from './components/HeroCard.vue'
import StatusRing from './components/StatusRing.vue'
import CategoryBar from './components/CategoryBar.vue'
import AlarmTimeline from './components/AlarmTimeline.vue'
import type { AlarmItem } from './components/AlarmTimeline.vue'
import MonitoringPointList from './components/MonitoringPointList.vue'
import OutburstWarning from './components/OutburstWarning.vue'
import type { OutburstCondition } from './components/OutburstWarning.vue'
import ReportPanel from './components/ReportPanel.vue'
import FeedStatusPanel from './components/FeedStatusPanel.vue'
import type { FeedItem } from './components/FeedStatusPanel.vue'

const router = useRouter()

// ── reactive state ──
const loading = ref(true)
const alarmLoading = ref(true)

const monitorItems = ref<any[]>([])
const kpi = reactive({
  total: 0,
  alarmCount: 0,
  normalCount: 0,
  safetyRate: 0,
  level1Count: 0,
  level2Count: 0,
  level3Count: 0,
  level4Count: 0,
  faultCount: 0,
  calibCount: 0,
})

// category bar
const catCategories = ref<string[]>([])
const catValues = ref<number[]>([])
const catTotal = computed(() => catValues.value.reduce((a, b) => a + b, 0))

// filters
const filterCategory = ref<string | null>(null)
const filterArea = ref<string | null>(null)

// list pagination
const listPage = ref(1)
const listPageSize = ref(50)

// alarm feed (enhanced with level + feedAbnormal)
const alarmFeed = ref<AlarmItem[]>([])

// outburst warning
const outburstConditions = ref<OutburstCondition[]>([])
const outburstCutoffRange = ref('')

// AQ1029-2019 §9.2.2: 馈电状态
const feedItems = ref<FeedItem[]>([])
const showFeedPanel = ref(false)
const feedAbnormalCount = computed(() => feedItems.value.filter(i => i.feedState === 'abnormal').length)

// report
const reportVisible = ref(false)

// detail
const detailVisible = ref(false)
const detailRow = ref<any>(null)

let refreshTimer: ReturnType<typeof setInterval> | null = null

// ── helpers ──
function parseNumeric(val: any): number {
  const n = Number(val)
  return Number.isNaN(n) ? 0 : n
}

function getAlarmLevel(item: any, rawAlarmType: any): AlarmLevel {
  const isAlarm = rawAlarmType == 1 || rawAlarmType === '1'
    || item.statusTxt === '报警' || item.state === '报警'
  if (!isAlarm) return ALARM_LEVELS.LEVEL_0

  const value = parseNumeric(item.value ?? item.devValue ?? item.detectionVal)
  const alarmTh = parseNumeric(item.highAlarm ?? item.alarmThreshold)
  const cutoffTh = parseNumeric(item.highAlarmRestore ?? item.cutoffThreshold)
  const prevValue = parseNumeric(item.prevValue)
  const changeRate = value > 0 && prevValue > 0 ? (value - prevValue) / prevValue : 0

  return determineAlarmLevel(value, alarmTh || value * 1.1, cutoffTh || value * 1.3, changeRate)
}

// AQ6201-2019 §5.5.2.3/§5.5.2.4: 突出预警
function checkOutburstConditions(items: any[]) {
  const alarms = items.filter((i: any) => i._alarmLevel >= 3)
  if (alarms.length === 0) {
    outburstConditions.value = []
    return
  }

  const conds: OutburstCondition[] = []
  let cutoffRange = ''

  const areaGroups = new Map<string, any[]>()
  for (const item of alarms) {
    const area = item.devArea || item.area || ''
    if (!areaGroups.has(area)) areaGroups.set(area, [])
    areaGroups.get(area)!.push(item)
  }

  for (const [area, sensors] of areaGroups) {
    if (sensors.length >= 2) {
      const names = sensors.map((s: any) => s.devName).join(', ')
      conds.push({
        type: 'multi_sensor_spike',
        description: `${area}: ${names} 同时触发高级别报警`,
        active: true,
      })
      cutoffRange = sensors.map((s: any) => s.cutoffRange || area).filter(Boolean).join('; ')
    }

    const hasWindReverse = sensors.some((s: any) =>
      (s.category || s.categoryName || '').includes('风向') && s.detectionValue < 0)
    if (hasWindReverse) {
      conds.push({
        type: 'concentration_spike_wind_reversal',
        description: `${area}: 甲烷浓度迅速升高且风流逆转 — 切断相关区域电源`,
        active: true,
      })
    }

    const hasWindSpeed = sensors.some((s: any) =>
      (s.category || s.categoryName || '').includes('风速') && s.detectionValue > 0.25)
    if (hasWindSpeed) {
      conds.push({
        type: 'concentration_spike_fan_normal',
        description: `${area}: 甲烷浓度迅速升高且风速不低于正常值 — 切断相关区域电源`,
        active: true,
      })
    }

    // AQ6201-2019 §5.5.2.4: 进回风巷同时异常
    const hasInlet = sensors.some((s: any) => (s.devName || '').includes('进风') && s._alarmLevel >= 2)
    const hasReturn = sensors.some((s: any) => (s.devName || '').includes('回风') && s._alarmLevel >= 2)
    if (hasInlet && hasReturn) {
      conds.push({
        type: 'concentration_spike_both_airways',
        description: `${area}: 进回风巷甲烷浓度均迅速升高 — 煤与瓦斯突出风险`,
        active: true,
      })
    }
  }

  outburstConditions.value = conds
  outburstCutoffRange.value = cutoffRange || '相关区域全部非本质安全型电气设备'
}

// 当 API 未返回 categoryStateText 时，从 value/unit/statusTxt/state 推导状态值文本
function buildStateText(item: any, unit: string, numericValue: number): string {
  if (item.categoryStateText) return item.categoryStateText
  if (item.stateText) return item.stateText
  if (item.valueText) return item.valueText
  if (!Number.isNaN(numericValue) && unit) {
    return `${numericValue.toFixed(2)} ${unit}`
  }
  return item.statusTxt || item.state || ''
}

// ── data fetching ──
async function fetchAll() {
  loading.value = true
  try {
    const pageSize = 500
    const [firstRes, kpiRes, catRes] = await Promise.all([
      listSafetyMonitoring({ pageNum: 1, pageSize, isCallThePolice: '', substation: '', type: '', category: [], area: '', site: '' }),
      getKpiData(),
      getData(),
    ])

    const firstData = firstRes.data || {}
    let items: any[] = firstData.items || []
    const total = firstData.total || items.length

    // 拉取剩余分页，确保客户端分页总数与 API 一致
    if (total > items.length) {
      const totalPages = Math.ceil(total / pageSize)
      const remaining: Promise<any>[] = []
      for (let p = 2; p <= totalPages; p++) {
        remaining.push(listSafetyMonitoring({ pageNum: p, pageSize, isCallThePolice: '', substation: '', type: '', category: [], area: '', site: '' }))
      }
      const resList = await Promise.all(remaining)
      for (const res of resList) {
        const pageItems = res.data?.items || []
        items.push(...pageItems)
      }
    }

    let l1 = 0, l2 = 0, l3 = 0, l4 = 0, faults = 0, calibs = 0

    monitorItems.value = items.map((item: any, i: number) => {
      const rawAlarmType = item.alarmType
      const categoryName = item.categoryName || ''
      const level = getAlarmLevel(item, rawAlarmType)
      const unit = guessSensorUnit(categoryName)
      const dv = parseNumeric(item.value ?? item.devValue ?? item.detectionVal)
      const devName = item.devAddress || item.detectionParam || item.devLabel
      const devArea = item.devArea || item.area || ''

      if (level.level === 1) { l1++ }
      else if (level.level === 2) { l2++ }
      else if (level.level === 3) { l3++ }
      else if (level.level === 4) { l4++ }

      const isFault = item.state2 === '异常' || item.state4 === '故障' || item.state5 === '故障' || item.sensorStatus === '故障'
      if (isFault) faults++

      const calibTime = item.calibrationDatetime
      if (calibTime) {
        const daysSinceCalib = (Date.now() - new Date(calibTime).getTime()) / 86400000
        if (daysSinceCalib > 15) calibs++
      }

      return {
        ...item,
        _key: `${item.devLabel}_${i}`,
        _isAlarm: level.level >= 2,
        _alarmLevel: level.level,
        _alarmLevelConfig: level,
        devName,
        detectionParam: item.detectionParam || '',
        devArea,
        category: categoryName,
        stationNo: String(item.stationNo ?? item.substation ?? ''),
        unit,
        detectionValue: dv,
        alarmThreshold: item.highAlarm ?? item.alarmThreshold ?? null,
        cutoffThreshold: item.highAlarmRestore ?? item.cutoffThreshold ?? null,
        reconnectThreshold: item.LowAlarmRestore ?? item.reconnectThreshold ?? null,
        maxValue: parseNumeric(item.maxValue),
        minValue: parseNumeric(item.minValue),
        avgValue: parseNumeric(item.avgValue),
        feedStatus: item.feedStatus ?? (item.kdState ?? ''),
        sensorStatus: item.sensorStatus ?? item.state ?? '',
        cutoffRange: item.powerCutRange ?? item.cutoffRange ?? '',
        alarmStatus: level.level >= 2 ? '报警' : (level.level === 1 ? '预警' : ''),
        valueUpdateDT: item.valueUpdateDT || item.updateTime || item.dt || '',
        categoryStateText: buildStateText(item, unit, dv),
        isFault,
      }
    })

    // KPI
    const raw = kpiRes.data || kpiRes || {}
    const kd = Array.isArray(raw) ? raw[0] || {} : raw
    kpi.total = kd.total ?? monitorItems.value.length
    kpi.alarmCount = kd.alarmCount ?? kd.alarm ?? (l2 + l3 + l4)
    kpi.normalCount = kpi.total - kpi.alarmCount
    kpi.safetyRate = kpi.total > 0 ? Math.round((kpi.normalCount / kpi.total) * 1000) / 10 : 100
    kpi.level1Count = l1
    kpi.level2Count = l2
    kpi.level3Count = l3
    kpi.level4Count = l4
    kpi.faultCount = faults
    kpi.calibCount = calibs

    // category
    const catData: any[] = (catRes.data || []).filter((d: any) => d.txt !== '全部')
    catCategories.value = catData.map((d: any) => d.txt || '')
    catValues.value = catData.map((d: any) => d.num || 0)

    checkOutburstConditions(monitorItems.value)
    buildFeedStatusData()

  } catch (e) {
    console.error('加载安全监测数据失败', e)
  } finally {
    loading.value = false
  }
}

async function fetchAlarms() {
  alarmLoading.value = true
  try {
    const res = await listEalTimeAlarm()
    const items: any[] = (res.data?.items || [])
    alarmFeed.value = items.map((item: any) => ({
      devName: item.devLabel || item.devAddress || '',
      content: item.devAddress || item.devLabel || '',
      alarmTime: item.alarmBeginDT || item.valueUpdateDT || '',
      _key: `${item.devLabel}_${item.alarmBeginDT || Date.now()}`,
      level: item._alarmLevel ?? 2,
      levelLabel: '',
      feedAbnormal: item.feedStatus === '异常' || item.kdState === '异常',
    }))
  } catch (e) {
    console.error('获取实时告警失败', e)
  } finally {
    alarmLoading.value = false
  }
}

// AQ1029-2019 §9.2.2: 馈电状态数据
function buildFeedStatusData() {
  const feeds: FeedItem[] = (monitorItems.value || [])
    .filter((item: any) => item.category === '馈电' || item.feedStatus)
    .map((item: any, i: number) => {
      const feedState = item.feedStatus === '异常' || item.kdState === '异常' ? 'abnormal'
        : item.feedStatus === '断电' ? 'cutoff'
        : item.feedStatus === '离线' || item.devStatus === '离线' ? 'offline' : 'normal'
      return {
        devName: item.devName || item.devLabel || '',
        feedState,
        feedLabel: item.feedStatus || item.kdState || '正常',
        area: item.devArea || item.area || '',
        cutoffCmd: item._isAlarm && item._alarmLevel >= 2,
        startTime: item.valueUpdateDT ? formatTime(item.valueUpdateDT) : undefined,
        isNew: feedState !== 'normal',
        _key: `feed_${item.devLabel}_${i}`,
      } as FeedItem
    })

  if (feeds.length === 0) {
    const alarmSensors = monitorItems.value.filter((i: any) => i._isAlarm).slice(0, 5)
    for (const item of alarmSensors) {
      feeds.push({
        devName: item.devName || '',
        feedState: item._alarmLevel >= 3 ? 'cutoff' : 'abnormal',
        feedLabel: item._alarmLevel >= 3 ? '已断电' : '异常',
        area: item.devArea || '',
        cutoffCmd: item._alarmLevel >= 2,
        _key: `feed_derived_${item.devLabel}`,
      })
    }
  }

  feedItems.value = feeds
}

function formatTime(t: string | number): string {
  try {
    const d = new Date(t)
    return Number.isNaN(d.getTime()) ? String(t) : d.toLocaleString('zh-CN', { hour12: false })
  } catch { return String(t) }
}

// ── interactions ──
function onCategoryClick(category: string) {
  filterCategory.value = filterCategory.value === category ? null : category
  filterArea.value = null
  listPage.value = 1
}

function onStatusFilter(filter: string | null) {
  if (filter === null) { filterCategory.value = null; filterArea.value = null }
  listPage.value = 1
}

function onAreaClick(area: string) {
  filterArea.value = filterArea.value === area ? null : area
  filterCategory.value = null
  listPage.value = 1
}

function clearCategoryFilter() { filterCategory.value = null; listPage.value = 1 }
function clearAreaFilter() { filterArea.value = null; listPage.value = 1 }

function showDetail(item: any) {
  detailRow.value = item
  detailVisible.value = true
}

function goToSafetyMore() { router.push('/safetyMonitoringMore') }

// ── lifecycle ──
onMounted(() => {
  fetchAll()
  fetchAlarms()
  refreshTimer = setInterval(() => { fetchAll(); fetchAlarms() }, 10000)
})

onBeforeUnmount(() => {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
})
</script>

<style scoped>
.safety-dashboard {
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary, #070b15);
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(239, 68, 68, 0.03) 0%, transparent 50%);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.glass-panel) {
  background: rgba(20, 29, 47, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 12px;
  transition: border-color 0.2s;
}

:deep(.glass-panel:hover) {
  border-color: rgba(148, 163, 184, 0.14);
}

:deep(.glass-panel--danger-top) {
  border-top: 2px solid var(--color-danger, #ef4444);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* ===== Hero Row ===== */
.hero-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  flex-shrink: 0;
}

.hero-alarm-sub {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}

.hero-grade-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: 4px;
  line-height: 16px;
}

.bg-l1 { color: var(--color-warning); background: rgba(234,179,8,0.12); }
.bg-l2 { color: var(--color-danger); background: rgba(239,68,68,0.12); }
.bg-l3 { color: #f97316; background: rgba(249,115,22,0.12); }
.bg-l4 { color: #a855f7; background: rgba(168,85,247,0.15); animation: l4-hero-pulse 1s ease-in-out infinite; }

@keyframes l4-hero-pulse {
  0%, 100% { background: rgba(168,85,247,0.15); }
  50% { background: rgba(168,85,247,0.25); }
}

/* ===== Main Area ===== */
.main-area {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 10px;
}

.left-col {
  flex: 0 0 70%;
  max-width: 70%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.right-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 2px;
}

.right-col::-webkit-scrollbar { width: 3px; }
.right-col::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.1); border-radius: 2px; }

.left-col :deep(.monitor-point-list) { flex: 1; min-height: 0; }

/* 右栏各组件：flex-basis 分配 + min-height 防止挤压 */
.right-col :deep(.grade-panel) {
  flex: 0 0 auto;
  max-height: 110px;
  overflow-y: auto;
}
.right-col :deep(.status-ring) {
  flex: 1 1 140px;
  min-height: 120px;
}
.right-col :deep(.cat-bar) {
  flex: 1 1 100px;
  min-height: 80px;
}
.right-col :deep(.switch-chart) {
  flex: 1 1 140px;
  min-height: 120px;
}
.right-col :deep(.alarm-timeline) {
  flex: 0 0 auto;
  height: 200px;
  min-height: 140px;
  order: -1;
}

/* quick actions */
.quick-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(20, 29, 47, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.quick-action-btn:hover {
  border-color: rgba(59, 130, 246, 0.2);
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.06);
}

.quick-alert-dot {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 16px; height: 16px;
  border-radius: 8px;
  background: var(--color-danger);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 0 4px var(--color-danger-glow);
}

/* bottom feed panel */
.feed-panel-bottom {
  flex-shrink: 0;
  max-height: 200px;
  overflow: hidden;
}

.feed-expand-enter-active, .feed-expand-leave-active { transition: all 0.3s ease; }
.feed-expand-enter-from, .feed-expand-leave-to { max-height: 0; opacity: 0; transform: translateY(-8px); }

/* ===== Responsive ===== */
@media (max-width: 1600px) {
  .hero-row { grid-template-columns: repeat(3, 1fr); }
  .left-col { flex: 0 0 70%; max-width: 70%; }
}

@media (max-width: 1280px) {
  .hero-row { grid-template-columns: repeat(2, 1fr); }
  .left-col { flex: 0 0 70%; max-width: 70%; }
}

@media (max-width: 900px) {
  .main-area { flex-direction: column; }
  .left-col { flex: 0 0 auto; max-width: none; }
  .right-col { flex: 0 0 auto; width: auto; max-height: 50vh; overflow-y: auto; }
}
</style>
