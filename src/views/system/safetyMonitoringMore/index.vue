<template>
  <div class="safety-more-page page-container">
    <!-- 页面头部 -->
    <div class="page-header flex-between">
      <div class="page-header__left">
        <el-button text size="small" class="back-btn" aria-label="返回上一页" @click="goBack">
          <svg class="back-btn__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回
        </el-button>
        <NavBar title="安全监测详情" subtitle="实时监测数据列表" gradient />
      </div>
    </div>

    <!-- KPI 概览 -->
    <KpiBar :items="kpiItems" />

    <!-- 筛选条件 -->
    <GlassCard title="筛选条件" :title-icon="filterIcon" hoverable class="filter-card">
      <el-form :model="queryParams" size="small" class="query-form">
        <div class="query-form__grid">
          <el-form-item label="报警状态">
            <el-select v-model="queryParams.isCallThePolice" placeholder="全部" clearable @change="handleQuery">
              <el-option label="全部" value="" />
              <el-option label="报警" value="1" />
              <el-option label="正常" value="0" />
            </el-select>
          </el-form-item>

          <el-form-item label="分站">
            <el-select v-model="queryParams.substation" placeholder="全部" clearable @change="handleQuery">
              <el-option v-for="item in substationOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
            </el-select>
          </el-form-item>

          <el-form-item label="类型">
            <el-select v-model="queryParams.type" placeholder="全部" clearable @change="handleQuery">
              <el-option v-for="item in typeOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
            </el-select>
          </el-form-item>

          <el-form-item label="类别">
            <el-select v-model="queryParams.category" placeholder="全部" clearable multiple collapse-tags
              @change="handleQuery">
              <el-option v-for="item in categoryOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
            </el-select>
          </el-form-item>

          <el-form-item label="区域">
            <el-select v-model="queryParams.area" placeholder="全部" clearable @change="handleQuery">
              <el-option v-for="item in areaOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
            </el-select>
          </el-form-item>

          <el-form-item label="地点">
            <el-select v-model="queryParams.site" placeholder="全部" clearable @change="handleQuery">
              <el-option v-for="item in siteOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
            </el-select>
          </el-form-item>

          <el-form-item class="query-form__actions">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </GlassCard>

    <!-- 数据列表 -->
    <GlassCard title="监测点列表" :title-icon="tableIcon" :status="tableCardStatus" status-bar padding="none"
      hoverable class="table-card">
      <template #extra>
        <span class="table-extra">共 {{ total }} 条记录</span>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe size="small" max-height="520" @row-click="handleRowClick">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="devName" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="devValue" label="数值" width="100">
          <template #default="{ row }">
            <span class="text-mono" :class="row.alarmStatus === '报警' ? 'text-danger' : 'text-primary'" v-html="row.devValue" />
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

      <template v-if="total > 0" #footer>
        <div class="pagination-wrapper">
          <pagination :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
            @pagination="handlePagination" />
        </div>
      </template>
    </GlassCard>

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

import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import KpiBar from '@/components/KpiBar/index.vue'
import GlassCard from '@/components/GlassCard/index.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import type { KpiItem } from '@/components/KpiBar/index.vue'
import {
  listSafetyMonitoring,
  substationSelect,
  typeSelect,
  categorySelect,
  areaSelect,
  siteSelect,
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

const router = useRouter()

const tableCardStatus = computed(() => tableData.value.some(r => r.alarmStatus === '报警') ? 'alarm' : 'normal')

const filterIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>'
const tableIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'

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

onMounted(() => {
  getSelectOptions()
  getData()
})

const monitorIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
const bellIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
const checkIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>'
const coverageIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
</script>

<style scoped>
.page-header {
  margin-bottom: var(--spacing-md);
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
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

.filter-card {
  margin: var(--spacing-md) 0;
}

.query-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.query-form :deep(.el-form-item__label) {
  font-size: 12px;
  color: var(--text-muted);
}

.query-form__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 20px;
  align-items: flex-end;
}

.query-form__actions {
  grid-column: span 1;
  display: flex;
  justify-content: flex-end;
}

.table-card {
  margin-top: var(--spacing-md);
}

.table-extra {
  font-size: 12px;
  color: var(--text-muted);
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

@media (max-width: 1280px) {
  .query-form__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .query-form__actions {
    grid-column: span 3;
  }
}

@media (max-width: 1024px) {
  .query-form__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .query-form__actions {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .query-form__grid {
    grid-template-columns: 1fr;
  }

  .query-form__actions {
    grid-column: span 1;
  }
}
</style>
