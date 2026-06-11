<template>
  <el-card shadow="hover">
    <template #header>
      <div class="echarts-header">
        <span>人员分布图</span>
        <el-radio-group v-model="chartType" size="small" @change="updateChart">
          <el-radio-button label="position">按职位</el-radio-button>
          <el-radio-button label="department">按部门</el-radio-button>
          <el-radio-button label="area">按区域</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <div ref="chartRef" style="width: 100%; height: 350px" />
  </el-card>
</template>

<script setup lang="ts">
defineOptions({ name: 'PersonnelEcharts' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()
const chartType = ref('position')
let chart: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  updateChart()
}

function updateChart() {
  if (!chart) return
  const data = chartType.value === 'position'
    ? { categories: ['采煤机司机', '支护工', '电工', '安检员', '其他'], values: [45, 32, 18, 12, 21] }
    : chartType.value === 'department'
    ? { categories: ['综采一队', '综采二队', '掘进队', '机电队', '通风队'], values: [56, 48, 35, 28, 15] }
    : { categories: ['A区', 'B区', 'C区', 'D区'], values: [80, 55, 40, 23] }

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.categories, axisLabel: { color: 'var(--text-secondary)' } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' } },
    series: [{
      type: 'bar',
      data: data.values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'var(--color-primary)' },
          { offset: 1, color: 'var(--color-primary-dark)' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
    }],
  })
}

onMounted(() => {
  initChart()
  const handler = () => chart?.resize()
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler)
    chart?.dispose()
  })
})
</script>

<style scoped>
.echarts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
