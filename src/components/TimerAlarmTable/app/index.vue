<template>
  <div class="app-timer-alarm">
    <!-- 头部统计 -->
    <div class="alarm-stats">
      <div class="stat-item">
        <span class="stat-label">实时报警</span>
        <span class="stat-value" :class="{ 'has-alarm': alarmData.length > 0 }">
          {{ alarmData.length }}
        </span>
        <span class="stat-unit">条</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <span class="stat-label">更新于</span>
        <span class="stat-time">{{ lastUpdate }}</span>
      </div>
      <button class="stat-refresh" :class="{ refreshing }" @click="manualRefresh">
        <van-icon name="replay" />
      </button>
    </div>

    <!-- 报警列表 -->
    <div class="alarm-scroll">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :head-height="56">
        <template #pulling>
          <div class="refresh-hint">下拉刷新报警数据</div>
        </template>
        <template #loosing>
          <div class="refresh-hint">释放立即刷新</div>
        </template>

        <!-- 首次加载骨架 -->
        <template v-if="loading && alarmData.length === 0">
          <div v-for="n in 5" :key="n" class="alarm-skeleton">
            <div class="sk-dot" />
            <div class="sk-lines">
              <div class="sk-line sk-line--60" />
              <div class="sk-line sk-line--90" />
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else-if="!loading && alarmData.length === 0" class="alarm-empty">
          <van-icon name="success" size="48" :style="{ color: 'var(--color-success)', opacity: 0.4 }" />
          <span class="alarm-empty__text">系统运行正常，无报警</span>
        </div>

        <!-- 报警条目 -->
        <template v-else>
          <div v-for="(item, idx) in alarmData" :key="item.devName + item.alarmTime" class="alarm-item"
            @click="showDetail(item)">
            <div class="alarm-item__dot" :class="idx < 3 ? 'is-severe' : 'is-normal'" />
            <div class="alarm-item__body">
              <div class="alarm-item__top">
                <span class="alarm-item__name">{{ item.devName }}</span>
                <span class="alarm-item__type">{{ item.alarmType }}</span>
              </div>
              <div class="alarm-item__location">{{ item.alarmContent }}</div>
              <div class="alarm-item__footer">
                <span class="alarm-item__time">{{ formatTime(item.alarmTime) }}</span>
                <span v-if="idx === 0" class="alarm-item__badge">最新</span>
              </div>
            </div>
          </div>
        </template>
      </van-pull-refresh>
    </div>

    <!-- 详情弹窗 -->
    <van-action-sheet v-model:show="detailVisible" title="报警详情" :close-on-click-action="true">
      <div v-if="currentRow" class="detail-body">
        <div class="detail-hero" :class="'is-alarm'">
          <div class="detail-hero__status">
            <van-icon name="warning-o" size="20" />
            <span>实时报警</span>
          </div>
        </div>
        <div class="detail-fields">
          <div class="detail-field">
            <span class="detail-label">设备名称</span>
            <span class="detail-value">{{ currentRow.devName }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">报警类型</span>
            <span class="detail-value">{{ currentRow.alarmType }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">报警内容</span>
            <span class="detail-value">{{ currentRow.alarmContent }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">报警时间</span>
            <span class="detail-value">{{ currentRow.alarmTime }}</span>
          </div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppTimerAlarmTable' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { listEalTimeAlarm } from '@/api/system/ealTimeAlarm'

interface AlarmItem {
  devName: string
  alarmType: string
  alarmContent: string
  alarmTime: string
  severity?: string
}

const alarmData = ref<AlarmItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const spinning = ref(false)
const lastUpdate = ref('--:--:--')
const detailVisible = ref(false)
const currentRow = ref<AlarmItem | null>(null)

let timer: ReturnType<typeof setInterval> | null = null

function formatTime(t: string | undefined | null): string {
  if (!t) return ''
  const m = t.match(/\d{2}:\d{2}:\d{2}/)
  return m ? m[0] : t
}

function formatLastUpdate(t: string | undefined | null): string {
  if (!t) return '--:--:--'
  const m = t.match(/\d{2}:\d{2}:\d{2}/)
  return m ? m[0] : t
}

async function getData() {
  loading.value = alarmData.value.length === 0
  try {
    const res = await listEalTimeAlarm()
    const { items } = res.data || {}
    alarmData.value = (items || []).map((item: any) => ({
      devName: item.devAddress || item.devName || '',
      alarmType: item.alarmType || item.categoryStateText || '',
      alarmContent: item.alarmContent || item.devType || '',
      alarmTime: item.alarmTime || item.valueUpdateDT || '',
      severity: item.severity || '2',
    }))
    if (alarmData.value.length > 0) {
      lastUpdate.value = formatLastUpdate(alarmData.value[0].alarmTime)
    }
  } catch (e) {
    console.error('获取实时报警失败', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  refreshing.value = true
  getData()
}

function manualRefresh() {
  spinning.value = true
  showToast({ message: '刷新中...', duration: 0 })
  getData().finally(() => showToast.clear())
}

function showDetail(item: AlarmItem) {
  currentRow.value = item
  detailVisible.value = true
}

onMounted(() => {
  getData()
  timer = setInterval(getData, 15000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.app-timer-alarm {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* 头部统计 */
.alarm-stats {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 12px;
  gap: 0;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 2px;
}

.stat-value.has-alarm {
  color: var(--color-danger);
}

.stat-unit {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 12px;
}

.stat-refresh {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.stat-refresh:active {
  transform: scale(0.92);
}

.stat-refresh.refreshing :deep(.van-icon) {
  animation: spin 0.8s linear infinite;
}

/* 列表 */
.alarm-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 骨架 */
.alarm-skeleton {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.sk-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color);
  flex-shrink: 0;
  margin-top: 4px;
}

.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-line {
  height: 12px;
  border-radius: 6px;
  background: var(--border-color);
  animation: sk-pulse 1.5s ease-in-out infinite;
}

.sk-line--60 {
  width: 60%;
}

.sk-line--90 {
  width: 90%;
}

@keyframes sk-pulse {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.alarm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
}

.alarm-empty__text {
  font-size: 14px;
  color: var(--text-muted);
}

.refresh-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
}

/* 报警条目 */
.alarm-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
}

.alarm-item:active {
  transform: scale(0.99);
  border-color: var(--border-color-light);
}

.alarm-item__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.alarm-item__dot.is-severe {
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger-glow);
  animation: pulse-alarm 1.5s ease-in-out infinite;
}

.alarm-item__dot.is-normal {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning-glow);
}

.alarm-item__body {
  flex: 1;
  min-width: 0;
}

.alarm-item__top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alarm-item__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-item__type {
  font-size: 11px;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.12);
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.alarm-item__location {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 3px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alarm-item__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.alarm-item__time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.alarm-item__badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}

/* 详情弹窗 */
.detail-body {
  padding: 0 16px 24px;
}

.detail-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.12);
}

.detail-hero__status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-danger);
  font-size: 16px;
  font-weight: 600;
}

.detail-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color-light);
  border-radius: 8px;
}

.detail-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.4;
}
</style>
