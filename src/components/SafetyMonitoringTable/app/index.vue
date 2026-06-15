<template>
  <div class="app-safety-table">
    <!-- KPI 统计头部（动态渲染 API 返回字段） -->
    <div class="kpi-bar">
      <template v-for="(item, idx) in kpiList" :key="item.key">
        <div v-if="idx > 0" class="kpi-divider" />
        <div class="kpi-item">
          <span class="kpi-label">{{ item.label }}</span>
          <span class="kpi-value" :class="item.valueClass">{{ item.value ?? 0 }}</span>
        </div>
      </template>
      <button class="kpi-more" @click="goToMore">
        <span>更多</span>
        <van-icon name="arrow" />
      </button>
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
        <div v-for="(item, idx) in list" :key="item.id || idx" class="monitor-card"
          :class="{ 'is-alarm': item.alarmStatus === '报警' }" @click="showDetail(item)">
          <div class="monitor-card__left">
            <div class="monitor-card__dot" :class="item.alarmStatus === '报警' ? 'alarm' : 'normal'"></div>
          </div>
          <div class="monitor-card__body">
            <div class="monitor-card__row1">
              <span class="monitor-card__name">{{ item.devName }}</span>
              <span v-if="item.alarmStatus === '报警'" class="monitor-card__badge">
                <span class="badge-dot" />
                报警
              </span>
            </div>
            <div class="monitor-card__value" :class="item.alarmStatus === '报警' ? 'is-danger' : 'is-normal'">
              <span v-html="item.devValue"></span>
            </div>
            <div class="monitor-card__tags">
              <span class="monitor-card__tag">{{ item.category }}</span>
              <span class="monitor-card__tag"
                :class="item.devLabel?.indexOf('F') !== -1 ? 'label-f' : 'label-normal'">{{
                  item.devLabel }}</span>
              <span class="monitor-card__tag" v-if="item.area">{{ item.area }}</span>
            </div>
          </div>
          <div class="card-glow" :class="item.alarmStatus === '报警' ? 'alarm' : 'normal'" />
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 详情弹窗 -->
    <van-action-sheet v-model:show="detailVisible" title="监测点详情" :close-on-click-action="false" close-icon="close">
      <template v-if="detailItem.devName" class="detail-body">
        <!-- 主数值区 -->
        <div class="detail-hero" :class="detailItem.alarmStatus === '报警' ? 'is-alarm' : 'is-normal'">
          <div class="detail-hero__status">
            <span class="status-dot" :class="detailItem.alarmStatus === '报警' ? 'alarm' : 'normal'" />
            {{ detailItem.alarmStatus === '报警' ? '报警中' : '正常' }}
          </div>
        </div>

        <!-- 历史趋势快捷入口 -->
        <div class="detail-section detail-section--action" @click="openHistory(detailItem)">
          <div class="history-trigger">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>查看历史趋势</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              style="margin-left: auto;">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="detail-section__header">基础信息</div>
          <div class="detail-fields">
            <div class="detail-field"><span class="detail-field__label">点号</span><span class="detail-field__value">{{
              detailForm.devLabel || detailItem.devLabel }}</span></div>
            <div class="detail-field"><span class="detail-field__label">识别ID</span><span class="detail-field__value">{{
              detailForm.uniqueID || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">编号</span><span class="detail-field__value">{{
              detailForm.stationNo || detailForm.devNo || detailItem.substation || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">是否在使用</span><span class="detail-field__value">{{
              detailForm.isUsed === true || detailForm.isUsed === 1 ? '是' : '否' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">安装区域</span><span class="detail-field__value">{{
              detailForm.stationArea || detailForm.devArea || detailItem.area || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">安装位置</span><span class="detail-field__value">{{
              detailForm.stationAddress || detailForm.devAddress || detailItem.site || '-' }}</span></div>
          </div>
        </div>

        <!-- 分站详情 -->
        <template v-if="isSubstationDetail">
          <div class="detail-section">
            <div class="detail-section__header">分站信息</div>
            <div class="detail-fields">
              <div class="detail-field"><span class="detail-field__label">设备型号</span><span
                  class="detail-field__value">{{ detailForm.StationModel || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">当前状态</span><span class="detail-field__value"
                  v-html="detailForm.curState || '-'"></span></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-section__header">设备状态</div>
            <div class="detail-fields">
              <div class="detail-field"><span class="detail-field__label">正常状态</span><span class="detail-field__value"
                  v-html="detailForm.state1 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">异常状态</span><span class="detail-field__value"
                  v-html="detailForm.state2 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">调校</span><span class="detail-field__value"
                  v-html="detailForm.state3 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">分站故障</span><span class="detail-field__value"
                  v-html="detailForm.state4 || '-'"></span></div>
              <div class="detail-field" v-if="detailForm.stationModel"><span class="detail-field__label">电量</span><span
                  class="detail-field__value">{{ detailForm.stationModel.split(',')[1] || '-' }}</span></div>
              <div class="detail-field" v-if="detailForm.stationModel"><span class="detail-field__label">电压</span><span
                  class="detail-field__value">{{ detailForm.stationModel.split(',')[0] || '-' }}</span></div>
            </div>
          </div>
        </template>

        <!-- 监测点详情 -->
        <template v-else>
          <div class="detail-section">
            <div class="detail-section__header">监测点信息</div>
            <div class="detail-fields">
              <div class="detail-field"><span class="detail-field__label">监测参数</span><span
                  class="detail-field__value">{{ detailForm.detectionParam || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">是否模拟量</span><span
                  class="detail-field__value">{{ detailForm.isAnalog === true || detailForm.isAnalog === 1 ? '是' : '否'
                  }}</span></div>
              <div class="detail-field"><span class="detail-field__label">最新值</span><span class="detail-field__value">{{
                detailForm.value ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">类型</span><span class="detail-field__value">{{
                detailForm.devType || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">类别</span><span class="detail-field__value">{{
                detailForm.categoryName || detailItem.category || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">当前状态</span><span
                  class="detail-field__value">{{ detailForm.categoryStateText || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">当前状态</span><span class="detail-field__value"
                  v-html="detailForm.curState || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">标校时间</span><span
                  class="detail-field__value">{{ detailForm.calibrationDatetime ?
                    formatTime(detailForm.calibrationDatetime) : '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">标校周期</span><span
                  class="detail-field__value">{{ detailForm.calibrationCycle || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">传感器电压</span><span
                  class="detail-field__value">{{ detailForm.voltage || '-' }}</span></div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__header">设备状态</div>
            <div class="detail-fields">
              <div class="detail-field"><span class="detail-field__label">正常</span><span class="detail-field__value"
                  v-html="detailForm.state1 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">异常</span><span class="detail-field__value"
                  v-html="detailForm.state2 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">分站故障</span><span class="detail-field__value"
                  v-html="detailForm.state4 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">传感器故障</span><span class="detail-field__value"
                  v-html="detailForm.state5 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">超上限警报</span><span class="detail-field__value"
                  v-html="detailForm.state6 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">超下限警报</span><span class="detail-field__value"
                  v-html="detailForm.state7 || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">调校</span><span class="detail-field__value"
                  v-html="detailForm.state3 || '-'"></span></div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__header">【开关量】特有属性</div>
            <div class="detail-fields">
              <div class="detail-field"><span class="detail-field__label">开启值</span><span class="detail-field__value">{{
                detailForm.onValue ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">关闭值</span><span class="detail-field__value">{{
                detailForm.offValue ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">开启状态</span><span class="detail-field__value"
                  v-html="detailForm.onIcon || '-'"></span></div>
              <div class="detail-field"><span class="detail-field__label">关闭状态</span><span class="detail-field__value"
                  v-html="detailForm.offIcon || '-'"></span></div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__header">【模拟量】特有属性</div>
            <div class="detail-fields">
              <div class="detail-field"><span class="detail-field__label">单位</span><span class="detail-field__value">{{
                detailForm.unit || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">量程</span><span class="detail-field__value">{{
                detailForm.range || '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">标记高报警</span><span
                  class="detail-field__value">{{ detailForm.alarmMarkHigh === true || detailForm.alarmMarkHigh === 1 ?
                    '是' : '否' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">标记低报警</span><span
                  class="detail-field__value">{{ detailForm.alarmMarkLow === true || detailForm.alarmMarkLow === 1 ? '是'
                    : '否' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">高报警限值</span><span
                  class="detail-field__value">{{ detailForm.highAlarm ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">低报警限值</span><span
                  class="detail-field__value">{{ detailForm.LowAlarm ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">高报警恢复值</span><span
                  class="detail-field__value">{{ detailForm.highAlarmRestore ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">低报警恢复值</span><span
                  class="detail-field__value">{{ detailForm.LowAlarmRestore ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">下限预警</span><span
                  class="detail-field__value">{{ detailForm.lowEarlyAlarm ?? '-' }}</span></div>
              <div class="detail-field"><span class="detail-field__label">上限预警</span><span
                  class="detail-field__value">{{ detailForm.highEarlyAlarm ?? '-' }}</span></div>
            </div>
          </div>
        </template>

        <!-- 时间属性 -->
        <div class="detail-section">
          <div class="detail-section__header">时间属性</div>
          <div class="detail-fields">
            <div class="detail-field"><span class="detail-field__label">定义时间</span><span class="detail-field__value">{{
              detailForm.devDefineDT ? formatTime(detailForm.devDefineDT) : '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">编辑时间</span><span class="detail-field__value">{{
              detailForm.devUpdateDT ? formatTime(detailForm.devUpdateDT) : '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">{{ isSubstationDetail ? '状态变更时间' : '值变更时间'
            }}</span><span class="detail-field__value">{{ detailForm.valueUpdateDT ?
                  formatTime(detailForm.valueUpdateDT)
                  : '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">最后更新时间</span><span
                class="detail-field__value">{{
                  detailForm.updateDT ? formatTime(detailForm.updateDT) : '-' }}</span></div>
          </div>
        </div>

      </template>
    </van-action-sheet>

    <!-- 历史趋势弹窗 -->
    <van-action-sheet v-model:show="historyVisible" title="历史趋势" close-icon="close">
      <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 65vh; border: none; border-radius: 0;" />
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSafetyMonitoringTable' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, closeToast } from 'vant'
import {
  listSafetyMonitoring,
  substationInfo,
  monitoringPointInfo,
  getKpiData,
} from '@/api/system/safetyMonitoring'
import { KPI_CONFIG, TOP_KPI_KEYS } from '@/constants/kpi'

const ALARM_TEXT = '报警'

const router = useRouter()

const list = ref<any[]>([])
const listLoading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const loading = ref(false)
const spinning = ref(false)
const pageNum = ref(1)
const kpiList = ref<{ key: string; label: string; value: number; valueClass?: string }[]>([])
const detailVisible = ref(false)
const detailItem = ref<any>({})
const detailForm = ref<any>({})
const isSubstationDetail = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

function isAlarm(item: any) {
  return item.alarmType == 1 || item.state === ALARM_TEXT || item.statusTxt === ALARM_TEXT
}

function goToMore() {
  router.push('/appSafetyMonitoringMore')
}

async function loadKpi() {
  try {
    const kpiRes = await getKpiData()
    const raw = kpiRes.data || kpiRes || {}
    const kd = Array.isArray(raw) ? raw[0] || {} : raw
    kpiList.value = TOP_KPI_KEYS
      .filter(k => k in kd)
      .map(k => ({ key: k, label: KPI_CONFIG[k].label, value: kd[k] ?? 0, valueClass: KPI_CONFIG[k].valueClass }))
  } catch (e) { console.warn('KPI 8453 err:', e) }
}

async function fetchData(append: boolean) {
  if (!append) loading.value = true
  try {
    const res = await listSafetyMonitoring({ pageNum: pageNum.value, pageSize: 20 })
    const items = ((res.data || {}).items || []) as any[]
    const mapped = items.map((item: any) => ({
      devName: item.devAddress,
      devValue: item.detectionVal,
      devStatus: item.statusTxt,
      alarmStatus: isAlarm(item) ? ALARM_TEXT : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      alarmThreshold: item.maxVal,
      devLabel: item.devLabel,
      name: item.name,
      id: item.devLabel || item.id || Math.random(),
    }))
    if (append) {
      list.value.push(...mapped)
    } else {
      list.value = mapped
    }
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
  await Promise.all([fetchData(true), loadKpi()])
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
  Promise.all([fetchData(false), loadKpi()]).finally(() => closeToast())
}

function showDetail(item: any) {
  detailItem.value = item
  detailVisible.value = true
  // 异步加载详情
  const isF = item.devLabel?.indexOf('F') !== -1
  isSubstationDetail.value = isF
  const api = isF ? substationInfo : monitoringPointInfo
  api(item.devLabel).then((res: any) => {
    detailForm.value = (res.data || [])[0] || {}
  }).catch(() => {
    detailForm.value = {}
  })
}

const historyVisible = ref(false)
const historySrc = ref('')

function openHistory(item: any) {
  const name = item.name
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(name)}&themes=blue_black`
  detailVisible.value = false
  historyVisible.value = true
}

function formatTime(t: string | number | undefined | null): string {
  if (!t) return '-'
  try {
    return new Date(t).toLocaleString('zh-CN', { hour12: false })
  } catch { return String(t) }
}

onMounted(() => {
  onLoad()
  timer = setInterval(() => {
    pageNum.value = 1
    Promise.all([fetchData(false), loadKpi()])
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

.kpi-total {
  color: var(--color-primary);
}

.kpi-alarm {
  color: var(--color-danger);
}

.kpi-ok {
  color: var(--color-success);
}

.kpi-divider {
  width: 1px;
  height: 28px;
  background: var(--border-color);
}

.kpi-more {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding: 4px 8px;
  border: none;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 12px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.kpi-more:active {
  transform: scale(0.95);
  background: rgba(59, 130, 246, 0.2);
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

.kpi-refresh:active {
  transform: scale(0.92);
}

.kpi-refresh.spinning :deep(.van-icon) {
  animation: spin 0.8s linear infinite;
}

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

.sk-line {
  height: 12px;
  border-radius: 6px;
  background: var(--border-color);
}

.sk-line--50 {
  width: 50%;
}

.sk-badge {
  width: 40px;
  height: 18px;
  border-radius: 9px;
  background: var(--border-color);
  animation: sk-pulse 1.5s ease-in-out infinite;
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

/* 详情弹窗 */
.detail-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 10px;
  margin: 0 16px 8px;
}

.detail-hero.is-normal {
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.12);
}

.detail-hero.is-alarm {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.detail-hero__value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
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
  flex-shrink: 0;
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
  display: inline-block;
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

/* 分组卡片（移动端） */
.detail-section {
  margin: 0 16px 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color-light);
  border-radius: 8px;
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

/* 历史趋势入口 */
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

.history-trigger svg {
  flex-shrink: 0;
}
</style>
