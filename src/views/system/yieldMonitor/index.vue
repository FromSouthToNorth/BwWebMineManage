<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h2 class="gradient-title" style="font-size: 20px; font-weight: 700;">产量监测</h2>
    </div>
    <el-card shadow="hover">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="deviceName" label="设备名称" min-width="120" />
        <el-table-column prop="value" label="数值" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'YieldMonitor' })
import { ref } from 'vue'

const tableData = ref<any[]>([])
</script>
