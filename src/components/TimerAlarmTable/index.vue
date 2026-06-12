<template>
  <div class="alarm-panel">
    <!-- 头部 -->
    <div class="alarm-header">
      <div class="alarm-title">
        <svg class="alarm-bell" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>实时报警</span>
        <span class="alarm-count">{{ alarmData.length }}</span>
      </div>
      <div class="alarm-actions">
        <span class="live-indicator" :class="{ active: true }" />
        <el-button text size="small" @click="handleMore" style="color: var(--color-primary); font-weight: 500; font-size: 12px;">查看全部 →</el-button>
      </div>
    </div>

    <!-- 报警列表 -->
    <div class="alarm-scroll">
      <!-- 骨架 -->
      <template v-if="loading && alarmData.length === 0">
        <div v-for="n in 3" :key="'s' + n" class="alarm-skeleton">
          <div class="sk-row">
            <div class="sk-line w-30" />
            <div class="sk-line w-20" />
          </div>
          <div class="sk-line w-80" />
          <div class="sk-line w-40" />
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="!loading && alarmData.length === 0" class="alarm-empty">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-success); opacity: 0.4;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>系统运行正常，无报警</span>
      </div>

      <!-- 报警条目 -->
      <TransitionGroup name="alarm-slide" tag="div" class="alarm-list">
        <div v-for="(item, idx) in alarmData" :key="item.alarmTime + item.devName" class="alarm-item">
          <div class="alarm-body">
            <div class="alarm-top">
              <span class="alarm-device">{{ item.devName }}</span>
              <span class="alarm-type-tag">{{ item.alarmType || '报警' }}</span>
            </div>
            <div class="alarm-content">{{ item.alarmContent }}</div>
            <div class="alarm-bottom">
              <span class="alarm-time">{{ formatTime(item.alarmTime) }}</span>
              <span v-if="idx === 0" class="alarm-new">NEW</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>

  <!-- 报警记录弹窗 -->
  <el-dialog v-model="moreVisible" width="800px" top="5vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon" style="color: var(--color-danger); background: rgba(239,68,68,0.1);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">报警记录</div>
          <div class="dialog-header-sub">历史报警查询与统计</div>
        </div>
      </div>
    </template>

    <!-- 筛选栏 -->
    <div class="history-filters">
      <div class="history-filter-item">
        <label class="history-filter-label">地点</label>
        <el-input v-model="historyQuery.address" placeholder="输入地点" clearable size="small" style="width: 140px;" />
      </div>
      <div class="history-filter-item">
        <label class="history-filter-label">类型</label>
        <el-select v-model="historyQuery.typeName" placeholder="全部" clearable size="small" style="width: 110px;">
          <el-option v-for="item in historyTypeOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
        </el-select>
      </div>
      <div class="history-filter-item">
        <label class="history-filter-label">时间</label>
        <el-date-picker v-model="historyDateRange" type="datetimerange" range-separator="至" start-placeholder="开始"
          end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss" size="small" style="width: 260px;" />
      </div>
      <el-button type="primary" size="small" @click="searchHistory" style="margin-top: 18px;">查询</el-button>
    </div>

    <!-- 历史列表 -->
    <div class="history-list">
      <div v-for="(item, idx) in historyData" :key="idx" class="history-item">
        <span class="history-time">{{ item.alarmTime }}</span>
        <div class="history-item-body">
          <div class="history-item-top">
            <span class="history-device">{{ item.devName }}</span>
          </div>
          <div class="history-content">{{ item.alarmContent }}</div>
        </div>
      </div>
      <div v-if="historyData.length === 0" class="history-empty">无匹配记录</div>
    </div>

    <div class="history-footer">
      <pagination v-if="historyTotal > 0" :total="historyTotal" :page="historyQuery.pageNum"
        :limit="historyQuery.pageSize" @pagination="handleHistoryPagination" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'TimerAlarmTable' })

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { listEalTimeAlarm, listHistoricalAlarm } from '@/api/system/ealTimeAlarm'

const alarmData = ref<any[]>([])
const loading = ref(false)

const moreVisible = ref(false)
const historyData = ref<any[]>([])
const historyLoading = ref(false)
const historyTotal = ref(0)
const historyDateRange = ref<[string, string] | null>(null)
const historyTypeOptions = ref<any[]>([])
const historyQuery = reactive({
  pageNum: 1,
  pageSize: 20,
  address: '',
  typeName: '',
})

let timer: ReturnType<typeof setInterval> | null = null

function formatTime(t: string | undefined | null): string {
  if (!t) return ''
  const m = t.match(/\d{2}:\d{2}:\d{2}/)
  return m ? m[0] : t
}

