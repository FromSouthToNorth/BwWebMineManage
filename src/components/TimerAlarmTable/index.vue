<template>
  <el-card shadow="hover" class="alarm-card">
    <template #header>
      <div class="card-header">
        <span>实时报警</span>
        <div class="header-controls">
          <el-tag v-if="loading" type="info" size="small">刷新中...</el-tag>
          <el-button text size="small" @click="handleMore">更多</el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="alarmData" stripe max-height="300" style="width: 100%" size="small">
      <el-table-column prop="alarmType" label="类型" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.alarmType === '报警'" type="danger" size="small" effect="dark">报警</el-tag>
          <span v-else>{{ row.alarmType }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="alarmContent" label="内容" min-width="120" show-overflow-tooltip />
      <el-table-column prop="devName" label="设备" width="100" />
      <el-table-column prop="alarmTime" label="时间" width="150" />
    </el-table>

    <div v-if="alarmData.length === 0 && !loading" class="empty-tip">
      暂无报警数据
    </div>

    <!-- 更多报警弹窗 -->
    <el-dialog v-model="moreVisible" title="报警列表" width="800px" top="5vh">
      <el-form :model="historyQuery" inline size="small" class="history-filter">
        <el-form-item label="地点">
          <el-input v-model="historyQuery.address" placeholder="输入地点" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="historyQuery.typeName" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="item in historyTypeOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="historyDateRange" type="datetimerange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss" style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="searchHistory">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="historyLoading" :data="historyData" stripe size="small" style="width: 100%">
        <el-table-column prop="alarmType" label="类型" width="80" />
        <el-table-column prop="alarmContent" label="内容" min-width="140" show-overflow-tooltip />
        <el-table-column prop="devName" label="设备" width="100" />
        <el-table-column prop="alarmTime" label="时间" width="150" />
        <el-table-column prop="severity" label="级别" width="70">
          <template #default="{ row }">
            <el-tag :type="row.severity === '1' ? 'danger' : 'warning'" size="small">
              {{ row.severity === '1' ? '严重' : '一般' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="historyTotal > 0" :total="historyTotal" :page="historyQuery.pageNum"
        :limit="historyQuery.pageSize" @pagination="handleHistoryPagination" />
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
defineOptions({ name: 'TimerAlarmTable' })

import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { listEalTimeAlarm, listHistoricalAlarm } from '@/api/system/ealTimeAlarm'

const alarmData = ref<any[]>([])
const loading = ref(false)

// 更多弹窗
const moreVisible = ref(false)
const historyData = ref<any[]>([])
const historyLoading = ref(false)
const historyTotal = ref(0)
const historyDateRange = ref<[string, string] | null>(null)
const historyTypeOptions = ref<any[]>([])
const historyQuery = reactive({
  pageNum: 1,
  pageSize: 20,
  address: '',
  typeName: '',
})

let timer: ReturnType<typeof setInterval> | null = null

async function getData() {
  loading.value = true
  try {
    const res = await listEalTimeAlarm()
    const { items } = res.data || {}
    alarmData.value = (items || []).map((item: any) => ({
      alarmType: item.alarmType,
      alarmContent: item.devAddress,
      devName: item.devLabel,
      alarmTime: item.alarmBeginDT || item.valueUpdateDT,
    }))
  } catch (e) {
    console.error('获取实时报警失败', e)
  } finally {
    loading.value = false
  }
}

function handleMore() {
  moreVisible.value = true
  searchHistory()
}

async function searchHistory() {
  historyLoading.value = true
  try {
    const res = await listHistoricalAlarm({
      pageNum: historyQuery.pageNum,
      pageSize: historyQuery.pageSize,
      address: historyQuery.address,
      typeName: historyQuery.typeName,
      category: '',
      startTime: historyDateRange.value?.[0] || '',
      endTime: historyDateRange.value?.[1] || '',
    })
    const { items, total: totalCount } = res.data || {}
    historyData.value = (items || []).map((item: any) => ({
      alarmType: item.alarmType,
      alarmContent: item.devAddress,
      devName: item.devLabel,
      alarmTime: item.alarmBeginDT || item.valueUpdateDT,
      severity: item.severity,
    }))
    historyTotal.value = totalCount || 0
  } catch (e) {
    console.error('获取历史报警失败', e)
  } finally {
    historyLoading.value = false
  }
}

function handleHistoryPagination(p: { page: number; limit: number }) {
  historyQuery.pageNum = p.page
  historyQuery.pageSize = p.limit
  searchHistory()
}

onMounted(() => {
  getData()
  timer = setInterval(getData, 10000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.alarm-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.history-filter {
  margin-bottom: 8px;
}
</style>
