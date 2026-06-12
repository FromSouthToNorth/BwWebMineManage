<template>
  <div class="page-container">
    <!-- 使用设计系统的 NavBar -->
    <NavBar title="APP 报警列表" subtitle="移动端应用报警记录" />

    <!-- 查询卡片 -->
    <div class="query-card">
      <el-form :model="queryParams" inline size="small" @keyup.enter="handleQuery">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="queryParams.severity" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="严重" value="1" />
            <el-option label="一般" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            查询
          </el-button>
          <el-button @click="resetQuery">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 报警列表 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      style="width: 100%"
      empty-text="暂无报警数据"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="alarmType" label="类型" width="100">
        <template #default="{ row }">
          <svg v-if="row.alarmType" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle; color: var(--color-danger);">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {{ row.alarmType }}
        </template>
      </el-table-column>
      <el-table-column prop="alarmContent" label="内容" min-width="240" show-overflow-tooltip />
      <el-table-column prop="alarmTime" label="时间" width="165">
        <template #default="{ row }">
          <span class="text-mono">{{ row.alarmTime }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="severity" label="严重程度" width="100" align="center">
        <template #default="{ row }">
          <!-- 使用设计系统的 StatusBadge -->
          <StatusBadge
            :status="row.severity === '1' ? 'alarm' : 'warning'"
            variant="badge"
            :label="row.severity === '1' ? '严重' : '一般'"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <Pagination
        :total="total"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @pagination="handlePagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppAlarmList' })

import { ref, reactive, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  severity: '',
})

async function handleQuery() {
  loading.value = true
  queryParams.pageNum = 1
  try {
    // TODO: 接入实际 API
    // const res = await getAppAlarmList({ ...queryParams, dateRange: dateRange.value })
    // tableData.value = res.data.items
    // total.value = res.data.total
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = getMockData()
    total.value = 36
  } catch (e) {
    console.error('获取报警列表失败', e)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  queryParams.severity = ''
  dateRange.value = null
  handleQuery()
}

function handlePagination(p: { page: number; limit: number }) {
  queryParams.pageNum = p.page
  queryParams.pageSize = p.limit
  handleQuery()
}

/** 模拟数据，接入实际 API 后删除 */
function getMockData() {
  const types = ['瓦斯超限', '断电报警', '设备故障', '通讯中断', '人员超时']
  const contents = [
    '1# 掘进工作面瓦斯浓度超限，当前值 1.2%',
    '2# 采煤机割煤时瓦斯涌出异常',
    '3# 局部通风机停电，已切换备用风机',
    '主斜井皮带输送机电机温度过高',
    '5# 工作面监控分站通讯中断',
    '中央变电所馈电开关跳闸',
    '6# 回风巷甲烷传感器故障',
    '7# 人员定位基站信号丢失',
  ]
  return Array.from({ length: 8 }, (_, i) => ({
    alarmType: types[i % types.length],
    alarmContent: contents[i % contents.length],
    alarmTime: `2026-06-${String(11 - i).padStart(2, '0')} ${String(8 + i).padStart(2, '0')}:${String(i * 3).padStart(2, '0')}:00`,
    severity: i % 3 === 0 ? '1' : '2',
  }))
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.page-container {
  padding: var(--spacing-lg);
}

.query-card {
  margin-bottom: var(--spacing-lg);
}

.text-mono {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
