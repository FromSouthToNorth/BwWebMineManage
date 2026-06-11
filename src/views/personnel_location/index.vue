<template>
  <el-container class="personnel-page">
    <el-header>
      <div class="header-info">
        <div class="header-left">
          <div class="location-title">人员定位实时信息</div>
          <div class="downhole-numbers">
            <span class="num-label">下井人数</span>
            <span class="divider" />
            <span class="num-item">当前:<span class="num-value">{{ currentDownhole }}</span></span>
            <span class="num-item">当天:<span class="num-value">{{ dayDownhole }}</span></span>
          </div>
        </div>
        <div class="header-right">
          <div class="alarm-info">
            <span>设备报警 <em class="alarm-num">{{ deviceAlarms }}</em> 台</span>
            <span>人员报警 <em class="alarm-num">{{ personAlarms }}</em> 人</span>
          </div>
          <el-button size="small" type="primary" @click="openPopup('downUserQuery')">井下人员查询</el-button>
          <el-button size="small" type="primary" @click="openPopup('deviceState')">设备状态</el-button>
        </div>
      </div>
    </el-header>

    <main>
      <echarts />
    </main>

    <footer>
      <infoList />
    </footer>
  </el-container>
</template>

<script setup lang="ts">
defineOptions({ name: 'PersonnelLocation' })

import { ref, onMounted } from 'vue'
import echarts from './echarts.vue'
import infoList from './infoList.vue'

const currentDownhole = ref(0)
const dayDownhole = ref(0)
const deviceAlarms = ref(0)
const personAlarms = ref(0)

function openPopup(type: string) {
  console.log('打开弹窗:', type)
}

onMounted(() => {
  // 模拟数据加载
  currentDownhole.value = 128
  dayDownhole.value = 356
  deviceAlarms.value = 3
  personAlarms.value = 1
})
</script>

<style scoped>
.personnel-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 0 16px;
  height: auto !important;
}

.header-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.location-title {
  font-size: 22px;
  font-weight: bold;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.downhole-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
}

.num-label { color: var(--text-secondary); }

.divider {
  width: 1px; height: 20px;
  background: var(--border-color);
}

.num-value {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: bold;
  margin-left: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.alarm-info {
  display: flex;
  gap: 12px;
  padding: 6px 12px;
  border: 1px solid var(--color-danger);
  border-radius: 15px;
  font-size: 12px;
  color: var(--text-secondary);
}

.alarm-num {
  color: var(--color-danger);
  font-size: 16px;
  font-weight: bold;
  font-style: normal;
}

main {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

footer {
  flex: 0 0 auto;
}
</style>
