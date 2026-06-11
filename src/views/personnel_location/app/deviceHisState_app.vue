<template>
  <div class="device-his-state-app">
    <van-nav-bar title="设备历史报警" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-list :finished="true">
        <van-cell v-for="item in alarmList" :key="item.id" :title="item.deviceName" :label="`${item.type} | ${item.time}`">
          <template #value>
            <van-tag type="danger">{{ item.level }}</van-tag>
          </template>
        </van-cell>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceHisStateApp' })
import { useRouter } from 'vue-router'
const router = useRouter()

function goBack() { router.back() }

const alarmList = [
  { id: 1, deviceName: '基站#1', type: '通信中断', time: '2026-06-11 14:30', level: '严重' },
  { id: 2, deviceName: '基站#2', type: '电量不足', time: '2026-06-11 12:00', level: '一般' },
]
</script>
