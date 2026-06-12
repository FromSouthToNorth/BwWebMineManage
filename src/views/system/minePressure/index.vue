<template>
  <div class="mine-pressure-page page-container">
    <div class="page-header flex-between">
      <h2 class="gradient-title" style="font-size: 20px; font-weight: 700;">矿压监测</h2>
    </div>

    <div class="query-card">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="安装位置">
          <el-select v-model="queryParams.installSiteName" placeholder="请选择" @change="getList">
            <el-option v-for="item in siteOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="queryParams.type" @change="getList">
            <el-radio-button label="ZZ">左柱</el-radio-button>
            <el-radio-button label="YZ">右柱</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>压力曲线</span></template>
          <Pressure :install-site-name="queryParams.installSiteName" :type="queryParams.type" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>热力图</span></template>
          <Heatmap :install-site-name="queryParams.installSiteName" :type="queryParams.type" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <template #header><span>矿压数据列表</span></template>
      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="installSiteName" label="安装位置" min-width="120" />
        <el-table-column prop="pressureValue" label="压力值" width="120" />
        <el-table-column prop="alarmValue" label="报警值" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressure' })

import { ref, reactive, onMounted } from 'vue'
import { installNameSelect, listMinePressure } from '@/api/system/minePressure'
import Pressure from '@/views/dashboard/minePressure/Pressure.vue'
import Heatmap from '@/views/dashboard/minePressure/Heatmap.vue'

const loading = ref(false)
const tableData = ref<any[]>([])
const siteOptions = ref<any[]>([])
const queryParams = reactive({
  installSiteName: '',
  type: 'ZZ',
  pageNum: 1,
  pageSize: 20,
})

async function getInstallSites() {
  try {
    const res = await installNameSelect()
    siteOptions.value = res.data || []
  } catch (e) {
    console.error('获取安装位置失败', e)
  }
}

async function getList() {
  loading.value = true
  try {
    const res = await listMinePressure(queryParams)
    tableData.value = res.data || []
  } catch (e) {
    console.error('获取矿压数据失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getInstallSites()
  getList()
})
</script>

<style scoped>
.page-title {
  margin-bottom: 16px;
  font-size: 20px;
}

.query-card {
  margin-bottom: 16px;
}

.chart-row {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}
</style>
