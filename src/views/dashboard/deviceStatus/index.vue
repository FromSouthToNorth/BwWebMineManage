<template>
  <div class="device-status-page">
    <h2 class="page-title">设备状态</h2>
    <el-row :gutter="16">
      <el-col v-for="item in devices" :key="item.name" :span="6">
        <el-card shadow="hover" class="device-card">
          <div class="device-icon">
            <el-icon :size="32" :color="item.online ? '#13ce66' : '#ff4949'">
              <Monitor />
            </el-icon>
          </div>
          <div class="device-name">{{ item.name }}</div>
          <div class="device-status">
            <el-tag :type="item.online ? 'success' : 'danger'" size="small">
              {{ item.online ? '在线' : '离线' }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceStatus' })

const devices = [
  { name: '设备 1', online: true },
  { name: '设备 2', online: true },
  { name: '设备 3', online: false },
  { name: '设备 4', online: true },
]
</script>

<style scoped>
.page-title { margin-bottom: 16px; }
.device-card { text-align: center; margin-bottom: 16px; }
.device-icon { margin-bottom: 8px; }
.device-name { font-size: 14px; margin-bottom: 8px; }
</style>
