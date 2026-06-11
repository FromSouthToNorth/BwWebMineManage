<template>
  <div class="trajectory-query-app">
    <van-nav-bar title="轨迹查询" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-form @submit="handleSearch">
        <van-field v-model="formData.name" name="name" label="姓名" placeholder="请输入姓名" />
        <van-field v-model="formData.date" name="date" label="日期" placeholder="选择日期" @click="showDatePicker = true" />
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit">查询</van-button>
        </div>
      </van-form>

      <van-list v-if="hasResult" :finished="true">
        <van-cell v-for="item in resultList" :key="item.id" :title="item.location" :label="item.time" />
      </van-list>

      <van-action-sheet v-model:show="showDatePicker" title="选择日期">
        <van-date-picker @confirm="handleDateConfirm" @cancel="showDatePicker = false" />
      </van-action-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TrajectoryQueryApp' })
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showDatePicker = ref(false)
const hasResult = ref(false)
const resultList = ref<any[]>([])
const formData = reactive({ name: '', date: '' })

function goBack() { router.back() }

function handleSearch() {
  hasResult.value = true
}

function handleDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  formData.date = selectedValues.join('-')
  showDatePicker.value = false
}
</script>
