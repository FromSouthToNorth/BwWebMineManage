<template>
  <div class="his-downhole-app">
    <van-nav-bar title="历史下井信息" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-tabs v-model:active="activeTab">
        <van-tab title="2026">
          <div ref="chartRef" style="width: 100%; height: 250px; margin: 12px 0" />
          <van-cell v-for="item in monthlyData" :key="item.month" :title="`${item.month}月`" :value="`${item.count}人`" />
        </van-tab>
        <van-tab title="2025">
          <div style="padding: 20px; text-align: center; color: var(--text-muted)">暂无数据</div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HisDownholeApp' })
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const activeTab = ref(0)
const chartRef = ref<HTMLDivElement>()
const monthlyData = ref(
  Array.from({ length: 6 }, (_, i) => ({ month: i + 1, count: Math.floor(Math.random() * 300) + 100 }))
)

function goBack() { router.back() }

let chart: echarts.ECharts | null = null
onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: monthlyData.value.map(d => `${d.month}月`) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: monthlyData.value.map(d => d.count), smooth: true, areaStyle: { opacity: 0.3 } }],
  })
})
onBeforeUnmount(() => { chart?.dispose() })
</script>
