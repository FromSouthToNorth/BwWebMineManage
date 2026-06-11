<template>
  <div class="safety-more-page page-container">
    <h2 class="page-title">安全监测详情</h2>

    <el-card shadow="hover" class="query-card">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="报警状态">
          <el-select v-model="queryParams.isCallThePolice" placeholder="全部" style="width: 100px" clearable
            @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="报警" value="1" />
            <el-option label="正常" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="分站">
          <el-select v-model="queryParams.substation" placeholder="全部" style="width: 140px" clearable
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
          <el-select v-model="queryParams.category" placeholder="全部" style="width: 140px" clearable multiple
            collapse-tags @change="handleQuery">
            <el-option v-for="item in categoryOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="queryParams.area" placeholder="全部" style="width: 120px" clearable @change="handleQuery">
            <el-option v-for="item in areaOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点">
          <el-select v-model="queryParams.site" placeholder="全部" style="width: 140px" clearable @change="handleQuery">
            <el-option v-for="item in siteOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>左区列表</span></template>
          <el-table v-loading="loading" :data="leftList" stripe size="small" max-height="500"
            @row-click="handleRowClick">
            <el-table-column type="index" label="#" width="40" />
            <el-table-column prop="devName" label="名称" min-width="100" show-overflow-tooltip />
            <el-table-column prop="devValue" label="数值" width="80" />
            <el-table-column prop="alarmStatus" label="报警" width="60">
              <template #default="{ row }">
                <el-tag v-if="row.alarmStatus === '报警'" type="danger" size="small" effect="dark">报警</el-tag>
                <span v-else class="no-alarm">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" size="small" @click.stop="showHistory(row)">历史</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>右区列表</span></template>
          <el-table v-loading="loading" :data="rightList" stripe size="small" max-height="500"
            @row-click="handleRowClick">
            <el-table-column type="index" label="#" width="40" />
            <el-table-column prop="devName" label="名称" min-width="100" show-overflow-tooltip />
            <el-table-column prop="devValue" label="数值" width="80" />
            <el-table-column prop="alarmStatus" label="报警" width="60">
              <template #default="{ row }">
                <el-tag v-if="row.alarmStatus === '报警'" type="danger" size="small" effect="dark">报警</el-tag>
                <span v-else class="no-alarm">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" size="small" @click.stop="showHistory(row)">历史</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-wrapper">
      <pagination v-if="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
        @pagination="handlePagination" />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="监测点详情" width="500px">
      <el-form v-if="currentRow" label-width="80px" size="small">
        <el-form-item label="名称">{{ currentRow.devName }}</el-form-item>
        <el-form-item label="数值">{{ currentRow.devValue }}</el-form-item>
        <el-form-item label="状态">
          <el-tag :type="currentRow.devStatus === '正常' ? 'success' : 'danger'" size="small">{{ currentRow.devStatus
            }}</el-tag>
        </el-form-item>
        <el-form-item label="分站">{{ currentRow.substation }}</el-form-item>
        <el-form-item label="类别">{{ currentRow.category }}</el-form-item>
        <el-form-item label="区域">{{ currentRow.area }}</el-form-item>
        <el-form-item label="地点">{{ currentRow.site }}</el-form-item>
        <el-form-item label="报警阈值">{{ currentRow.alarmThreshold || '-' }}</el-form-item>
      </el-form>
    </el-dialog>

    <!-- 历史趋势 -->
    <el-dialog v-model="historyVisible" title="历史趋势" width="800px">
      <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 500px; border: none" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringMore' })

import { ref, reactive, onMounted } from 'vue'
import {
  listSafetyMonitoring,
  substationSelect,
  typeSelect,
  categorySelect,
  areaSelect,
  siteSelect,
} from '@/api/system/safetyMonitoring'

const loading = ref(false)
const leftList = ref<any[]>([])
const rightList = ref<any[]>([])
const total = ref(0)
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
    }))
    const mid = Math.ceil(mapped.length / 2)
    leftList.value = mapped.slice(0, mid)
    rightList.value = mapped.slice(mid)
    total.value = totalCount || 0
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
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(row.devName || '')}`
  historyVisible.value = true
}

onMounted(() => {
  getSelectOptions()
  getData()
})
</script>

<style scoped>
.page-title {
  margin-bottom: 16px;
}

.query-card {
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.no-alarm {
  color: var(--text-muted);
}
</style>
