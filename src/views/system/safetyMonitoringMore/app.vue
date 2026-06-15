<template>
  <div class="app-safety-more">
    <van-nav-bar title="安全监测详情" left-arrow @click-left="goBack" />

    <div ref="contentRef" class="app-safety-more__content" @scroll="onContentScroll">
      <!-- KPI 概览 -->
      <KpiSection :data="kpiData" :collapsible="true" :limit="0" />

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-search">
          <van-search v-model="queryParams.site" placeholder="输入地点关键词" shape="round" @search="handleQuery"
            @clear="handleQuery" />
        </div>
        <div class="filter-menus">
          <van-dropdown-menu active-color="#3b82f6">
            <van-dropdown-item v-model="queryParams.isCallThePolice" :options="alarmOptions" @change="handleQuery" />
            <van-dropdown-item v-model="queryParams.substation" :options="substationOptions" @change="handleQuery" />
            <van-dropdown-item v-model="queryParams.type" :options="typeOptions" @change="handleQuery" />
          </van-dropdown-menu>
        </div>
      </div>

      <!-- 数据列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="listLoading" :finished="finished" finished-text="— 已加载全部 —" @load="onLoad">
          <div v-for="(item, idx) in list" :key="item.devLabel || idx" class="monitor-card"
            :class="{ 'is-alarm': item.alarmStatus === '报警' }" @click="showDetail(item)">
            <div class="monitor-card__left">
              <div class="monitor-card__dot" :class="item.alarmStatus === '报警' ? 'alarm' : 'normal'" />
            </div>
            <div class="monitor-card__body">
              <div class="monitor-card__row1">
                <span class="monitor-card__name">{{ item.devName }}</span>
                <van-tag v-if="item.alarmStatus === '报警'" type="danger" size="medium">报警</van-tag>
              </div>
              <div class="monitor-card__value" :class="item.alarmStatus === '报警' ? 'is-danger' : 'is-normal'">
                <span v-html="item.devValue" />
              </div>
              <div class="monitor-card__tags">
                <span v-if="item.category" class="monitor-card__tag">{{ item.category }}</span>
                <span class="monitor-card__tag" :class="isSubstation(item) ? 'label-f' : 'label-normal'">
                  {{ item.devLabel }}
                </span>
                <span v-if="item.area" class="monitor-card__tag">{{ item.area }}</span>
              </div>
              <div class="monitor-card__time" @click.stop="showHistory(item)">
                <van-icon name="clock-o" />
                {{ formatTime(item.valueUpdateDT) }}
              </div>
            </div>
            <div class="card-glow" :class="item.alarmStatus === '报警' ? 'alarm' : 'normal'" />
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 返回顶部 -->
    <button v-show="showBackTop" type="button" class="back-to-top" @click="scrollToTop">
      <van-icon name="back-top" size="20" />
    </button>

    <!-- 详情弹窗 -->
    <van-action-sheet v-model:show="detailVisible" title="监测点详情" :close-on-click-action="false"
      close-icon="close">
      <div v-if="currentRow" class="detail-body">
        <div class="detail-hero" :class="currentRow.alarmStatus === '报警' ? 'is-alarm' : 'is-normal'">
          <div class="detail-hero__name">{{ currentRow.devName || currentRow.devLabel || '--' }}</div>
          <div class="detail-hero__value" v-html="currentRow.devValue || '--'" />
          <div class="detail-hero__status">
            <span class="status-dot" :class="currentRow.alarmStatus === '报警' ? 'alarm' : 'normal'" />
            {{ currentRow.alarmStatus === '报警' ? '报警中' : '运行正常' }}
          </div>
        </div>

        <div class="detail-section detail-section--action" @click="showHistory(currentRow)">
          <div class="history-trigger">
            <van-icon name="chart-trending-o" />
            <span>查看历史趋势</span>
            <van-icon name="arrow" style="margin-left: auto;" />
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">基础信息</div>
          <div class="detail-fields">
            <div class="detail-field">
              <span class="detail-field__label">点号</span>
              <span class="detail-field__value">{{ detailForm.devLabel || currentRow.devLabel || '--' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">监测参数</span>
              <span class="detail-field__value">{{ detailForm.detectionParam || '--' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">分站</span>
              <span class="detail-field__value">{{ detailForm.stationNo || currentRow.substation || '--' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">类别</span>
              <span class="detail-field__value">{{ detailForm.categoryName || currentRow.category || '--' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">区域</span>
              <span class="detail-field__value">{{ detailForm.devArea || currentRow.area || '--' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">位置</span>
              <span class="detail-field__value">{{ detailForm.devAddress || currentRow.site || '--' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">更新时间</span>
              <span class="detail-field__value">{{ formatTime(detailForm.valueUpdateDT || currentRow.valueUpdateDT) }}</span>
            </div>
          </div>
        </div>
      </div>
    </van-action-sheet>

    <!-- 历史趋势弹窗 -->
    <van-action-sheet v-model:show="historyVisible" title="历史趋势" close-icon="close">
      <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 65vh; border: none;" />
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSafetyMonitoringMore' })

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, closeToast } from 'vant'
import KpiSection from '@/components/KpiSection/index.vue'
import {
  listSafetyMonitoring,
  substationSelect,
  typeSelect,
  getKpiData,
  substationInfo,
  monitoringPointInfo,
} from '@/api/system/safetyMonitoring'

const router = useRouter()
const contentRef = ref<HTMLElement>()
const scrollY = ref(0)
const showBackTop = computed(() => scrollY.value > 300)

const list = ref<any[]>([])
const listLoading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const loading = ref(false)
const total = ref(0)

const kpiData = ref<Record<string, any>>({})

const currentRow = ref<any>(null)
const detailForm = ref<any>({})
const detailVisible = ref(false)
const historyVisible = ref(false)
const historySrc = ref('')

const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  isCallThePolice: '',
  substation: '',
  type: '',
  category: [] as string[],
  area: '',
  site: '',
})

const substationOptionsRaw = ref<any[]>([])
const typeOptionsRaw = ref<any[]>([])
const alarmOptions = [
  { text: '全部状态', value: '' },
  { text: '报警', value: '1' },
  { text: '正常', value: '0' },
]

const substationOptions = computed(() => [
  { text: '全部分站', value: '' },
  ...substationOptionsRaw.value.map(item => ({ text: item.txt, value: item.txt })),
])

const typeOptions = computed(() => [
  { text: '全部类型', value: '' },
  ...typeOptionsRaw.value.map(item => ({ text: item.txt, value: item.txt })),
])

function isSubstation(row: any) {
  return String(row.devLabel || '').includes('F')
}

function formatTime(t: string | number | undefined | null): string {
  if (!t) return '--'
  try {
    return new Date(t).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return String(t)
  }
}

async function loadKpi() {
  try {
    const res = await getKpiData()
    const raw = res.data || res || {}
    kpiData.value = Array.isArray(raw) ? raw[0] || {} : raw
  } catch (e) {
    console.warn('KPI 8453 err:', e)
  }
}

async function getSelectOptions() {
  try {
    const [subRes, typeRes] = await Promise.all([
      substationSelect(),
      typeSelect(),
    ])
    substationOptionsRaw.value = subRes.data || []
    typeOptionsRaw.value = typeRes.data || []
  } catch (e) {
    console.error('获取筛选选项失败', e)
  }
}

async function fetchData(append: boolean) {
  if (!append) loading.value = true
  try {
    const res = await listSafetyMonitoring(queryParams.value)
    const { items, total: totalCount } = res.data || {}
    const mapped = (items || []).map((item: any) => ({
      devName: item.devAddress,
      devValue: item.detectionVal,
      devStatus: item.statusTxt,
      alarmStatus: item.alarmType === 1 || item.statusTxt === '报警' ? '报警' : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      devLabel: item.devLabel,
      valueUpdateDT: item.valueUpdateDT,
      name: item.name,
    }))
    if (append) {
      list.value.push(...mapped)
    } else {
      list.value = mapped
    }
    total.value = totalCount || 0
    queryParams.value.pageNum++
    if (mapped.length < queryParams.value.pageSize) {
      finished.value = true
    }
  } catch (e) {
    console.error('获取监测数据失败', e)
  } finally {
    loading.value = false
    listLoading.value = false
    refreshing.value = false
  }
}

async function onLoad() {
  if (refreshing.value) {
    list.value = []
    queryParams.value.pageNum = 1
    finished.value = false
  }
  listLoading.value = true
  await Promise.all([fetchData(true), loadKpi()])
}

function onRefresh() {
  finished.value = false
  queryParams.value.pageNum = 1
  list.value = []
  refreshing.value = true
  onLoad()
}

function handleQuery() {
  finished.value = false
  queryParams.value.pageNum = 1
  list.value = []
  showToast({ message: '加载中...', duration: 0 })
  Promise.all([fetchData(false), loadKpi()]).finally(() => closeToast())
}

function showDetail(item: any) {
  currentRow.value = item
  detailVisible.value = true
  detailForm.value = {}
  const isF = isSubstation(item)
  const api = isF ? substationInfo : monitoringPointInfo
  api(item.devLabel).then((res: any) => {
    detailForm.value = (res.data || [])[0] || {}
  }).catch(() => {
    detailForm.value = {}
  })
}

function showHistory(item: any) {
  if (!item?.name) return
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(item.name)}&themes=blue_black`
  historyVisible.value = true
}

function goBack() {
  router.back()
}

function onContentScroll(e: Event) {
  scrollY.value = (e.target as HTMLElement)?.scrollTop || 0
}

function scrollToTop() {
  contentRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  getSelectOptions()
})
</script>

<style scoped>
.app-safety-more {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-safety-more__content {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
}

.back-to-top {
  position: fixed;
  right: 16px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
}

.back-to-top:active {
  transform: scale(0.92);
}

.filter-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.filter-search :deep(.van-search) {
  padding: 8px 12px;
  background: transparent;
}

.filter-search :deep(.van-search__content) {
  background: rgba(148, 163, 184, 0.08);
}

.filter-menus :deep(.van-dropdown-menu__bar) {
  background: transparent;
  box-shadow: none;
}

.filter-menus :deep(.van-dropdown-menu__item) {
  justify-content: center;
}

.filter-menus :deep(.van-dropdown-menu__title) {
  color: var(--text-secondary);
  font-size: 13px;
}

/* 监测卡片 */
.monitor-card {
  display: flex;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.monitor-card:active {
  transform: scale(0.99);
}

.monitor-card__left {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  flex-shrink: 0;
}

.monitor-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.monitor-card__dot.normal {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.monitor-card__dot.alarm {
  background: var(--color-danger);
  box-shadow: 0 0 10px var(--color-danger-glow);
  animation: pulse-alarm 1.5s ease-in-out infinite;
}

/* 报警卡片文字全部变红 */
.monitor-card.is-alarm .monitor-card__name,
.monitor-card.is-alarm .monitor-card__time,
.monitor-card.is-alarm .monitor-card__tag:not(.label-f):not(.label-normal) {
  color: var(--color-danger);
}

.monitor-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.monitor-card__row1 {
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

.monitor-card__value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 6px 0;
  line-height: 1.2;
}

.monitor-card__value.is-normal {
  color: var(--color-success);
}

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

.monitor-card__tag.label-f {
  background: var(--color-primary, #3b82f6);
  color: #fff;
}

.monitor-card__tag.label-normal {
  color: var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.1);
}

.monitor-card__time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 右上角光晕 */
.card-glow {
  position: absolute;
  top: -16px;
  right: -16px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.12;
  pointer-events: none;
  transition: opacity 0.25s ease;
  z-index: 0;
}

.card-glow.normal {
  background: var(--color-success);
}

.card-glow.alarm {
  background: var(--color-danger);
}

/* 详情弹窗 */
.detail-body {
  padding: 12px 16px 24px;
}

.detail-hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 10px;
}

.detail-hero.is-normal {
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.12);
}

.detail-hero.is-alarm {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.detail-hero__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.detail-hero__value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.detail-hero.is-normal .detail-hero__value {
  color: var(--color-success);
}

.detail-hero.is-alarm .detail-hero__value {
  color: var(--color-danger);
  text-shadow: 0 0 20px var(--color-danger-glow);
}

.detail-hero__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.detail-hero.is-normal .detail-hero__status {
  color: var(--color-success);
}

.detail-hero.is-alarm .detail-hero__status {
  color: var(--color-danger);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.normal {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.status-dot.alarm {
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger-glow);
  animation: pulse-alarm 1.5s ease-in-out infinite;
}

@keyframes pulse-alarm {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.3);
  }
}

.detail-section {
  margin-bottom: 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
}

.detail-section__header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border-color-light);
}

.detail-section--action {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.detail-section--action:active {
  opacity: 0.7;
  transform: scale(0.98);
}

.history-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
}

.detail-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-field {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.detail-field__label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 72px;
}

.detail-field__value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
}

:deep(.van-nav-bar) {
  background: var(--bg-card);
}

:deep(.van-nav-bar__title) {
  color: var(--text-primary);
}

:deep(.van-nav-bar .van-icon) {
  color: var(--text-secondary);
}

:deep(.van-action-sheet__header) {
  color: var(--text-primary);
  background: var(--bg-card);
}

:deep(.van-action-sheet__content) {
  background: var(--bg-primary);
}

:deep(.van-list__finished-text) {
  color: var(--text-muted);
}
</style>
