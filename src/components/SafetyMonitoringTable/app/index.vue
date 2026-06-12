<template>
  <div class="app-safety-table">
    <!-- KPI 统计头部 -->
    <div class="kpi-bar">
      <div class="kpi-item">
        <span class="kpi-label">监测总数</span>
        <span class="kpi-value kpi-total">{{ totalCount }}</span>
      </div>
      <div class="kpi-divider" />
      <div class="kpi-item">
        <span class="kpi-label">报警</span>
        <span class="kpi-value kpi-alarm">{{ alarmCount }}</span>
      </div>
      <div class="kpi-divider" />
      <div class="kpi-item">
        <span class="kpi-label">正常</span>
        <span class="kpi-value kpi-ok">{{ totalCount - alarmCount }}</span>
      </div>
      <button class="kpi-refresh" :class="{ spinning }" @click="manualRefresh">
        <van-icon name="replay" />
      </button>
    </div>

    <!-- 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :head-height="56">
      <template #pulling="props">
        <div class="refresh-hint">下拉刷新监测数据</div>
      </template>
      <template #loosing>
        <div class="refresh-hint">释放立即刷新</div>
      </template>

      <!-- 首次加载骨架 -->
      <template v-if="loading && list.length === 0">
        <div v-for="n in 6" :key="n" class="sk-card">
          <div class="sk-card__top">
            <div class="sk-line sk-line--50" />
            <div class="sk-badge" />
          </div>
          <div class="sk-card__value" />
          <div class="sk-card__tags">
            <div class="sk-tag" />
            <div class="sk-tag" />
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else-if="!loading && list.length === 0" class="empty-state">
        <van-icon name="tv-o" size="48" :style="{ color: 'var(--text-muted)', opacity: 0.3 }" />
        <span class="empty-state__text">暂无监测数据</span>
      </div>

      <!-- 数据列表 -->
      <van-list v-else v-model:loading="listLoading" :finished="finished" finished-text="— 已加载全部 —" @load="onLoad">
        <div
          v-for="(item, idx) in list"
          :key="item.id || idx"
          class="monitor-card"
          :class="{ 'is-alarm': item.alarmStatus === '报警' }"
          @click="showDetail(item)"
        >
          <div class="monitor-card__top">
            <span class="monitor-card__name">{{ item.devName }}</span>
            <span v-if="item.alarmStatus === '报警'" class="monitor-card__badge">
              <span class="badge-dot" />
              报警
            </span>
          </div>
          <div class="monitor-card__value" :class="item.alarmStatus === '报警' ? 'is-danger' : 'is-normal'">
            {{ item.devValue }}
          </div>
          <div class="monitor-card__tags">
            <span class="monitor-card__tag">{{ item.category }}</span>
            <span class="monitor-card__tag" v-if="item.substation">分站#{{ item.substation }}</span>
            <span class="monitor-card__tag" v-if="item.area">{{ item.area }}</span>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 详情弹窗 -->
    <van-action-sheet v-model:show="detailVisible" title="监测点详情" :close-on-click-action="true">
      <div v-if="detailItem.devName" class="detail-body">
        <div class="detail-hero" :class="detailItem.alarmStatus === '报警' ? 'is-alarm' : 'is-normal'">
          <div class="detail-hero__value">{{ detailItem.devValue }}</div>
          <div class="detail-hero__status">
            <span class="status-dot" :class="detailItem.alarmStatus === '报警' ? 'alarm' : 'normal'" />
            {{ detailItem.alarmStatus === '报警' ? '报警中' : '正常' }}
          </div>
        </div>
        <div class="detail-fields">
          <div class="detail-field">
            <span class="detail-field__label">分站</span>
            <span class="detail-field__value">{{ detailItem.substation }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">类别</span>
            <span class="detail-field__value">{{ detailItem.category }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">区域</span>
            <span class="detail-field__value">{{ detailItem.area }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">地点</span>
            <span class="detail-field__value">{{ detailItem.site }}</span>
          </div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSafetyMonitoringTable' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { listSafetyMonitoring } from '@/api/system/safetyMonitoring'

const list = ref<any[]>([])
const listLoading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const loading = ref(false)
const spinning = ref(false)
const pageNum = ref(1)
const totalCount = ref(0)
const alarmCount = ref(0)
const detailVisible = ref(false)
const detailItem = ref<any>({})

let timer: ReturnType<typeof setInterval> | null = null

async function fetchData(append: boolean) {
  if (!append) loading.value = true
  try {
    const res = await listSafetyMonitoring({ pageNum: pageNum.value, pageSize: 20 })
    const data = res.data || {}
    const items = (data.items || []) as any[]
    const mapped = items.map((item: any) => ({
      devName: item.devAddress || item.devName || '',
      devValue: item.value || item.devValue || '--',
      devStatus: item.statusTxt || item.devStatus || '',
      alarmStatus: item.alarmType === 1 || item.alarmStatus === '报警' ? '报警' : '',
      substation: item.stationNo || item.substation || '',
      category: item.categoryName || item.category || '',
      area: item.devArea || item.area || '',
      site: item.devAddress || item.site || '',
      id: item.devLabel || item.id || Math.random(),
    }))
    if (append) {
      list.value.push(...mapped)
    } else {
      list.value = mapped
    }
    totalCount.value = data.total || items.length
    alarmCount.value = mapped.filter((m: any) => m.alarmStatus === '报警').length
    pageNum.value++
    if (items.length < 20) finished.value = true
  } catch (e) {
    console.error('获取安全监测数据失败', e)
  } finally {
    loading.value = false
    listLoading.value = false
    refreshing.value = false
    spinning.value = false
  }
}

async function onLoad() {
  if (refreshing.value) {
    list.value = []
    pageNum.value = 1
    finished.value = false
    refreshing.value = false
  }
  listLoading.value = true
  await fetchData(true)
}

function onRefresh() {
  finished.value = false
  pageNum.value = 1
  list.value = []
  refreshing.value = true
  onLoad()
}

function manualRefresh() {
  spinning.value = true
  showToast({ message: '刷新中...', duration: 0 })
  finished.value = false
  pageNum.value = 1
  list.value = []
  fetchData(false).finally(() => showToast.clear())
}

function showDetail(item: any) {
  detailItem.value = item
  detailVisible.value = true
}

onMounted(() => {
  onLoad()
  timer = setInterval(() => {
    pageNum.value = 1
    fetchData(false)
  }, 30000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.app-safety-table {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* KPI 头部 */
.kpi-bar {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  margin-bottom: 12px;
}

.kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 2px;
}

.kpi-label {
  font-size: 11px;
  color: var(--text-muted);
}

.kpi-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
}

.kpi-total { color: var(--color-primary); }
.kpi-alarm { color: var(--color-danger); }
.kpi-ok { color: var(--color-success); }

.kpi-divider {
  width: 1px;
  height: 28px;
  background: var(--border-color);
}

.kpi-refresh {
  margin-left: 4px;
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

.kpi-refresh:active { transform: scale(0.92); }
.kpi-refresh.spinning :deep(.van-icon) { animation: spin 0.8s linear infinite; }

/* 下拉刷新提示 */
.refresh-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
}

/* 骨架 */
.sk-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 8px;
}

.sk-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.sk-card__value {
  height: 24px;
  width: 80px;
  border-radius: 6px;
  background: var(--border-color);
  margin-bottom: 10px;
  animation: sk-pulse 1.5s ease-in-out infinite;
}

.sk-card__tags {
  display: flex;
  gap: 6px;
}

.sk-tag {
  height: 18px;
  width: 50px;
  border-radius: 4px;
  background: var(--border-color);
  animation: sk-pulse 1.5s ease-in-out infinite;
}

.sk-line { height: 12px; border-radius: 6px; background: var(--border-color); }
.sk-line--50 { width: 50%; }

.sk-badge {
  width: 40px;
  height: 18px;
  border-radius: 9px;
  background: var(--border-color);
  animation: sk-pulse 1.5s ease-in-out infinite;
}

@keyframes sk-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
}

.empty-state__text {
  font-size: 14px;
  color: var(--text-muted);
}

/* 监测卡片 */
.monitor-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.monitor-card:active { transform: scale(0.99); }

.monitor-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  transition: all var(--transition-fast);
}

.monitor-card.is-alarm::before { background: var(--color-danger); box-shadow: 0 0 8px var(--color-danger-glow); }
.monitor-card:not(.is-alarm)::before { background: var(--color-success); box-shadow: 0 0 6px var(--color-success-glow); }

.monitor-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.monitor-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.monitor-card__badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  white-space: nowrap;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  animation: pulse-alarm 1.5s ease-in-out infinite;
}

.monitor-card__value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 6px 0;
  line-height: 1.2;
}

