<template>
  <div class="person-count-app">
    <van-nav-bar title="人员统计" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-tabs v-model:active="activeTab">
        <van-tab title="个人统计">
          <van-cell title="王某某" :value="'22 天'" is-link />
          <van-cell title="李某某" :value="'21 天'" is-link />
          <van-cell title="赵某某" :value="'19 天'" is-link />
        </van-tab>
        <van-tab title="部门统计">
          <van-cell title="综采一队" :value="'56 人'" is-link />
          <van-cell title="综采二队" :value="'48 人'" is-link />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PersonCountApp' })
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const activeTab = ref(0)
function goBack() { router.back() }
</script>
