<template>
  <div class="alarm-panel">
    <!-- 头部 -->
    <div class="alarm-header">
      <div class="alarm-title">
        <svg class="alarm-bell" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span style="font-weight: 600; font-size: 15px;">实时报警</span>
        <span v-if="alarmData.length" class="alarm-badge-count">{{ alarmData.length }}</span>
      </div>
      <el-button text size="small" @click="handleMore" style="color: var(--color-primary); font-weight: 500; font-size: 12px;">查看全部 →</el-button>
    </div>

    <!-- 报警列表 -->
    <div class="alarm-scroll">
      <!-- 首次加载骨架 -->
      <template v-if="loading && alarmData.length === 0">
        <div v-for="n in 3" :key="'s' + n" class="alarm-skeleton">
          <div class="sk-line w-40"></div>
          <div class="sk-line w-90"></div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="!loading && alarmData.length === 0" class="alarm-empty">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-success); opacity: 0.5;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>系统运行正常，无报警</span>
      </div>

      <!-- 报警条目 -->
      <TransitionGroup name="alarm-slide" tag="div" class="alarm-list">
        <div v-for="(item, idx) in alarmData" :key="item.devName + item.alarmTime" class="alarm-item">
          <div class="alarm-glow-bar">
            <div class="alarm-glow-inner"></div>
          </div>
          <div class="alarm-body">
            <div class="alarm-top">
              <span class="alarm-device">{{ item.devName }}</span>
              <span class="alarm-type-tag">{{ item.alarmType }}</span>
            </div>
            <div class="alarm-location">{{ item.alarmContent }}</div>
            <div class="alarm-footer">
              <span class="alarm-time">{{ formatTime(item.alarmTime) }}</span>
              <span class="alarm-new" v-if="idx === 0">NEW</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 查看更多弹窗 -->
  </div>

  <!-- 报警记录弹窗 -->
  <el-dialog v-model="moreVisible" width="820px" top="5vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon" style="color: var(--color-danger); background: rgba(239,68,68,0.1);">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">报警记录</div>
          <div class="dialog-header-sub">历史报警查询与统计</div>
        </div>
      </div>
    </template>

    <!-- 筛选栏 -->
    <div class="alarm-filter-bar">
      <div class="alarm-filter-row">
        <div class="alarm-filter-item">
          <span class="alarm-filter-label">地点</span>
          <el-input v-model="historyQuery.address" placeholder="输入地点" clearable style="width: 140px" size="small" />
        </div>
        <div class="alarm-filter-item">
          <span class="alarm-filter-label">类型</span>
          <el-select v-model="historyQuery.typeName" placeholder="全部" clearable style="width: 110px" size="small">
            <el-option v-for="item in historyTypeOptions" :key="item.txt" :label="item.txt" :value="item.txt" />
          </el-select>
        </div>
        <div class="alarm-filter-item">
          <span class="alarm-filter-label">时间</span>
          <el-date-picker v-model="historyDateRange" type="datetimerange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss" style="width: 280px" size="small" />
        </div>
        <el-button type="primary" size="small" @click="searchHistory" style="margin-top: 18px;">查询</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="alarm-list-wrap">
      <div v-for="(item, idx) in historyData" :key="idx" class="alarm-record" :class="item.severity === '1' ? 'is-severe' : 'is-normal'">
        <div class="alarm-record-left">
          <div class="alarm-record-dot" :class="item.severity === '1' ? 'severe' : 'normal'"></div>
          <span class="alarm-record-time">{{ item.alarmTime }}</span>
        </div>
        <div class="alarm-record-body">
          <div class="alarm-record-top">
            <span class="alarm-record-name">{{ item.devName }}</span>
            <span class="alarm-record-severity" :class="item.severity === '1' ? 'severe' : 'normal'">
              {{ item.severity === '1' ? '严重' : '一般' }}
            </span>
          </div>
          <div class="alarm-record-desc">{{ item.alarmContent }}</div>
        </div>
      </div>
      <div v-if="historyData.length === 0" class="alarm-record-empty">无匹配记录</div>
    </div>

    <div class="alarm-record-footer">
      <pagination v-if="historyTotal > 0" :total="historyTotal" :page="historyQuery.pageNum"
        :limit="historyQuery.pageSize" @pagination="handleHistoryPagination" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'TimerAlarmTable' })