.monitor-card__value.is-normal { color: var(--color-success); }
.monitor-card__value.is-danger {
  color: var(--color-danger);
  text-shadow: 0 0 20px var(--color-danger-glow);
}

.monitor-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.monitor-card__tag {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(148, 163, 184, 0.1);
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 详情弹窗 */
.detail-body { padding: 0 16px 24px; }

.detail-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.detail-hero.is-normal { background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.12); }
.detail-hero.is-alarm { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15); }

.detail-hero__value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
}

.detail-hero.is-normal .detail-hero__value { color: var(--color-success); }
.detail-hero.is-alarm .detail-hero__value { color: var(--color-danger); text-shadow: 0 0 20px var(--color-danger-glow); }

.detail-hero__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.detail-hero.is-normal .detail-hero__status { color: var(--color-success); }
.detail-hero.is-alarm .detail-hero__status { color: var(--color-danger); }

.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.normal { background: var(--color-success); box-shadow: 0 0 6px var(--color-success-glow); }
.status-dot.alarm { background: var(--color-danger); box-shadow: 0 0 8px var(--color-danger-glow); animation: pulse-alarm 1.5s ease-in-out infinite; }

@keyframes pulse-alarm {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.3); }
}

.detail-fields { display: flex; flex-direction: column; gap: 8px; }

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color-light);
  border-radius: 8px;
}

.detail-field__label { font-size: 11px; color: var(--text-muted); font-weight: 500; }
.detail-field__value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
</style>
