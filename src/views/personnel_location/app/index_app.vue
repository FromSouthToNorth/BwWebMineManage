<template>
  <div class="app-personnel-layout">
    <van-nav-bar title="人员定位" left-arrow @click-left="goBack" />
    <div class="app-content">
      <router-view />
    </div>
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/personnelLocation_phone.cpt/index_app" icon="location-o">定位</van-tabbar-item>
      <van-tabbar-item to="/personnelLocation_phone.cpt/his_downhole_app" icon="clock-o">历史</van-tabbar-item>
      <van-tabbar-item to="/personnelLocation_phone.cpt/downholepersonquery_app" icon="search">查询</van-tabbar-item>
      <van-tabbar-item to="/personnelLocation_phone.cpt/personCount_app" icon="bar-chart-o">统计</van-tabbar-item>
      <van-tabbar-item to="/personnelLocation_phone.cpt/deviceState_app" icon="setting-o">设备</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppPersonnelLocation' })
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const active = ref(0)

function goBack() {
  router.back()
}
</script>

<style scoped>
.app-personnel-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-content {
  padding: 12px;
  padding-bottom: 50px;
}
</style>
