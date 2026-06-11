<template>
  <div class="app-alarm-page page-container">
    <h2 class="page-title">APP 报警列表</h2>

    <el-card shadow="hover" class="query-card">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="queryParams.severity" placeholder="全部">
            <el-option label="全部" value="" />
            <el-option label="严重" value="1" />
            <el-option label="一般" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
      <el-table-column prop="alarmType" label="类型" width="100" />
      <el-table-column prop="alarmContent" label="内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="alarmTime" label="时间" width="160" />
      <el-table-column prop="severity" label="严重程度" width="100">
        <template #default="{ row }">
          <el-tag :type="row.severity === '1' ? 'danger' : 'warning'" size="small">
            {{ row.severity === '1' ? '严重' : '一般' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppAlarmList' })

import { ref, reactive } from 'vue'

const loading = ref(false)
const tableData = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  severity: '',
})

function handleQuery() {
  // 查询逻辑
}
</script>

<style scoped>
.page-title { margin-bottom: 16px; }
.query-card { margin-bottom: 16px; }
</style>