import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
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
  // "2026-05-30 17:51:13.000" → "17:51:13"
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
      alarmContent: item.devAddress,
      devName: item.devLabel,
      alarmTime: item.alarmBeginDT || item.valueUpdateDT,
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
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* 头部 */
.alarm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(239, 68, 68, 0.15);
  background: linear-gradient(135deg, rgba(239,68,68,0.04) 0%, transparent 50%);
}

.alarm-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alarm-bell {
  color: var(--color-danger);
  filter: drop-shadow(0 0 4px var(--color-danger-glow));
}

.alarm-badge-count {
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

/* 报警滚动区域 */
.alarm-scroll {
  max-height: 380px;
  overflow-y: auto;
}

.alarm-scroll::-webkit-scrollbar {
  width: 3px;
}

/* 报警条目 */
.alarm-list {
  display: flex;
  flex-direction: column;
}

.alarm-item {
  display: flex;
  gap: 0;
  min-height: 70px;
  border-bottom: 1px solid var(--border-color-light);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.alarm-item:last-child {
  border-bottom: none;
}

.alarm-item:hover {
  background: rgba(239, 68, 68, 0.04);
}

/* 左侧发光条 */
.alarm-glow-bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--color-danger);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alarm-glow-inner {
  position: absolute;
  width: 100%;
  height: 60%;
  background: var(--color-danger);
  filter: blur(6px);
  opacity: 0.7;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; height: 50%; }
  50% { opacity: 0.8; height: 70%; }
}

/* 报警主体 */
.alarm-body {
  flex: 1;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alarm-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alarm-device {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono);
  letter-spacing: 0.3px;
}

.alarm-type-tag {
  font-size: 11px;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid rgba(239, 68, 68, 0.15);
  white-space: nowrap;
}

.alarm-location {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alarm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alarm-time {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.alarm-new {
  font-size: 9px;
  font-weight: 700;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.15);
  padding: 1px 6px;
  border-radius: 3px;
  animation: new-blink 1.2s ease-in-out infinite;
}

@keyframes new-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 骨架 */
.alarm-skeleton {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-line {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg,
    var(--bg-card-hover) 25%,
    rgba(148, 163, 184, 0.1) 50%,
    var(--bg-card-hover) 75%
  );
  background-size: 200% 100%;
  animation: sk-shimmer 1.5s ease-in-out infinite;
}

.sk-line.w-40 { width: 40%; }
.sk-line.w-90 { width: 90%; }

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
  padding: 36px 16px;
  gap: 10px;
  color: var(--text-muted);
  font-size: 13px;
}

/* 进入动画 */
.alarm-slide-enter-active {
  transition: all 0.4s ease;
}

.alarm-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

/* 历史弹窗列表 */
/* ===== 报警记录弹窗 ===== */
.alarm-filter-bar {
  margin-bottom: 16px;
  background: rgba(255,255,255,0.015);
  border: 1px solid var(--border-color-light);
  border-radius: 10px;
  padding: 12px 16px;
}

.alarm-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.alarm-filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alarm-filter-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.alarm-list-wrap {
  max-height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alarm-record {
  display: flex;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border-color-light);
  border-radius: 8px;
  transition: all var(--transition-fast);
}

.alarm-record:hover {
  background: rgba(255,255,255,0.02);
  border-color: rgba(148,163,184,0.15);
}

.alarm-record.is-severe {
  border-left: 3px solid var(--color-danger);
}

.alarm-record.is-normal {
  border-left: 3px solid var(--color-warning);
}

.alarm-record-left {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-width: 150px;
  padding-top: 2px;
  flex-shrink: 0;
}

.alarm-record-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.alarm-record-dot.severe {
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger-glow);
}

.alarm-record-dot.normal {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning-glow);
}

.alarm-record-time {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  line-height: 1.5;
}

.alarm-record-body {
  flex: 1;
  min-width: 0;
}

.alarm-record-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.alarm-record-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.alarm-record-severity {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 8px;
  border-radius: 4px;
}

.alarm-record-severity.severe {
  background: rgba(239,68,68,0.1);
  color: var(--color-danger);
}

.alarm-record-severity.normal {
  background: rgba(245,158,11,0.1);
  color: var(--color-warning);
}

.alarm-record-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.alarm-record-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 13px;
}

.alarm-record-footer {
  display: flex;
  justify-content: center;
  padding: 12px 0 0;
  margin-top: 12px;
  border-top: 1px solid var(--border-color);
}
</style>
