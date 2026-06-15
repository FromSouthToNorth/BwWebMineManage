<template>
  <div class="dashboard">
    <!-- KPI 栏（动态渲染 API 返回字段） -->
    <div class="kpi-bar">
      <template v-for="(item, idx) in kpiList" :key="item.key">
        <div v-if="idx > 0" class="kpi-divider" />
        <div class="kpi-item">
          <div class="kpi-icon" :class="item.iconClass">
            <span v-html="item.icon"></span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ item.label }}</span>
            <span class="kpi-value" :class="item.valueClass">{{ item.value ?? 0 }}</span>
          </div>
        </div>
      </template>
    </div>

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
import { KPI_CONFIG } from '@/constants/kpi'
import type { KpiMeta } from '@/types/kpi'
import SafetyMonitoringTable from '@/components/SafetyMonitoringTable/index.vue'
import TimerAlarmTable from '@/components/TimerAlarmTable/index.vue'
import BarChart from '@/views/dashboard/BarChart.vue'

const selectedCategory = ref('')
const kpiList = ref<KpiItem[]>([])

interface KpiItem extends KpiMeta {
  value: number
}

function onChartClick(category: string) {
  selectedCategory.value = category
}

function onTotalUpdate(val: Record<string, any>) {
  kpiList.value = Object.keys(KPI_CONFIG)
    .filter(k => k in val)
    .map(k => ({
      ...KPI_CONFIG[k],
      value: val[k] ?? 0,
    }))
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

/* KPI */
.kpi-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: rgba(20, 29, 47, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  padding: 6px 14px;
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.kpi-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-total {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.kpi-alarm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.kpi-ok {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.kpi-warn {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.kpi-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.kpi-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
}

.kpi-value {
  font-size: 17px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-primary);
  line-height: 1.2;
}

.kpi-value.kpi-danger {
  color: var(--color-danger);
}

.kpi-value.kpi-success {
  color: var(--color-success);
}

.kpi-value.kpi-warning {
  color: var(--color-warning);
}

.kpi-divider {
  width: 1px;
  height: 26px;
  background: var(--border-color);
  flex-shrink: 0;
  margin: 0 2px;
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
