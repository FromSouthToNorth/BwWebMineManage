<template>
  <div class="safety-monitor">
    <!-- 头部 -->
    <div class="monitor-header">
      <div class="monitor-title">
        <span class="live-indicator" :class="{ active: autoRefresh }"></span>
        <span style="font-weight: 600; font-size: 15px;">安全监控</span>
      </div>
      <div class="monitor-actions">
        <span class="monitor-count">{{ total }} 个监测点</span>
        <el-tag v-if="loading" type="info" size="small" effect="dark">刷新中...</el-tag>
        <el-button text size="small" @click="toggleAutoRefresh" style="font-weight: 500;">
          {{ autoRefresh ? '⏸ 暂停' : '▶ 自动刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 分类筛选指示 -->
    <div v-if="activeCategory" class="category-filter-bar">
      <span class="category-filter-label">分类筛选：</span>
      <span class="category-filter-tag">{{ activeCategory }}</span>
      <el-button text size="small" @click="clearCategoryFilter"
        style="color: var(--text-muted); font-size: 12px; margin-left: 4px;">✕ 清除</el-button>
    </div>

    <!-- 监测点卡片网格 -->
    <div v-if="loading && tableData.length === 0" class="monitor-loading-wrap">
      <div class="loading-pulse"></div>
      <span style="color: var(--text-muted); font-size: 13px;">加载监测数据...</span>
    </div>
    <div v-else class="monitor-grid">
      <div v-for="(item, idx) in tableData" :key="idx" class="monitor-card"
        :class="{ 'is-alarm': item.alarmStatus === '报警', 'is-normal': item.alarmStatus !== '报警' }"
        @click="showDetail(item)">
        <div class="card-top">
          <span class="card-name text-ellipsis" :title="item.devName">{{ item.devName }}</span>
          <span v-if="item.alarmStatus === '报警'" class="alarm-badge pulse">报警</span>
        </div>
        <div class="card-value" :class="item.alarmStatus === '报警' ? 'text-danger' : 'text-success'">
          <span v-html="item.devValue"></span>
        </div>
        <div class="card-tags">
          <span class="card-tag" v-if="item.category">{{ item.category }}</span>
          <span class="card-tag" :class="item.devLabel.indexOf('F') !== -1 ? 'label-f' : 'label-normal'">{{
            item.devLabel }}</span>
        </div>
        <div class="card-overlay">
          <div class="card-overlay-btns">
            <el-button text size="small" @click.stop="showDetail(item)" class="overlay-btn">详情</el-button>
            <span class="overlay-divider">|</span>
            <el-button text size="small" @click.stop="showHistory(item)" class="overlay-btn">历史</el-button>
          </div>
        </div>
      </div>

      <div v-if="!loading && tableData.length === 0" class="monitor-empty">
        暂无数据
      </div>
    </div>
    <!-- 加载空占位 -->
    <div v-if="loading && tableData.length === 0" style="height: 200px;"></div>

    <!-- 分页 -->
    <div v-if="total > 0" class="monitor-pagination">
      <pagination :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
        @pagination="handlePagination" />
    </div>

  </div>

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" width="560px" top="8vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">监测点详情</div>
          <div class="dialog-header-sub">{{ currentRow?.devName || '' }}</div>
        </div>
      </div>
    </template>
    <div v-if="currentRow" class="detail-body">
      <!-- 主数值区 -->
      <div class="detail-hero" :class="currentRow.alarmStatus === '报警' ? 'is-alarm' : 'is-normal'">
        <div class="detail-hero-value" v-html="currentRow.devValue"></div>
        <div class="detail-hero-status">
          <span class="status-dot" :class="currentRow.alarmStatus === '报警' ? 'alarm' : 'normal'"></span>
          {{ currentRow.alarmStatus === '报警' ? '报警中' : '正常' }}
        </div>
      </div>

      <!-- 信息网格 -->
      <div class="detail-grid">
        <div class="detail-field">
          <span class="detail-label">分站</span>
          <span class="detail-val">{{ currentRow.substation }}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">类别</span>
          <span class="detail-val">{{ currentRow.category }}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">区域</span>
          <span class="detail-val">{{ currentRow.area }}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">地点</span>
          <span class="detail-val">{{ currentRow.site }}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">报警阈值</span>
          <span class="detail-val">{{ currentRow.alarmThreshold || '-' }}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">设备标识</span>
          <span class="detail-val" style="font-family: var(--font-mono); font-size: 12px;">{{ currentRow.devLabel || '-'
          }}</span>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 历史趋势弹窗 -->
  <el-dialog v-model="historyVisible" width="820px" top="5vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon" style="color: var(--color-primary);">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">历史趋势</div>
          <div class="dialog-header-sub">{{ currentRow?.devName || '' }}</div>
        </div>
      </div>
    </template>
    <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 520px; border: none; border-radius: 8px;" />
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringTable' })

import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import {
  listSafetyMonitoring,
  substationSelect,
  typeSelect,
  categorySelect,
  areaSelect,
  siteSelect,
} from '@/api/system/safetyMonitoring'

const emit = defineEmits<{
  'update:total': [value: number]
}>()

const props = withDefaults(defineProps<{
  maxHeight?: number
  filterCategory?: string
}>(), {
  maxHeight: undefined,
  filterCategory: '',
})

const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const statisticsHtml = ref('')
const currentRow = ref<any>(null)

const substationOptions = ref<any[]>([])
const typeOptions = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const areaOptions = ref<any[]>([])
const siteOptions = ref<any[]>([])

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
const activeCategory = ref('')
const autoRefresh = ref(true)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// 监听统计图分类点击
watch(() => props.filterCategory, (val) => {
  if (val && val !== activeCategory.value) {
    activeCategory.value = val
    queryParams.category = [val]
    queryParams.pageNum = 1
    getData()
  }
})

function clearCategoryFilter() {
  activeCategory.value = ''
  queryParams.category = []
  queryParams.pageNum = 1
  getData()
}

async function getData() {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      isCallThePolice: queryParams.isCallThePolice,
      substation: queryParams.substation,
      type: queryParams.type,
      category: queryParams.category,
      area: queryParams.area,
      site: queryParams.site,
    }
    const res = await listSafetyMonitoring(params)
    const { items, total: totalCount, statistics } = res.data || {}
    tableData.value = (items || []).map((item: any) => ({
      devName: item.devAddress,
      devValue: item.detectionVal,
      devStatus: item.statusTxt,
      alarmStatus: item.alarmType === 1 ? '报警' : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      alarmThreshold: item.maxVal,
      devLabel: item.devLabel,
      valueUpdateDT: item.valueUpdateDT,
    }))
    total.value = totalCount || 0
    statisticsHtml.value = statistics || ''
    emit('update:total', total.value)
  } catch (e) {
    console.error('获取安全监测数据失败', e)
  } finally {
    loading.value = false
  }
}

