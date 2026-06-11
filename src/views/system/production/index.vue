<template>
  <div class="production-page page-container">
    <h2 class="page-title">产量监控</h2>

    <el-card shadow="hover" class="query-card">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="计量器具">
          <el-select v-model="queryParams.deiviceClassfy" placeholder="请选择" @change="getDeiviceNameSelect">
            <el-option v-for="item in classfyOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置">
          <el-select v-model="queryParams.deiviceName" placeholder="请选择">
            <el-option v-for="item in nameOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="queryParams.countDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
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
          <template #header><span>环形图</span></template>
          <AnnularChart />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>柱状图</span></template>
          <ColumnarChart />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Production' })

import { ref, reactive, onMounted } from 'vue'
import { deiveceClassSelect, deiviceNameSelect } from '@/api/system/production'
import AnnularChart from '@/views/dashboard/production/AnnularChart.vue'
import ColumnarChart from '@/views/dashboard/production/ColumnarChart.vue'

const classfyOptions = ref<any[]>([])
const nameOptions = ref<any[]>([])
const queryParams = reactive({
  deiviceClassfy: '',
  deiviceName: '',
  countDate: '',
})

async function getDeiviceClassfy() {
  const res = await deiveceClassSelect()
  classfyOptions.value = res.data || []
}

async function getDeiviceNameSelect() {
  if (!queryParams.deiviceClassfy) return
  const res = await deiviceNameSelect({ deiviceClassfy: queryParams.deiviceClassfy })
  nameOptions.value = res.data || []
}

function handleQuery() {
  // 查询逻辑
}

function resetQuery() {
  queryParams.deiviceClassfy = ''
  queryParams.deiviceName = ''
  queryParams.countDate = ''
}

onMounted(() => {
  getDeiviceClassfy()
})
</script>

<style scoped>
.page-title {
  margin-bottom: 16px;
}
.query-card {
  margin-bottom: 16px;
}
</style>
