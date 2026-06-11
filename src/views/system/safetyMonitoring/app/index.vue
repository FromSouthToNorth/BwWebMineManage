<template>
  <div class="app-safety-page">
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/index_phone.cpt/safety">安全监测</van-tabbar-item>
      <van-tabbar-item to="/index_phone.cpt/realTime">实时报警</van-tabbar-item>
      <van-tabbar-item to="/index_phone.cpt/chart">统计图</van-tabbar-item>
    </van-tabbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSafetyMonitoring' })
import { ref } from 'vue'

const active = ref(0)
</script>
