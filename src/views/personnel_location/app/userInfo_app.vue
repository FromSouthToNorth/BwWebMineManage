<template>
  <div class="user-info-app">
    <van-nav-bar title="人员信息" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-cell-group inset>
        <van-cell title="姓名" :value="userInfo.name" />
        <van-cell title="工号" :value="userInfo.workNumber" />
        <van-cell title="部门" :value="userInfo.department" />
        <van-cell title="职位" :value="userInfo.position" />
        <van-cell title="下井时长" :value="userInfo.downholeDuration" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserInfoApp' })
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() { router.back() }
const userInfo = { name: '王某某', workNumber: '2021001', department: '综采一队', position: '采煤机司机', downholeDuration: '6h 30min' }
</script>
