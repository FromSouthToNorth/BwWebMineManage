<template>
  <div class="personnel-location-app">
    <!-- 报警信息 -->
    <div class="alarm-bar">
      <span>设备报警 <em class="alarm-num danger">{{ deviceAlarms }}</em></span>
      <span class="alarm-divider" />
      <span>人员报警 <em class="alarm-num warning">{{ personAlarms }}</em></span>
    </div>

    <!-- 下井人数 -->
    <div class="downhole-summary">
      <div class="summary-item">
        <span class="summary-label">当前下井</span>
        <span class="summary-value">{{ currentDownhole }}</span>
        <span class="summary-unit">人</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">当天累计</span>
        <span class="summary-value">{{ dayDownhole }}</span>
        <span class="summary-unit">人</span>
      </div>
    </div>

    <!-- 简化的图表占位 -->
    <van-cell-group inset>
      <van-cell title="下井人员统计" is-link />
      <van-cell title="轨迹查询" is-link />
      <van-cell title="个人出勤统计" is-link />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PersonnelLocationApp' })
import { ref } from 'vue'

const deviceAlarms = ref(3)
const personAlarms = ref(1)
const currentDownhole = ref(128)
const dayDownhole = ref(356)
</script>

<style scoped>
.personnel-location-app {
  padding: 0;
}

.alarm-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: var(--bg-card);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.alarm-num {
  font-style: normal;
  font-size: 16px;
  font-weight: bold;
}

.alarm-num.danger { color: var(--color-danger); }
.alarm-num.warning { color: var(--color-warning); }

.alarm-divider {
  width: 1px; height: 16px;
  background: var(--border-color);
}

.downhole-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.summary-item {
  flex: 1;
  text-align: center;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 8px;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-primary);
}

.summary-unit {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 2px;
}
</style>