async function getSelectOptions() {
  try {
    const [subRes, typeRes, catRes, areaRes, siteRes] = await Promise.all([
      substationSelect(),
      typeSelect(),
      categorySelect(),
      areaSelect(),
      siteSelect(),
    ])
    substationOptions.value = subRes.data || []
    typeOptions.value = typeRes.data || []
    categoryOptions.value = catRes.data || []
    areaOptions.value = areaRes.data || []
    siteOptions.value = siteRes.data || []
  } catch (e) {
    console.error('获取筛选选项失败', e)
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

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshTimer = setInterval(getData, 10000)
  } else if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function showDetail(row: any) {
  currentRow.value = row
  detailVisible.value = true
}

function showHistory(row: any) {
  currentRow.value = row
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(row.devName || '')}`
  historyVisible.value = true
}

onMounted(() => {
  getSelectOptions()
  getData()
  refreshTimer = setInterval(getData, 10000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.safety-monitor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(20, 29, 47, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* 头部 */
.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.3s;
}

.live-indicator.active {
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

.monitor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.monitor-count {
  font-size: 12px;
  color: var(--text-muted);
}

/* 筛选区 */
.monitor-filters {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color-light);
  background: rgba(255, 255, 255, 0.015);
}

.monitor-filters :deep(.el-form-item) {
  margin-bottom: 0;
}

.monitor-filters :deep(.el-form-item__label) {
  font-size: 12px;
  color: var(--text-muted);
}

/* 卡片网格 — 可滚动 */
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  align-content: flex-start;
}

/* 单个监测卡片 — 毛玻璃 */
.monitor-card {
  background: rgba(20, 29, 47, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 左侧装饰条 */
.monitor-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 3px 3px 0;
  transition: all var(--transition-base);
}

/* 正常状态 */
.monitor-card.is-normal::before {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.monitor-card.is-normal:hover {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 12px rgba(34, 197, 94, 0.05);
  transform: translateY(-2px);
}

/* 报警状态 */
.monitor-card.is-alarm {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.04);
}

.monitor-card.is-alarm::before {
  background: var(--color-danger);
  box-shadow: 0 0 12px var(--color-danger-glow);
}

.monitor-card.is-alarm:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.1);
  transform: translateY(-2px);
}

/* 卡片顶部 */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  padding: 0 8px;
  border-radius: 4px;
  line-height: 22px;
  display: inline-block;
}



.card-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

/* 报警徽标 */
.alarm-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alarm-badge.pulse {
  animation: alarm-badge-pulse 1.5s ease-in-out infinite;
}

@keyframes alarm-badge-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
  }

  50% {
    box-shadow: 0 0 8px 2px rgba(239, 68, 68, 0.1);
  }
}

/* 数值 */
.card-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
  margin: 6px 0;
}

.card-value.text-success {
  color: var(--color-success);
}

.card-value.text-danger {
  color: var(--color-danger);
  text-shadow: 0 0 20px var(--color-danger-glow);
}

/* 标签行 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-tag {
  font-size: 13px;
  color: var(--text-muted);
  background: rgba(148, 163, 184, 0.1);
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.card-tag.label-f {
  background: var(--color-primary, #3b82f6);
  color: #fff;
}

.card-tag.label-normal {
  color: var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.1);
}

/* 悬浮毛玻璃浮层 — 从下到上渐变显示 */
.card-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: linear-gradient(to top, rgba(20, 29, 47, 0.85) 0%, rgba(20, 29, 47, 0.4) 60%, transparent 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  overflow: hidden;
  transition: height 0.25s ease;
}

.monitor-card:hover .card-overlay {
  height: 48px;
}

.card-overlay-btns {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease 0.08s;
}

.overlay-btn {
  color: #fff !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  background: transparent !important;
  border: none !important;
}

.overlay-btn:hover {
  color: var(--color-primary-light) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.overlay-divider {
  color: rgba(255, 255, 255, 0.15);
  font-size: 12px;
}

.monitor-card:hover .card-overlay-btns {
  opacity: 1;
  transform: translateY(0);
}

/* 分类筛选指示条 */
.category-filter-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.06);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  font-size: 13px;
}

.category-filter-label {
  color: var(--text-muted);
}

.category-filter-tag {
  color: var(--color-primary);
  font-weight: 500;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 10px;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

/* 加载中 */
.monitor-loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 0;
  min-height: 200px;
  background: rgba(20, 29, 47, 0.3);
  border-radius: var(--radius-md);
  margin: 16px;
}

.loading-pulse {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.15);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.monitor-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--text-muted);
  font-size: 14px;
}

/* 分页 */
.monitor-pagination {
  display: flex;
  justify-content: center;
  padding: 8px 16px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

/* ── 详情弹窗 ── */
.glass-dialog :deep(.el-dialog) {
  border-radius: 12px;
  background: var(--bg-card, #1e293b);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.glass-dialog :deep(.el-dialog__header) {
  padding: 16px 20px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  margin: 0;
}

.glass-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 14px;
}

.dialog-header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog-header-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 主数值区 */
.detail-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 10px;
  background: rgba(20, 29, 47, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.detail-hero.is-alarm {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}

.detail-hero.is-normal {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.04);
}

.detail-hero-value {
  font-family: var(--font-mono, monospace);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.5px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-hero.is-alarm .detail-hero-value {
  color: var(--color-danger, #ef4444);
  text-shadow: 0 0 24px rgba(239, 68, 68, 0.25);
}

.detail-hero.is-normal .detail-hero-value {
  color: var(--color-success, #22c55e);
}

/* 覆盖 v-html 内联标签（font/span/b 等） */
.detail-hero-value :deep(*) {
  font-family: var(--font-mono, monospace) !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: inherit !important;
  line-height: 1.4 !important;
}

.detail-hero-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.alarm {
  background: var(--color-danger, #ef4444);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: live-pulse 2s ease-in-out infinite;
}

.status-dot.normal {
  background: var(--color-success, #22c55e);
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.3);
}

/* 信息网格 */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: rgba(20, 29, 47, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.06);
}

.detail-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.detail-val {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}
</style>
