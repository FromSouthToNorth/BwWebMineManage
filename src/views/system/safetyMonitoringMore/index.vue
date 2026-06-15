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

      <div class="auto-refresh" @click="toggleAutoRefresh">
        <span class="live-dot" :class="{ active: autoRefresh }" />
        <span class="live-text">{{ autoRefresh ? '自动刷新' : '已暂停' }}</span>
      </div>
    </header>

    <!-- KPI 概览 -->
    <section class="kpi-section">
      <div v-for="item in kpiItems" :key="item.label" class="kpi-card" :class="`kpi-card--${item.type || 'default'}`">
        <div class="kpi-card__icon" v-html="item.iconHtml" />
        <div class="kpi-card__info">
          <span class="kpi-card__label">{{ item.label }}</span>
          <span class="kpi-card__value" :class="`kpi-card__value--${item.type || 'default'}`">
            {{ item.value ?? '--' }}
            <span v-if="item.unit" class="kpi-card__unit">{{ item.unit }}</span>
          </span>
        </div>
        <div class="kpi-card__glow" />
      </div>
    </section>

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
          <el-table v-loading="loading" :data="tableData" stripe size="small" :height="tableHeight"
            @row-click="handleRowClick">
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="devName" label="名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="devValue" label="数值" width="100">
              <template #default="{ row }">
                <span class="text-mono" :class="row.alarmStatus === '报警' ? 'text-danger' : 'text-primary'"
                  v-html="row.devValue" />
              </template>
            </el-table-column>

            <el-table-column prop="alarmStatus" label="状态" width="90">
              <template #default="{ row }">
                <StatusBadge v-if="row.alarmStatus === '报警'" status="alarm" variant="badge" label="报警" pulse />
                <StatusBadge v-else status="normal" variant="badge" label="正常" />
              </template>
            </el-table-column>

            <el-table-column prop="category" label="类别" min-width="100" show-overflow-tooltip />
            <el-table-column prop="substation" label="分站" min-width="100" show-overflow-tooltip />
            <el-table-column prop="area" label="区域" min-width="120" show-overflow-tooltip />
            <el-table-column prop="site" label="地点" min-width="140" show-overflow-tooltip />

            <el-table-column prop="alarmThreshold" label="报警阈值" width="100">
              <template #default="{ row }">
                <span class="text-mono text-muted">{{ row.alarmThreshold || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" size="small" @click.stop="showHistory(row)">历史</el-link>
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
    <el-dialog v-model="detailVisible" width="560px" class="glass-dialog" destroy-on-close
      :close-on-click-modal="false">
      <template #header>
        <div class="dialog-header">
          <div class="dialog-header-icon"
            :style="{ color: currentRow?.alarmStatus === '报警' ? 'var(--color-danger)' : 'var(--color-success)' }">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <div class="dialog-header-title">监测点详情</div>
            <div class="dialog-header-sub">{{ currentRow?.devName || '--' }}</div>
          </div>
        </div>
      </template>

      <div v-if="currentRow">
        <div class="detail-hero" :class="currentRow.alarmStatus === '报警' ? 'is-alarm' : 'is-normal'">
          <div class="detail-hero-value" v-html="currentRow.devValue" />
          <div class="detail-hero-status">
            <span class="status-dot" :class="currentRow.alarmStatus === '报警' ? 'alarm' : 'normal'" />
            <span>{{ currentRow.alarmStatus === '报警' ? '报警中' : '运行正常' }}</span>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-label">名称</span>
            <span class="detail-val">{{ currentRow.devName || '--' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">数值</span>
            <span class="detail-val text-mono" v-html="currentRow.devValue" />
          </div>
          <div class="detail-field">
            <span class="detail-label">状态</span>
            <span class="detail-val">
              <StatusBadge v-if="currentRow.alarmStatus === '报警'" status="alarm" variant="badge" label="报警" pulse />
              <StatusBadge v-else status="normal" variant="badge" label="正常" />
            </span>
          </div>
          <div class="detail-field">
            <span class="detail-label">分站</span>
            <span class="detail-val">{{ currentRow.substation || '--' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">类别</span>
            <span class="detail-val">{{ currentRow.category || '--' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">区域</span>
            <span class="detail-val">{{ currentRow.area || '--' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">地点</span>
            <span class="detail-val">{{ currentRow.site || '--' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">报警阈值</span>
            <span class="detail-val text-mono">{{ currentRow.alarmThreshold || '--' }}</span>
          </div>
        </div>

        <div class="detail-section--action" @click="openHistoryFromDetail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>查看历史趋势</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </el-dialog>

    <!-- 历史趋势 -->
    <el-dialog v-model="historyVisible" width="860px" class="glass-dialog" destroy-on-close
      :close-on-click-modal="false">
      <template #header>
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div class="dialog-header-title">历史趋势</div>
            <div class="dialog-header-sub">{{ currentRow?.devName || '--' }}</div>
          </div>
        </div>
      </template>

      <iframe v-if="historySrc" :src="historySrc" class="history-iframe" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringMore' })

import { ref, reactive, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import StatusBadge from '@/components/StatusBadge/index.vue'
import type { KpiItem } from '@/components/KpiBar/index.vue'
import {
  listSafetyMonitoring,
  substationSelect,
  typeSelect,
  categorySelect,
  areaSelect,
} from '@/api/system/safetyMonitoring'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentRow = ref<any>(null)
const kpiItems = ref<KpiItem[]>([])

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
const historyVisible = ref(false)
const historySrc = ref('')

const pageRef = ref<HTMLDivElement>()
const tableSectionRef = ref<HTMLDivElement>()
const tableHeight = ref(400)
let resizeObserver: ResizeObserver | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
const autoRefresh = ref(true)

const router = useRouter()

const tableCardStatus = computed(() => tableData.value.some(r => r.alarmStatus === '报警') ? 'alarm' : 'normal')

function goBack() {
  router.back()
}

function updateKpiItems(rows: any[], totalCount: number) {
  const alarmCount = rows.filter(r => r.alarmStatus === '报警').length
  const normalCount = rows.length - alarmCount
  kpiItems.value = [
    { label: '监测总数', value: totalCount, type: 'total', iconHtml: monitorIcon },
    { label: '报警点数', value: alarmCount, type: 'alarm', iconHtml: bellIcon },
    { label: '运行正常', value: normalCount, type: 'success', iconHtml: checkIcon },
    { label: '数据覆盖率', value: 100, type: 'info', unit: '%', iconHtml: coverageIcon },
  ]
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
      devName: item.devAddress,
      devValue: item.value,
      devStatus: item.statusTxt,
      alarmStatus: item.alarmType === 1 ? '报警' : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      alarmThreshold: item.maxVal,
      name: item.name,
    }))
    tableData.value = mapped
    total.value = totalCount || 0
    updateKpiItems(mapped, total.value)
    computeTableHeight()
  } catch (e) {
    console.error('获取监测数据失败', e)
  } finally {
    loading.value = false
  }
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
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(row.name || row.devName || '')}&themes=blue_black`
  historyVisible.value = true
}

function openHistoryFromDetail() {
  if (!currentRow.value) return
  showHistory(currentRow.value)
}

function startAutoRefresh() {
  stopAutoRefresh()
  refreshTimer = setInterval(() => {
    queryParams.pageNum = 1
    getData()
  }, 30000)
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

const monitorIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
const bellIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
const checkIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>'
const coverageIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
</script>

<style scoped>
.safety-more-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 16px 20px;
  overflow: hidden;
  background: var(--bg-primary);
  gap: 12px;
}

/* 头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  padding: 4px 0;
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

/* KPI 卡片 */
.kpi-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  flex-shrink: 0;
}

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: var(--shadow-md);
}

.kpi-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.kpi-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 1;
  min-width: 0;
}

.kpi-card__label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.kpi-card__value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.kpi-card__unit {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 2px;
  font-weight: 500;
}

.kpi-card__glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  filter: blur(24px);
  opacity: 0.15;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.kpi-card:hover .kpi-card__glow {
  opacity: 0.25;
}

.kpi-card--total .kpi-card__icon { background: rgba(59, 130, 246, 0.12); color: var(--color-primary); }
.kpi-card--total .kpi-card__glow { background: var(--color-primary); }
.kpi-card--total .kpi-card__value { color: var(--color-primary); }

.kpi-card--alarm .kpi-card__icon { background: rgba(239, 68, 68, 0.12); color: var(--color-danger); }
.kpi-card--alarm .kpi-card__glow { background: var(--color-danger); }
.kpi-card--alarm .kpi-card__value { color: var(--color-danger); text-shadow: 0 0 16px var(--color-danger-glow); }

.kpi-card--success .kpi-card__icon { background: rgba(34, 197, 94, 0.12); color: var(--color-success); }
.kpi-card--success .kpi-card__glow { background: var(--color-success); }
.kpi-card--success .kpi-card__value { color: var(--color-success); }

.kpi-card--info .kpi-card__icon { background: rgba(100, 116, 139, 0.12); color: var(--color-info); }
.kpi-card--info .kpi-card__glow { background: var(--color-info); }
.kpi-card--info .kpi-card__value { color: var(--text-primary); }

/* 筛选工具栏 */
.filter-section {
  flex-shrink: 0;
}

.filter-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
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
  padding: 12px 16px;
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
  min-height: 0;
  overflow: hidden;
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

.table-card__footer {
  display: flex;
  justify-content: center;
  padding: 10px 16px;
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

.detail-section--action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 10px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-section--action:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.detail-section--action > span {
  flex: 1;
}

.history-iframe {
  width: 100%;
  height: 520px;
  border: none;
  border-radius: 8px;
  background: var(--bg-secondary);
}

@media (max-width: 1400px) {
  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
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

  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-item,
  .filter-item--wide {
    flex: 0 0 calc(50% - 6px);
  }
}

@media (max-width: 480px) {
  .kpi-section {
    grid-template-columns: 1fr;
  }

  .filter-item,
  .filter-item--wide {
    flex: 0 0 100%;
  }
}
</style>
