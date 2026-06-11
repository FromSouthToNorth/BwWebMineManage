<template>
  <div class="downhole-person-query-app">
    <van-nav-bar title="井下人员查询" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-tabs v-model:active="activeTab">
        <van-tab title="分类查询">
          <van-cell-group inset>
            <van-cell title="按部门查询" is-link />
            <van-cell title="按区域查询" is-link />
            <van-cell title="按工种查询" is-link />
          </van-cell-group>
        </van-tab>
        <van-tab title="自定义查询">
          <van-form @submit="handleSearch">
            <van-field v-model="form.name" label="姓名" placeholder="输入姓名" />
            <van-field v-model="form.department" label="部门" placeholder="输入部门" />
            <van-button round block type="primary" native-type="submit" style="margin: 16px">查询</van-button>
          </van-form>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DownholePersonQueryApp' })
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const activeTab = ref(0)
const form = reactive({ name: '', department: '' })
function goBack() { router.back() }
function handleSearch() { console.log('查询:', form) }
</script>
