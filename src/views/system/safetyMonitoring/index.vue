<template>
  <div class="safety-monitoring-page">
    <div class="page-header">
      <NavBar :title="title" h2ClassName="gradient-title" />
    </div>
    <el-row :gutter="16">
      <el-col :xs="24" :md="16">
        <SafetyMonitoringTable />
      </el-col>
      <el-col :xs="24" :md="8">
        <TimerAlarmTable />
        <el-card shadow="hover">
          <template #header>
            <span>统计图</span>
          </template>
          <BarChart />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringHomePage' })

import NavBar from '@/components/NavBar/index.vue'
import SafetyMonitoringTable from '@/components/SafetyMonitoringTable/index.vue'
import TimerAlarmTable from '@/components/TimerAlarmTable/index.vue'
import BarChart from '@/views/dashboard/BarChart.vue'

const title = '安全监测实时信息'
</script>

<style scoped>
.safety-monitoring-page {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;
}
</style>
