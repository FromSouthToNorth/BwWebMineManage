<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h2 class="gradient-title" style="font-size: 20px; font-weight: 700;">统计图</h2>
    </div>

    <div class="query-card">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="计量器具">
          <el-select v-model="queryParams.deiviceClassfy" placeholder="请选择">
            <el-option v-for="item in classfyOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置">
          <el-select v-model="queryParams.deiviceName" placeholder="请选择">
            <el-option v-for="item in nameOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>昨日产量</span></template>
          <ColumnarChart />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>今日产量</span></template>
          <ColumnarChart />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'StatisticalGraph' })

import { ref, reactive } from 'vue'
import ColumnarChart from '@/views/dashboard/production/ColumnarChart.vue'

const classfyOptions = ref<any[]>([])
const nameOptions = ref<any[]>([])
const queryParams = reactive({
  deiviceClassfy: '',
  deiviceName: '',
})

function handleQuery() {
  // 查询逻辑
}
</script>

<style scoped>
.page-title { margin-bottom: 16px; }
.query-card { margin-bottom: 16px; }
</style>
