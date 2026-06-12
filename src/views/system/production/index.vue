<template>
  <div class="page-container">
    <NavBar title="产量监控" subtitle="计量器具产量统计" />

    <!-- 查询卡片 -->
    <div class="query-card">
      <el-form :model="queryParams" inline size="small" @keyup.enter="handleQuery">
        <el-form-item label="计量器具">
          <el-select v-model="queryParams.deiviceClassfy" placeholder="请选择" @change="getDeiviceNameSelect" clearable>
            <el-option v-for="item in classfyOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置">
          <el-select v-model="queryParams.deiviceName" placeholder="请选择" clearable>
            <el-option v-for="item in nameOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="queryParams.countDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" :clearable="true" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            查询
          </el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :sm="12">
        <div class="chart-card">
          <div class="chart-card__header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary);">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            <span>产量分布</span>
          </div>
          <AnnularChart
            :deivice-name="queryParams.deiviceName"
            :count-date="queryParams.countDate"
          />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="chart-card">
          <div class="chart-card__header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary);">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>产量对比</span>
          </div>
          <ColumnarChart
            :deivice-name="queryParams.deiviceName"
            :count-date="queryParams.countDate"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProductionPage' })

import { ref, reactive, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import { deiveceClassSelect, deiviceNameSelect } from '@/api/system/production'
import AnnularChart from '@/views/dashboard/production/AnnularChart.vue'
import ColumnarChart from '@/views/dashboard/production/ColumnarChart.vue'

const classfyOptions = ref<any[]>([])
const nameOptions = ref<any[]>([])
const loading = ref(false)

const queryParams = reactive({
  deiviceClassfy: '',
  deiviceName: '',
  countDate: '',
})

async function getDeiviceClassfy() {
  try {
    const res = await deiveceClassSelect()
    classfyOptions.value = res.data || []
  } catch (e) {
    console.error('获取计量器具分类失败', e)
  }
}

async function getDeiviceNameSelect() {
  if (!queryParams.deiviceClassfy) {
    nameOptions.value = []
    return
  }
  try {
    const res = await deiviceNameSelect({ deiviceClassfy: queryParams.deiviceClassfy })
    nameOptions.value = res.data || []
  } catch (e) {
    console.error('获取安装位置失败', e)
  }
}

function handleQuery() {
  // 图表组件通过 props 监听参数变化自动刷新
  // AnnularChart 和 ColumnarChart 内 watch props 触发重新渲染
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
.query-card {
  margin-bottom: var(--spacing-lg);
}

.chart-row {
  margin-bottom: var(--spacing-lg);
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-md);
}

.chart-card:hover {
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: var(--shadow-md);
}

.chart-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}
</style>
