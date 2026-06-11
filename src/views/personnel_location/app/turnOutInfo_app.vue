<template>
  <div class="turn-out-info-app">
    <van-nav-bar title="出入井信息" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-cell-group inset>
        <van-cell v-for="item in list" :key="item.id" :title="item.name" :label="`入井: ${item.downTime} | 出井: ${item.upTime}`" :value="item.duration" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TurnOutInfoApp' })
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() { router.back() }
const list = [
  { id: 1, name: '王某某', downTime: '08:00', upTime: '16:00', duration: '8h' },
  { id: 2, name: '李某某', downTime: '08:30', upTime: '15:30', duration: '7h' },
]
</script>
