<template>
  <div ref="pageRef" class="safety-more-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <el-button text size="small" class="back-btn" aria-label="返回上一页" @click="goBack">
        <svg class="back-btn__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        返回
      </el-button>

      <div class="page-header__title">
        <h1 class="page-title">安全监测详情</h1>
        <p class="page-subtitle">实时监测数据列表 · 共 {{ total }} 条记录</p>
      </div>

      <el-button type="primary" size="small" class="refresh-btn btn-primary" :loading="loading" @click="handleQuery">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        刷新
      </el-button>

      <div class="auto-refresh" @click="toggleAutoRefresh" :class="{ 'auto-refresh--paused': !autoRefresh }">
        <span class="live-dot" :class="{ active: autoRefresh }" />
        <span class="live-text">{{ autoRefresh ? '自动刷新' : '已暂停' }}</span>
      </div>

      <el-select v-model="refreshInterval" size="small" class="refresh-interval" @change="onIntervalChange">
        <el-option v-for="opt in refreshOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </header>

    <!-- KPI 概览 -->
    <KpiSection :data="kpiData" />

    <!-- 筛选条件 -->
    <section class="filter-section">
      <div class="filter-toolbar">
        <div class="filter-item">
          <span class="filter-label">报警状态</span>
          <el-select v-model="queryParams.isCallThePolice" placeholder="全部" size="small" clearable @change="handleQuery"
            class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="报警" value="1" />
            <el-option label="正常" value="0" />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">分站</span>
          <el-select v-model="queryParams.substation" placeholder="全部" size="small" clearable @change="handleQuery"
            class="filter-select">
            <el-option v-for="item in substationOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">类型</span>
          <el-select v-model="queryParams.type" placeholder="全部" size="small" clearable @change="handleQuery"
            class="filter-select">
            <el-option v-for="item in typeOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </div>

        <div class="filter-item filter-item--wide">
          <span class="filter-label">类别</span>
          <el-select v-model="queryParams.category" placeholder="全部" size="small" clearable multiple collapse-tags
            @change="handleQuery" class="filter-select">
            <el-option v-for="item in categoryOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">区域</span>
          <el-select v-model="queryParams.area" placeholder="全部" size="small" clearable @change="handleQuery"
            class="filter-select">
            <el-option v-for="item in areaOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">地点</span>
          <el-input v-model="queryParams.site" placeholder="输入地点关键词" size="small" clearable @keyup.enter="handleQuery"
            class="filter-input">
            <template #prefix>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </template>
          </el-input>
        </div>

        <div class="filter-actions">
          <el-button type="primary" size="small" class="btn-primary" @click="handleQuery">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            查询
          </el-button>
          <el-button size="small" class="btn-default" @click="resetQuery">重置</el-button>
        </div>
      </div>
    </section>

    <!-- 数据列表 -->
    <section ref="tableSectionRef" class="table-section">
      <div class="table-card">
        <div class="table-card__header">
          <div class="table-card__title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
            <span>监测点列表</span>
          </div>
          <div class="table-card__status">
            <span class="status-indicator" :class="tableCardStatus" />
            <span class="status-text">{{ tableCardStatus === 'alarm' ? '存在报警' : '运行正常' }}</span>
          </div>
        </div>

        <div class="table-card__body">
          <div v-if="!isMobile" class="dual-table">
            <el-table v-for="(list, index) in sMLeftRightLists" :key="index" v-loading="loading" :data="list" stripe
              size="small" :max-height="tableHeight" :row-class-name="rowClassName" @row-click="handleRowClick">
              <el-table-column label="点号" align="center" min-width="55" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="point-label" :class="{ 'point-label--substation': isSubstation(row) }"
                    @click.stop="handleRowClick(row)">
                    {{ row.devLabel || '--' }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column prop="detectionParam" label="监测参数" align="center" min-width="140"
                show-overflow-tooltip />

              <el-table-column label="监测值" align="center" min-width="85">
                <template #default="{ row }">
                  <span :class="row.statusTxt === '正常' ? '' : 'text-red'" v-html="row.detectionVal" />
                </template>
              </el-table-column>

              <el-table-column label="状态" align="center" min-width="55">
                <template #default="{ row }">
                  <el-tag :type="row.statusTxt === '正常' ? 'success' : 'danger'" size="small" effect="dark">
                    {{ row.statusTxt || '--' }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="最后变更时间" align="center" min-width="115">
                <template #default="{ row }">
                  <span class="update-time" :class="{ 'update-time--substation': isSubstation(row) }"
                    @click.stop="showHistory(row)">
                    {{ formatTime(row.valueUpdateDT) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-table v-else v-loading="loading" :data="tableData" stripe size="small" :max-height="tableHeight"
            :row-class-name="rowClassName" @row-click="handleRowClick">
            <el-table-column label="点号" align="center" min-width="55" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="point-label" :class="{ 'point-label--substation': isSubstation(row) }"
                  @click.stop="handleRowClick(row)">
                  {{ row.devLabel || '--' }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="detectionParam" label="监测参数" align="center" min-width="140" show-overflow-tooltip />

            <el-table-column label="监测值" align="center" min-width="85">
              <template #default="{ row }">
                <span :class="row.statusTxt === '正常' ? '' : 'text-red'" v-html="row.detectionVal" />
              </template>
            </el-table-column>

            <el-table-column label="状态" align="center" min-width="55">
              <template #default="{ row }">
                <el-tag :type="row.statusTxt === '正常' ? 'success' : 'danger'" size="small" effect="dark">
                  {{ row.statusTxt || '--' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="最后变更时间" align="center" min-width="115">
              <template #default="{ row }">
                <span class="update-time" :class="{ 'update-time--substation': isSubstation(row) }"
                  @click.stop="showHistory(row)">
                  {{ formatTime(row.valueUpdateDT) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="total > 0" class="table-card__footer">
          <pagination :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
            @pagination="handlePagination" />
        </div>
      </div>
    </section>

    <!-- 详情弹窗 -->
    <SafetyMonitoringDetail ref="detailRef" v-model="detailVisible" :row="currentRow" />

  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringMore' })

import { ref, reactive, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import SafetyMonitoringDetail from '@/components/SafetyMonitoringDetail/index.vue'
import KpiSection from '@/components/KpiSection/index.vue'
import { listSafetyMonitoring, substationSelect, typeSelect, categorySelect, areaSelect, getKpiData } from '@/api/system/safetyMonitoring'


const loading = ref(false)
const tableData = ref<any[]>([])
const sMLeftRightLists = ref<any[][]>([[], []])
const total = ref(0)
const currentRow = ref<any>(null)
const kpiData = ref<Record<string, any>>({})

const appStore = useAppStore()
const isMobile = computed(() => appStore.isMobile)

const substationOptions = ref<any[]>([])
const typeOptions = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const areaOptions = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  isCallThePolice: '',
  substation: '',
  type: '',
  category: [] as string[],
  area: '',
  site: '',
})

const detailVisible = ref(false)
const detailRef = ref<InstanceType<typeof SafetyMonitoringDetail>>()

const pageRef = ref<HTMLDivElement>()
const tableSectionRef = ref<HTMLDivElement>()
const tableHeight = ref(400)
let resizeObserver: ResizeObserver | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
const autoRefresh = ref(true)
const refreshInterval = ref(30000)
const refreshOptions = [
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
]

const router = useRouter()

const tableCardStatus = computed(() => tableData.value.some(r => r.alarmStatus === '报警') ? 'alarm' : 'normal')

function isSubstation(row: any) {
  return String(row.devLabel || '').includes('F')
}

function rowClassName({ row }: { row: any }) {
  return row.alarmStatus === '报警' || row.statusTxt === '报警' ? 'alarm-row' : ''
}

function formatTime(t: string | number | undefined | null): string {
  if (!t) return '--'
  try {
    const d = new Date(t)
    if (Number.isNaN(d.getTime())) return String(t)
    return d.toLocaleString('zh-CN', { hour12: false })
  } catch {
    return String(t)
  }
}

function splitTableData(list: any[]) {
  if (isMobile.value) {
    sMLeftRightLists.value = []
    return
  }
  if (Array.isArray(list) && list.length > 0) {
    const index = Math.ceil(list.length / 2)
    sMLeftRightLists.value = [list.slice(0, index), list.slice(index)]
  } else {
    sMLeftRightLists.value = []
  }
}

function goBack() {
  router.back()
}

async function loadKpi() {
  try {
    const res = await getKpiData()
    const raw = res.data || res || {}
    kpiData.value = Array.isArray(raw) ? raw[0] || {} : raw
  } catch (e) {
    console.warn('KPI 8453 err:', e)
  }
}

function computeTableHeight() {
  nextTick(() => {
    const section = tableSectionRef.value
    if (!section) return
    const header = section.querySelector('.table-card__header') as HTMLElement
    const footer = section.querySelector('.table-card__footer') as HTMLElement
    const headerH = header?.offsetHeight || 48
    const footerH = footer?.offsetHeight || 0
    tableHeight.value = Math.max(200, section.clientHeight - headerH - footerH)
  })
}

async function getSelectOptions() {
  try {
    const [subRes, typeRes, catRes, areaRes] = await Promise.all([
      substationSelect(),
      typeSelect(),
      categorySelect(),
      areaSelect(),
    ])
    substationOptions.value = subRes.data || []
    typeOptions.value = typeRes.data || []
    categoryOptions.value = catRes.data || []
    areaOptions.value = areaRes.data || []
  } catch (e) {
    console.error('获取筛选选项失败', e)
  }
}

async function getData() {
  loading.value = true
  try {
    const res = await listSafetyMonitoring(queryParams)
    const { items, total: totalCount } = res.data || {}
    const mapped = (items || []).map((item: any) => ({
      devLabel: item.devLabel,
      detectionParam: item.detectionParam,
      detectionVal: item.detectionVal,
      devValue: item.value,
      statusTxt: item.statusTxt,
      valueUpdateDT: item.valueUpdateDT,
      alarmStatus: item.alarmType === 1 ? '报警' : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      alarmThreshold: item.maxVal,
      name: item.name,
    }))
    tableData.value = mapped
    splitTableData(mapped)
    total.value = totalCount || 0
    computeTableHeight()
  } catch (e) {
    console.error('获取监测数据失败', e)
  } finally {
    loading.value = false
  }
  loadKpi()
}

function handleQuery() {
  queryParams.pageNum = 1
  getData()
}

function resetQuery() {
  queryParams.isCallThePolice = ''
  queryParams.substation = ''
  queryParams.type = ''
  queryParams.category = []
  queryParams.area = ''
  queryParams.site = ''
  queryParams.pageNum = 1
  getData()
}

function handlePagination(p: { page: number; limit: number }) {
  queryParams.pageNum = p.page
  queryParams.pageSize = p.limit
  getData()
}

function handleRowClick(row: any) {
  currentRow.value = row
  detailVisible.value = true
}

function showHistory(row: any) {
  currentRow.value = row
  detailRef.value?.showHistory()
}

function startAutoRefresh() {
  stopAutoRefresh()
  if (!autoRefresh.value) return
  refreshTimer = setInterval(() => {
    queryParams.pageNum = 1
    getData()
  }, refreshInterval.value)
}

function onIntervalChange() {
  if (autoRefresh.value) {
    startAutoRefresh()
  }
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

onMounted(() => {
  getSelectOptions()
  getData()
  startAutoRefresh()
  resizeObserver = new ResizeObserver(() => computeTableHeight())
  if (tableSectionRef.value) resizeObserver.observe(tableSectionRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  stopAutoRefresh()
})
</script>

<style scoped>
.safety-more-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 12px 16px;
  overflow: hidden;
  background: var(--bg-primary);
  gap: 10px;
}

/* 头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  padding: 0;
}

.page-header__title {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.page-subtitle {
  margin: 2px 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s ease, background-color 0.2s ease;
}

.back-btn__icon {
  transition: transform 0.2s ease;
}

.back-btn:hover,
.back-btn:focus-visible {
  color: var(--text-primary);
}

.back-btn:hover .back-btn__icon,
.back-btn:focus-visible .back-btn__icon {
  transform: translateX(-2px);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

/* 按钮统一样式 */
:deep(.btn-primary.el-button) {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  transition: all 0.2s ease;
}

:deep(.btn-primary.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  filter: brightness(1.1);
}

:deep(.btn-primary.el-button:active) {
  transform: translateY(0);
}

:deep(.btn-default.el-button) {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  padding: 7px 14px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.btn-default.el-button:hover) {
  border-color: rgba(148, 163, 184, 0.5);
  color: var(--text-primary);
  background: rgba(148, 163, 184, 0.08);
}

/* 自动刷新指示器 */
.auto-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.auto-refresh:hover {
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.2);
  color: var(--text-secondary);
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: background 0.2s ease;
}

.live-dot.active {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success-glow);
  animation: live-pulse 2s ease-in-out infinite;
}

@keyframes live-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.auto-refresh--paused {
  background: rgba(148, 163, 184, 0.04);
  border-color: rgba(148, 163, 184, 0.08);
}

.refresh-interval {
  width: 72px;
}

.refresh-interval :deep(.el-input__wrapper) {
  border-radius: 20px;
  background: rgba(148, 163, 184, 0.06);
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.12) inset;
}

.refresh-interval :deep(.el-input__inner) {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}



/* 筛选工具栏 */
.filter-section {
  flex-shrink: 0;
}

.filter-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.filter-item--wide {
  flex: 1.5;
}

.filter-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.filter-select {
  width: 100%;
}

.filter-input {
  width: 100%;
}

.filter-input :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.filter-input :deep(.el-input__prefix-inner) {
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-bottom: 1px;
}

/* 表格区域 */
.table-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.table-card:hover {
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: var(--shadow-md);
}

.table-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.table-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.table-card__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.alarm {
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger-glow);
  animation: pulse-alarm 1.5s ease-in-out infinite;
}

.status-indicator.normal {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.status-text {
  color: var(--text-muted);
}

.table-card__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.dual-table {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.dual-table .el-table {
  width: 100%;
  min-width: 0;
}

.table-card__body :deep(.el-table) {
  height: 100%;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: var(--table-header-bg);
  --el-table-row-hover-bg-color: var(--table-row-hover);
  --el-table-border-color: var(--table-border);
  --el-table-text-color: var(--text-primary);
  --el-table-header-text-color: var(--table-header-text);
}

.table-card__body :deep(.el-table__body-wrapper) {
  overflow-y: auto;
  scrollbar-width: thin;
}

.table-card__body :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 4px;
}

.table-card__body :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 2px;
}

.table-card__body :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: rgba(148, 163, 184, 0.3);
}

.table-card__body :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}

.table-card__body :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 255, 255, 0.03);
}

/* 报警行整行字体红色 */
.table-card__body :deep(.el-table__row.alarm-row td) {
  color: var(--color-danger);
}

.table-card__body :deep(.el-table__row.alarm-row .point-label),
.table-card__body :deep(.el-table__row.alarm-row .update-time) {
  color: var(--color-danger);
}

.table-card__footer {
  display: flex;
  justify-content: center;
  padding: 6px 12px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.text-mono {
  font-family: var(--font-mono);
}

.text-primary {
  color: var(--text-primary);
}

.text-danger {
  color: var(--color-danger);
}

.text-muted {
  color: var(--text-muted);
}

.point-label {
  cursor: pointer;
  transition: color 0.2s ease;
}

.point-label:hover {
  color: var(--color-primary);
}

.point-label--substation {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 4px;
}

.update-time {
  cursor: pointer;
  transition: color 0.2s ease;
}

.update-time:hover {
  color: var(--color-primary);
}

.update-time--substation {
  color: var(--color-primary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.normal {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.status-dot.alarm {
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger-glow);
}

.history-iframe {
  width: 100%;
  height: 520px;
  border: none;
  border-radius: 8px;
  background: var(--bg-secondary);
}

@media (max-width: 1200px) {
  .dual-table {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .filter-toolbar {
    flex-wrap: wrap;
  }

  .filter-item {
    flex: 0 0 calc(25% - 9px);
  }

  .filter-item--wide {
    flex: 0 0 calc(33.333% - 8px);
  }

  .filter-actions {
    flex: 0 0 auto;
    margin-left: auto;
  }
}

@media (max-width: 768px) {
  .safety-more-page {
    padding: 12px;
    overflow-y: auto;
  }

  .filter-item,
  .filter-item--wide {
    flex: 0 0 calc(50% - 6px);
  }
}

@media (max-width: 480px) {
  .filter-item,
  .filter-item--wide {
    flex: 0 0 100%;
  }
}
</style>
