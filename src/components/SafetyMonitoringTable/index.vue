<template>
  <el-card shadow="hover" class="safety-table-card">
    <template #header>
      <div class="card-header">
        <span>安全监控</span>
        <div class="header-controls">
          <el-tag v-if="loading" type="info" size="small">刷新中...</el-tag>
          <el-button text size="small" :icon="autoRefresh ? 'VideoPause' : 'VideoPlay'" @click="toggleAutoRefresh">
            {{ autoRefresh ? '暂停' : '自动刷新' }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 查询区 -->
    <el-form :model="queryParams" inline size="small" class="filter-form">
      <el-form-item label="报警状态">
        <el-select v-model="queryParams.isCallThePolice" placeholder="全部" style="width: 100px" @change="handleQuery">
          <el-option label="全部" value="" />
          <el-option label="报警" value="1" />
          <el-option label="正常" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="分站">
        <el-select v-model="queryParams.substation" placeholder="全部" style="width: 120px" clearable
          @change="handleQuery">
          <el-option v-for="item in substationOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="queryParams.type" placeholder="全部" style="width: 120px" clearable @change="handleQuery">
          <el-option v-for="item in typeOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
        </el-select>
      </el-form-item>
      <el-form-item label="类别">
        <el-select v-model="queryParams.category" placeholder="全部" style="width: 120px" clearable multiple collapse-tags
          @change="handleQuery">
          <el-option v-for="item in categoryOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
        </el-select>
      </el-form-item>
      <el-form-item label="区域">
        <el-select v-model="queryParams.area" placeholder="全部" style="width: 120px" clearable @change="handleQuery">
          <el-option v-for="item in areaOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
        </el-select>
      </el-form-item>
      <el-form-item label="地点">
        <el-select v-model="queryParams.site" placeholder="全部" style="width: 120px" clearable @change="handleQuery">
          <el-option v-for="item in siteOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 统计信息 -->
    <SafetyMonitoringStatistics v-if="statisticsHtml" :html="statisticsHtml" :is-show-total="true" :total="total" />

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="tableData" stripe :max-height="maxHeight" style="width: 100%"
      @row-click="handleRowClick">
      <el-table-column type="index" label="#" width="50" fixed />
      <el-table-column prop="devName" label="名称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="devValue" label="数值" width="100">
        <template #default="{ row }">
          <span :class="{ 'alarm-value': row.alarmStatus === '报警' }">{{ row.devValue }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="devStatus" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.devStatus === '正常' ? 'success' : 'danger'" size="small">
            {{ row.devStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="alarmStatus" label="报警" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.alarmStatus === '报警'" type="danger" size="small" effect="dark">报警</el-tag>
          <span v-else class="no-alarm">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="substation" label="分站" min-width="100" />
      <el-table-column prop="category" label="类别" min-width="80" />
      <el-table-column prop="area" label="区域" min-width="80" />
      <el-table-column prop="site" label="地点" min-width="100" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-link type="primary" size="small" @click.stop="showDetail(row)">详情</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" size="small" @click.stop="showHistory(row)">历史</el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-if="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
      @pagination="handlePagination" />

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="监测点详情" width="600px">
      <el-form v-if="currentRow" label-width="100px" size="small">
        <el-form-item label="名称">{{ currentRow.devName }}</el-form-item>
        <el-form-item label="数值">{{ currentRow.devValue }}</el-form-item>
        <el-form-item label="状态">
          <el-tag :type="currentRow.devStatus === '正常' ? 'success' : 'danger'" size="small">
            {{ currentRow.devStatus }}
          </el-tag>
        </el-form-item>
        <el-form-item label="分站">{{ currentRow.substation }}</el-form-item>
        <el-form-item label="类别">{{ currentRow.category }}</el-form-item>
        <el-form-item label="区域">{{ currentRow.area }}</el-form-item>
        <el-form-item label="地点">{{ currentRow.site }}</el-form-item>
        <el-form-item label="报警阈值">{{ currentRow.alarmThreshold || '-' }}</el-form-item>
      </el-form>
    </el-dialog>

    <!-- 历史趋势弹窗 -->
    <el-dialog v-model="historyVisible" title="历史趋势" width="800px">
      <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 500px; border: none" />
    </el-dialog>
  </el-card>
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

defineProps<{
  maxHeight?: number
}>()

// 表格数据
const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const statisticsHtml = ref('')
const currentRow = ref<any>(null)

// 筛选选项
const substationOptions = ref<any[]>([])
const typeOptions = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const areaOptions = ref<any[]>([])
const siteOptions = ref<any[]>([])

// 查询参数
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

// 弹窗
const detailVisible = ref(false)
const historyVisible = ref(false)
const historySrc = ref('')

// 自动刷新
const autoRefresh = ref(true)
let refreshTimer: ReturnType<typeof setInterval> | null = null

/** 获取列表数据 */
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
      devValue: item.value,
      devStatus: item.statusTxt,
      alarmStatus: item.alarmType === 1 ? '报警' : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      alarmThreshold: item.maxVal,
      devLabel: item.devLabel,
    }))
    total.value = totalCount || 0
    statisticsHtml.value = statistics || ''
  } catch (e) {
    console.error('获取安全监测数据失败', e)
  } finally {
    loading.value = false
  }
}

/** 获取筛选项 */
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

/** 查询 */
function handleQuery() {
  queryParams.pageNum = 1
  getData()
}

/** 翻页 */
function handlePagination(p: { page: number; limit: number }) {
  queryParams.pageNum = p.page
  queryParams.pageSize = p.limit
  getData()
}

/** 切换自动刷新 */
function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshTimer = setInterval(getData, 10000)
  } else if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/** 行点击 */
function handleRowClick(row: any) {
  currentRow.value = row
}

/** 详情弹窗 */
function showDetail(row: any) {
  currentRow.value = row
  detailVisible.value = true
}

/** 历史趋势 */
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
.safety-table-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-form {
  margin-bottom: 8px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-alarm {
  color: var(--text-muted);
}

.alarm-value {
  color: var(--color-danger);
  font-weight: bold;
}

:deep(.el-form-item) {
  margin-bottom: 4px;
}
</style>
