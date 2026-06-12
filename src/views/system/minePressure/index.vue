<template>
  <div class="page-container">
    <!-- 使用设计系统 NavBar -->
    <NavBar title="矿压监测" subtitle="支架压力实时监控" gradient />

    <!-- 查询卡片 -->
    <div class="query-card">
      <el-form :model="queryParams" inline size="small" @keyup.enter="getList">
        <el-form-item label="安装位置">
          <el-select v-model="queryParams.installSiteName" placeholder="请选择" @change="getList" clearable>
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
          <el-button type="primary" @click="getList">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              style="margin-right: 4px; vertical-align: middle;">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :sm="12">
        <div class="chart-card">
          <div class="chart-card__header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
              style="color: var(--color-primary);">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>压力曲线</span>
          </div>
          <Pressure :install-site-name="queryParams.installSiteName" :type="queryParams.type" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="chart-card">
          <div class="chart-card__header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
              style="color: var(--color-warning);">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>热力图</span>
          </div>
          <Heatmap :install-site-name="queryParams.installSiteName" :type="queryParams.type" />
        </div>
      </el-col>
    </el-row>

    <!-- 数据列表 -->
    <div class="data-card">
      <div class="data-card__header">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
          style="color: var(--text-secondary);">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>矿压数据列表</span>
        <span class="data-card__count">{{ total }} 条记录</span>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" empty-text="暂无矿压数据">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="installSiteName" label="安装位置" min-width="120" />
        <el-table-column prop="pressureValue" label="压力值" width="130">
          <template #default="{ row }">
            <span class="text-mono">{{ row.pressureValue ?? '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmValue" label="报警值" width="130">
          <template #default="{ row }">
            <span class="text-mono">{{ row.alarmValue ?? '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <!-- 使用设计系统 StatusBadge -->
            <StatusBadge :status="row.status === '正常' ? 'normal' : 'alarm'" variant="badge"
              :label="row.status || '--'" />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-wrapper">
        <Pagination :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]" @pagination="handlePagination" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MinePressure' })

import { ref, reactive, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { installNameSelect, listMinePressure } from '@/api/system/minePressure'
import Pressure from '@/views/dashboard/minePressure/Pressure.vue'
import Heatmap from '@/views/dashboard/minePressure/Heatmap.vue'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
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
    console.log('获取安装位置成功', res)
    siteOptions.value = res.data || []
  } catch (e) {
    console.error('获取安装位置失败', e)
  }
}

async function getList() {
  loading.value = true
  try {
    const res = await listMinePressure(queryParams)
    const data = res.data || []
    // 支持分页和非分页响应
    if (Array.isArray(data)) {
      tableData.value = data
      total.value = data.length
    } else {
      tableData.value = data.items || []
      total.value = data.total || 0
    }
  } catch (e) {
    console.error('获取矿压数据失败', e)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handlePagination(p: { page: number; limit: number }) {
  queryParams.pageNum = p.page
  queryParams.pageSize = p.limit
  getList()
}

onMounted(() => {
  getInstallSites()
  getList()
})
</script>

<style scoped>
.query-card {
  margin-bottom: var(--spacing-lg);
}

.chart-row {
  margin-bottom: var(--spacing-lg);
}

/* 图表卡片 — 设计系统风格 */
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

/* 数据卡片 — 设计系统风格 */
.data-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.data-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.data-card__count {
  margin-left: auto;
  font-size: var(--font-size-xs);
  font-weight: 400;
  color: var(--text-muted);
}

.text-mono {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}
</style>
