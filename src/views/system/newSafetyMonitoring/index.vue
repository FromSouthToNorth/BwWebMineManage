<template>
  <div class="new-safety-page page-container">
    <h2 class="page-title">分站安全监测</h2>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span>分站列表</span></template>
          <div v-loading="leftLoading">
            <div
              v-for="station in stationList"
              :key="station.id"
              class="station-item"
              @click="handleStationClick(station)"
            >
              {{ station.name }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card shadow="hover">
          <template #header><span>{{ currentStation || '请选择分站' }}</span></template>
          <el-table v-loading="loading" :data="sensorList" stripe style="width: 100%">
            <el-table-column prop="sensorName" label="传感器" min-width="120" />
            <el-table-column prop="value" label="数值" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NewSafetyMonitoring' })

import { ref } from 'vue'

const stationList = ref<any[]>([])
const sensorList = ref<any[]>([])
const loading = ref(false)
const leftLoading = ref(false)
const currentStation = ref('')

function handleStationClick(station: any) {
  currentStation.value = station.name
  // 加载传感器数据
}
</script>

<style scoped>
.page-title { margin-bottom: 16px; }
.station-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.station-item:hover {
  background: var(--bg-hover);
}
</style>
