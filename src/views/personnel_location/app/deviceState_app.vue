<template>
  <div class="device-state-app">
    <van-nav-bar title="设备状态" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-cell-group inset>
        <van-cell v-for="item in devices" :key="item.id" :title="item.name">
          <template #value>
            <van-tag :type="item.online ? 'success' : 'danger'">
              {{ item.online ? '在线' : '离线' }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      <van-button style="margin: 16px" block round type="primary" @click="goHis">
        历史报警
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceStateApp' })
import { useRouter } from 'vue-router'
const router = useRouter()

function goBack() { router.back() }
function goHis() { router.push('/personnelLocation_phone.cpt/deviceHisState_app') }

const devices = [
  { id: 1, name: '人员定位基站#1', online: true },
  { id: 2, name: '人员定位基站#2', online: true },
  { id: 3, name: '人员定位基站#3', online: false },
]
</script>
