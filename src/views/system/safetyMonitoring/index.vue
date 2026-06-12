<template>
  <div class="dashboard">
    <!-- KPI 栏 -->
    <div class="kpi-bar">
      <div class="kpi-item">
        <div class="kpi-icon kpi-total">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">监测总数</span>
          <span class="kpi-value">{{ totalPoints || 0 }}</span>
        </div>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item">
        <div class="kpi-icon kpi-alarm">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">报警点数</span>
          <span class="kpi-value kpi-danger">{{ alarmPoints || 0 }}</span>
        </div>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item">
        <div class="kpi-icon kpi-ok">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">运行正常</span>
          <span class="kpi-value kpi-success">{{ normalPoints || 0 }}</span>
        </div>
      </div>
      <div class="kpi-divider"></div>
      <div class="kpi-item">
        <div class="kpi-icon kpi-warn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">异常设备</span>
          <span class="kpi-value kpi-warning">{{ abnormalPoints || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 主体：左右两栏 -->
    <div class="main-area">
      <!-- 左：安全监测 -->
      <div class="left-col">
        <SafetyMonitoringTable
          :filter-category="selectedCategory"
          @update:total="onTotalUpdate"
        />
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

const selectedCategory = ref('')
const totalPoints = ref(0)
const alarmPoints = ref(0)
const normalPoints = ref(0)
const abnormalPoints = ref(0)

function onChartClick(category: string) {
  selectedCategory.value = category
}

function onTotalUpdate(val: number) {
  totalPoints.value = val
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
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-total { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.kpi-alarm { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.kpi-ok { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.kpi-warn { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.kpi-info { display: flex; flex-direction: column; gap: 1px; }
.kpi-label { font-size: 10px; color: var(--text-muted); }
.kpi-value { font-size: 17px; font-weight: 700; font-family: var(--font-mono); color: var(--text-primary); line-height: 1.2; }
.kpi-value.kpi-danger { color: var(--color-danger); }
.kpi-value.kpi-success { color: var(--color-success); }
.kpi-value.kpi-warning { color: var(--color-warning); }
.kpi-divider { width: 1px; height: 26px; background: var(--border-color); flex-shrink: 0; margin: 0 2px; }

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
