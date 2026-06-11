<template>
  <div class="user-info-count-app">
    <van-nav-bar title="出勤统计" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-cell-group inset>
        <van-cell title="本月出勤" :value="`${attendance.days} 天`" />
        <van-cell title="累计时长" :value="attendance.hours" />
        <van-cell title="加班次数" :value="`${attendance.overtime} 次`" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserInfoCountApp' })
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() { router.back() }
const attendance = { days: 22, hours: '176h', overtime: 3 }
</script>
