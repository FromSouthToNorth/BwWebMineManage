<template>
  <div class="app-safety-table">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="listLoading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <van-cell v-for="item in list" :key="item.id" @click="showDetail(item)">
          <template #title>
            <span class="device-name">{{ item.devName }}</span>
            <van-tag v-if="item.alarmStatus === '报警'" type="danger" size="small" style="margin-left: 6px">报警</van-tag>
          </template>
          <template #value>
            <span :class="{ 'alarm-text': item.alarmStatus === '报警' }">{{ item.devValue }}</span>
          </template>
          <template #label>
            <span>{{ item.substation }} | {{ item.category }} | {{ item.site }}</span>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <!-- 详情弹窗 -->
    <van-action-sheet v-model:show="detailVisible" title="监测点详情">
      <div class="detail-content">
        <van-cell-group>
          <van-cell title="名称" :value="detailItem.devName" />
          <van-cell title="数值" :value="detailItem.devValue" />
          <van-cell title="状态">
            <template #value>
              <van-tag :type="detailItem.devStatus === '正常' ? 'success' : 'danger'">
                {{ detailItem.devStatus }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="分站" :value="detailItem.substation" />
          <van-cell title="类别" :value="detailItem.category" />
          <van-cell title="区域" :value="detailItem.area" />
          <van-cell title="地点" :value="detailItem.site" />
        </van-cell-group>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSafetyMonitoringTable' })

import { ref } from 'vue'
import { listSafetyMonitoring } from '@/api/system/safetyMonitoring'

const list = ref<any[]>([])
const listLoading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const detailVisible = ref(false)
const detailItem = ref<any>({})

async function onLoad() {
  if (refreshing.value) {
    list.value = []
    pageNum.value = 1
    refreshing.value = false
  }

  listLoading.value = true
  try {
    const res = await listSafetyMonitoring({ pageNum: pageNum.value, pageSize: 20 })
    const rows = (res.data?.rows || []) as any[]
    list.value.push(...rows)
    pageNum.value++
    if (rows.length < 20) finished.value = true
  } catch (e) {
    console.error(e)
  } finally {
    listLoading.value = false
  }
}

function onRefresh() {
  finished.value = false
  pageNum.value = 1
  list.value = []
  onLoad()
}

function showDetail(item: any) {
  detailItem.value = item
  detailVisible.value = true
}
</script>

<style scoped>
.app-safety-table {
  padding: 12px 0;
}

.device-name {
  font-weight: 500;
}

.alarm-text {
  color: var(--color-danger);
  font-weight: bold;
}

.detail-content {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
