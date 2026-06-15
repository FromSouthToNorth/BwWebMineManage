<template>
  <div class="dashboard">
    <!-- KPI 概览 -->
    <KpiSection :data="kpiData" />

    <!-- 主体：左右两栏 -->
    <div class="main-area">
      <!-- 左：安全监测 -->
      <div class="left-col">
        <SafetyMonitoringTable :filter-category="selectedCategory" @update:total="onTotalUpdate" />
      </div>
      <!-- 右：报警 + 图表 -->
      <div class="right-col">
        <TimerAlarmTable />
        <div class="right-chart">
          <BarChart class="right-chart__bar" @chart-click="onChartClick" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringHomePage' })

import { ref } from 'vue'
import SafetyMonitoringTable from '@/components/SafetyMonitoringTable/index.vue'
import TimerAlarmTable from '@/components/TimerAlarmTable/index.vue'
import BarChart from '@/views/dashboard/BarChart.vue'
import KpiSection from '@/components/KpiSection/index.vue'

const selectedCategory = ref('')
const kpiData = ref<Record<string, any>>({})

function onChartClick(category: string) {
  selectedCategory.value = category
}

function onTotalUpdate(val: Record<string, any>) {
  kpiData.value = val
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 左右主体 */
.main-area {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 10px;
}

.left-col {
  flex: 0 0 65%;
  min-width: 0;
  overflow: hidden;
}

.right-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.right-chart {
  flex: 1;
  min-height: 0;
  background: rgba(20, 29, 47, 0.35);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.right-chart :deep(.right-chart__bar) {
  height: 100% !important;
  min-height: 200px;
}
</style>