async function getData() {
  loading.value = true
  try {
    const res = await listEalTimeAlarm()
    const { items } = res.data || {}
    alarmData.value = (items || []).map((item: any) => ({
      alarmType: item.alarmType,
      alarmContent: item.devAddress || item.devLabel,
      devName: item.devLabel || item.devAddress,
      alarmTime: item.alarmBeginDT || item.valueUpdateDT,
      severity: item.severity || (item.alarmType === 1 ? '1' : '0'),
    }))
  } catch (e) {
    console.error('获取实时报警失败', e)
  } finally {
    loading.value = false
  }
}

function handleMore() {
  moreVisible.value = true
  searchHistory()
}

async function searchHistory() {
  historyLoading.value = true
  try {
    const res = await listHistoricalAlarm({
      pageNum: historyQuery.pageNum,
      pageSize: historyQuery.pageSize,
      address: historyQuery.address,
      typeName: historyQuery.typeName,
      category: '',
      startTime: historyDateRange.value?.[0] || '',
      endTime: historyDateRange.value?.[1] || '',
    })
    const { items, total: totalCount } = res.data || {}
    historyData.value = (items || []).map((item: any) => ({
      alarmType: item.alarmType,
      alarmContent: item.devAddress,
      devName: item.devLabel,
      alarmTime: item.alarmBeginDT || item.valueUpdateDT,
      severity: item.severity,
    }))
    historyTotal.value = totalCount || 0
  } catch (e) {
    console.error('获取历史报警失败', e)
  } finally {
    historyLoading.value = false
  }
}

function handleHistoryPagination(p: { page: number; limit: number }) {
  historyQuery.pageNum = p.page
  historyQuery.pageSize = p.limit
  searchHistory()
}

onMounted(() => {
  getData()
  timer = setInterval(getData, 10000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.alarm-panel {
  background: rgba(20, 29, 47, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(239, 68, 68, 0.12);
  border-top-color: var(--color-danger);
  border-top-width: 2px;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.alarm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(239, 68, 68, 0.15);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.015) 60%, transparent 100%);
}

.alarm-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.alarm-bell {
  color: var(--color-danger);
  filter: drop-shadow(0 0 3px var(--color-danger-glow));
}

.alarm-count {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: var(--color-danger);
  padding: 0 7px;
  border-radius: 10px;
  line-height: 18px;
  min-width: 18px;
  text-align: center;
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
  animation: live-pulse 2s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* KPI 统计 */
/* 报警滚动区 */
.alarm-scroll {
  max-height: 340px;
  overflow-y: auto;
  flex: 1;
}

.alarm-scroll::-webkit-scrollbar {
  width: 3px;
}

.alarm-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 2px;
}

/* 报警条目 */
.alarm-list {
  display: flex;
  flex-direction: column;
}

.alarm-item {
  display: flex;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  border-left: 3px solid rgba(239, 68, 68, 0.25);
  transition: all 0.2s ease;
  overflow: hidden;
}

.alarm-item:last-child {
  border-bottom: none;
}

.alarm-item:hover {
  background: rgba(239, 68, 68, 0.06);
  border-left-color: var(--color-danger);
}

/* 左侧 severity 色条 */
/* 报警主体 */
.alarm-body {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.alarm-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alarm-device {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-type-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.alarm-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alarm-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  font-family: var(--font-mono, monospace);
  background: rgba(148, 163, 184, 0.08);
  padding: 1px 8px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

.alarm-new {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.15);
  padding: 0 6px;
  border-radius: 3px;
  line-height: 16px;
  animation: new-blink 1.2s ease-in-out infinite;
}

@keyframes new-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 骨架 */
.alarm-skeleton {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-row {
  display: flex;
  gap: 12px;
}

.sk-line {
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg,
    rgba(148, 163, 184, 0.06) 25%,
    rgba(148, 163, 184, 0.12) 50%,
    rgba(148, 163, 184, 0.06) 75%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.5s ease-in-out infinite;
}

.sk-line.w-20 { width: 20%; }
.sk-line.w-30 { width: 30%; }
.sk-line.w-40 { width: 40%; }
.sk-line.w-80 { width: 80%; }

@keyframes sk-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.alarm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  color: var(--text-muted);
  font-size: 14px;
}

/* 进入动画 */
.alarm-slide-enter-active {
  transition: all 0.35s ease;
}

.alarm-slide-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

/* ===== 历史弹窗 ===== */
.history-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 10px;
}

.history-filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-filter-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.history-list {
  max-height: 460px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 8px;
  border-left-width: 3px;
  transition: background 0.15s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.015);
}

.history-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
  line-height: 1.5;
}

.history-item-body {
  flex: 1;
  min-width: 0;
}

.history-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.history-device {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: var(--font-mono, monospace);
}

.history-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.history-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
}

.history-footer {
  display: flex;
  justify-content: center;
  padding: 12px 0 0;
  margin-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}
</style>
