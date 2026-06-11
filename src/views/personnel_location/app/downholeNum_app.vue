<template>
  <div class="downhole-num-app">
    <van-nav-bar :title="`${route.params.year}年${route.params.month}月${route.params.day}日`" left-arrow @click-left="goBack" />
    <div class="app-content">
      <van-cell title="当日下井总人数" :value="`${route.params.total} 人`" />
      <div ref="chartRef" style="width: 100%; height: 300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DownholeNumApp' })
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()
const chartRef = ref<HTMLDivElement>()
function goBack() { router.back() }

let chart: echarts.ECharts | null = null
onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['早班', '中班', '晚班'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [65, 78, 42] }],
  })
})
onBeforeUnmount(() => { chart?.dispose() })
</script>
