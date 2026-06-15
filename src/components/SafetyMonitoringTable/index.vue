<template>
  <div class="safety-monitor">
    <!-- 头部 -->
    <div class="monitor-header">
      <div class="monitor-title">
        <span class="live-indicator" :class="{ active: autoRefresh }"></span>
        <span style="font-weight: 600; font-size: 15px;">安全监控</span>
      </div>
      <div class="monitor-actions">
        <span class="monitor-count">{{ total }} 个监测点</span>
        <el-button type="primary" size="small" class="more-btn" @click="goToMore">
          查看更多 →
        </el-button>
        <el-tag v-if="loading" type="info" size="small" effect="dark">刷新中...</el-tag>
        <el-button text size="small" @click="toggleAutoRefresh">
          {{ autoRefresh ? '⏸ 暂停' : '▶ 自动刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 分类筛选指示 -->
    <div v-if="activeCategory" class="category-filter-bar">
      <span class="category-filter-label">分类筛选：</span>
      <span class="category-filter-tag">{{ activeCategory }}</span>
      <el-button text size="small" class="clear-filter-btn" @click="clearCategoryFilter">✕ 清除</el-button>
    </div>

    <!-- 监测点卡片网格 -->
    <div v-if="loading && tableData.length === 0" class="monitor-loading-wrap">
      <div class="loading-pulse"></div>
      <span style="color: var(--text-muted); font-size: 13px;">加载监测数据...</span>
    </div>
    <div v-else class="monitor-grid">
      <div v-for="(item, idx) in tableData" :key="idx" class="monitor-card"
        :class="{ 'is-alarm': item.alarmStatus === '报警', 'is-normal': item.alarmStatus !== '报警' }"
        @click="showDetail(item)">
        <div class="card-top">
          <span class="card-name text-ellipsis" :title="item.devName">{{ item.devName }}</span>
          <span v-if="item.alarmStatus === '报警'" class="alarm-badge pulse">报警</span>
        </div>
        <div class="card-value" :class="item.alarmStatus === '报警' ? 'text-danger' : 'text-success'">
          <span v-html="item.devValue"></span>
        </div>
        <div class="card-tags">
          <span class="card-tag" v-if="item.category">{{ item.category }}</span>
          <span class="card-tag" :class="item.devLabel.indexOf('F') !== -1 ? 'label-f' : 'label-normal'">{{
            item.devLabel }}</span>
        </div>
        <div class="card-overlay">
          <div class="card-overlay-btns">
            <el-button text size="small" @click.stop="showDetail(item)" class="overlay-btn">详情</el-button>
            <span class="overlay-divider">|</span>
            <el-button text size="small" @click.stop="showHistory(item)" class="overlay-btn">历史</el-button>
          </div>
        </div>
      </div>

      <div v-if="!loading && tableData.length === 0" class="monitor-empty">
        暂无数据
      </div>
    </div>
    <!-- 加载空占位 -->
    <div v-if="loading && tableData.length === 0" style="height: 200px;"></div>

    <!-- 分页 -->
    <div v-if="total > 0" class="monitor-pagination">
      <pagination :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize"
        @pagination="handlePagination" />
    </div>

  </div>

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" width="560px" top="8vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">监测点详情</div>
          <div class="dialog-header-sub">{{ currentRow?.devName || '' }}</div>
        </div>
      </div>
    </template>
    <div v-if="currentRow" class="dialog-scroll">
      <!-- 主数值区 -->
      <div class="detail-hero" :class="currentRow.alarmStatus === '报警' ? 'is-alarm' : 'is-normal'">
        <div class="detail-hero-status">
          <span class="status-dot" :class="currentRow.alarmStatus === '报警' ? 'alarm' : 'normal'"></span>
          {{ currentRow.alarmStatus === '报警' ? '报警中' : '正常' }}
        </div>
      </div>

      <!-- 基础信息 -->
      <div class="detail-section">
        <div class="detail-section__header">基础信息</div>
        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-field__label">点号</span>
            <span class="detail-field__value">{{ detailForm.devLabel || currentRow.devLabel }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">识别ID</span>
            <span class="detail-field__value">{{ detailForm.uniqueID || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">编号</span>
            <span class="detail-field__value">{{ detailForm.stationNo || detailForm.devNo || currentRow.substation ||
              '-'
            }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">是否在使用</span>
            <span class="detail-field__value">{{ detailForm.isUsed === true || detailForm.isUsed === 1 ? '是' : '否'
            }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">安装区域</span>
            <span class="detail-field__value">{{ detailForm.stationArea || detailForm.devArea || currentRow.area || '-'
            }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">安装位置</span>
            <span class="detail-field__value">{{ detailForm.stationAddress || detailForm.devAddress || currentRow.site
              ||
              '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 分站详情 -->
      <template v-if="isSubstationDetail">
        <div class="detail-section">
          <div class="detail-section__header">分站信息</div>
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-field__label">设备型号</span>
              <span class="detail-field__value">{{ detailForm.StationModel || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">当前状态</span>
              <span class="detail-field__value" v-html="detailForm.curState || '-'"></span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">设备状态</div>
          <div class="detail-grid">
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
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-field__label">监测参数</span>
              <span class="detail-field__value">{{ detailForm.detectionParam || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">是否模拟量</span>
              <span class="detail-field__value">{{ detailForm.isAnalog === true || detailForm.isAnalog === 1 ? '是' : '否'
              }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">最新值</span>
              <span class="detail-field__value">{{ detailForm.value ?? '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">类型</span>
              <span class="detail-field__value">{{ detailForm.devType || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">类别</span>
              <span class="detail-field__value">{{ detailForm.categoryName || currentRow.category || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">当前状态</span>
              <span class="detail-field__value">{{ detailForm.categoryStateText || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">当前状态</span>
              <span class="detail-field__value" v-html="detailForm.curState || '-'"></span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">标校时间</span>
              <span class="detail-field__value">{{ detailForm.calibrationDatetime ?
                formatTime(detailForm.calibrationDatetime) : '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">标校周期</span>
              <span class="detail-field__value">{{ detailForm.calibrationCycle || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">传感器电压</span>
              <span class="detail-field__value">{{ detailForm.voltage || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">设备状态</div>
          <div class="detail-grid">
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
          <div class="detail-grid">
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
          <div class="detail-grid">
            <div class="detail-field"><span class="detail-field__label">单位</span><span class="detail-field__value">{{
              detailForm.unit || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">量程</span><span class="detail-field__value">{{
              detailForm.range || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">标记高报警</span><span class="detail-field__value">{{
              detailForm.alarmMarkHigh === true || detailForm.alarmMarkHigh === 1 ? '是' : '否' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">标记低报警</span><span class="detail-field__value">{{
              detailForm.alarmMarkLow === true || detailForm.alarmMarkLow === 1 ? '是' : '否' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">高报警限值</span><span class="detail-field__value">{{
              detailForm.highAlarm ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">低报警限值</span><span class="detail-field__value">{{
              detailForm.LowAlarm ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">高报警恢复值</span><span
                class="detail-field__value">{{ detailForm.highAlarmRestore ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">低报警恢复值</span><span
                class="detail-field__value">{{ detailForm.LowAlarmRestore ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">下限预警</span><span class="detail-field__value">{{
              detailForm.lowEarlyAlarm ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">上限预警</span><span class="detail-field__value">{{
              detailForm.highEarlyAlarm ?? '-' }}</span></div>
          </div>
        </div>
      </template>

      <!-- 时间属性 -->
      <div class="detail-section">
        <div class="detail-section__header">时间属性</div>
        <div class="detail-grid">
          <div class="detail-field"><span class="detail-field__label">定义时间</span><span class="detail-field__value">{{
            detailForm.devDefineDT ? formatTime(detailForm.devDefineDT) : '-' }}</span></div>
          <div class="detail-field"><span class="detail-field__label">编辑时间</span><span class="detail-field__value">{{
            detailForm.devUpdateDT ? formatTime(detailForm.devUpdateDT) : '-' }}</span></div>
          <div class="detail-field"><span class="detail-field__label">{{ isSubstationDetail ? '状态变更时间' : '值变更时间'
          }}</span><span class="detail-field__value">{{ detailForm.valueUpdateDT ?
                formatTime(detailForm.valueUpdateDT)
                : '-' }}</span></div>
          <div class="detail-field"><span class="detail-field__label">最后更新时间</span><span class="detail-field__value">{{
            detailForm.updateDT ? formatTime(detailForm.updateDT) : '-' }}</span></div>
        </div>
      </div>

      <!-- 历史趋势入口 -->
      <div class="detail-section detail-section--action" @click="showHistory(currentRow)">
        <div class="detail-section__header" style="border: none; margin: 0; padding: 0;">
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
      </div>
    </div>
  </el-dialog>

  <!-- 历史趋势弹窗 -->
  <el-dialog v-model="historyVisible" width="820px" top="5vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-header-icon" style="color: var(--color-primary);">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <div class="dialog-header-title">历史趋势</div>
          <div class="dialog-header-sub">{{ currentRow?.devName || '' }} — {{ currentRow?.devLabel || '' }}</div>
        </div>
      </div>
    </template>
    <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 520px; border: none; border-radius: 8px;" />
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringTable' })

import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  listSafetyMonitoring,
  substationSelect,
  typeSelect,
  categorySelect,
  areaSelect,
  siteSelect,
  substationInfo,
  monitoringPointInfo,
  getKpiData,
} from '@/api/system/safetyMonitoring'

const emit = defineEmits<{
  'update:total': [value: Record<string, any>]
}>()

const props = withDefaults(defineProps<{
  maxHeight?: number
  filterCategory?: string
}>(), {
  maxHeight: undefined,
  filterCategory: '',
})

const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const statisticsHtml = ref('')
const currentRow = ref<any>(null)
const detailForm = ref<any>({})
const isSubstationDetail = ref(false)

const substationOptions = ref<any[]>([])
const typeOptions = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const areaOptions = ref<any[]>([])
const siteOptions = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  isCallThePolice: '',
  substation: '',
  type: '',
  category: [] as string[],
  area: '',
  site: '',
})

const detailVisible = ref(false)
const historyVisible = ref(false)
const historySrc = ref('')
const activeCategory = ref('')
const autoRefresh = ref(true)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const router = useRouter()

function goToMore() {
  router.push('/safetyMonitoringMore')
}

// 监听统计图分类点击
watch(() => props.filterCategory, (val) => {
  if (val && val !== activeCategory.value) {
    activeCategory.value = val
    queryParams.category = [val]
    queryParams.pageNum = 1
    getData()
  }
})

function clearCategoryFilter() {
  activeCategory.value = ''
  queryParams.category = []
  queryParams.pageNum = 1
  getData()
}

async function getData() {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      isCallThePolice: queryParams.isCallThePolice,
      substation: queryParams.substation,
      type: queryParams.type,
      category: queryParams.category,
      area: queryParams.area,
      site: queryParams.site,
    }
    const res = await listSafetyMonitoring(params)
    const { items, total: totalCount, statistics } = res.data || {}
    tableData.value = (items || []).map((item: any) => ({
      devName: item.devAddress,
      devValue: item.detectionVal,
      devStatus: item.statusTxt,
      state: item.state,
      alarmStatus: item.alarmType == 1 || item.alarmType === '1' || item.statusTxt === '报警' || item.state === '报警' ? '报警' : '',
      substation: item.stationNo,
      category: item.categoryName,
      area: item.devArea,
      site: item.devAddress,
      alarmThreshold: item.maxVal,
      devLabel: item.devLabel,
      valueUpdateDT: item.valueUpdateDT,
      name: item.name,
    }))
    total.value = totalCount || 0
    statisticsHtml.value = statistics || ''
    const alarms = tableData.value.filter((d: any) =>
      d.alarmStatus === '报警' || d.state === '报警'
    ).length
    let kpiAll: Record<string, any> = { total: total.value }
    try {
      const kpiRes = await getKpiData()
      console.log('KPI 8453 raw:', kpiRes)
      const raw = kpiRes.data || kpiRes || {}
      // API 返回 data 为数组，取第一个元素
      const kd = Array.isArray(raw) ? raw[0] || {} : raw
      kpiAll = { total: kd.total ?? total.value, ...kd }
    } catch (e) { console.warn('KPI 8453 err:', e) }
    emit('update:total', kpiAll)
  } catch (e) {
    console.error('获取安全监测数据失败', e)
  } finally {
    loading.value = false
  }
}

async function getSelectOptions() {
  try {
    const [subRes, typeRes, catRes, areaRes, siteRes] = await Promise.all([
      substationSelect(),
      typeSelect(),
      categorySelect(),
      areaSelect(),
      siteSelect(),
    ])
    substationOptions.value = subRes.data || []
    typeOptions.value = typeRes.data || []
    categoryOptions.value = catRes.data || []
    areaOptions.value = areaRes.data || []
    siteOptions.value = siteRes.data || []
  } catch (e) {
    console.error('获取筛选选项失败', e)
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getData()
}

function resetQuery() {
  queryParams.isCallThePolice = ''
  queryParams.substation = ''
  queryParams.type = ''
  queryParams.category = []
  queryParams.area = ''
  queryParams.site = ''
  queryParams.pageNum = 1
  getData()
}

function handlePagination(p: { page: number; limit: number }) {
  queryParams.pageNum = p.page
  queryParams.pageSize = p.limit
  getData()
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshTimer = setInterval(getData, 10000)
  } else if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function formatTime(t: string | number | undefined | null): string {
  if (!t) return '-'
  try {
    return new Date(t).toLocaleString('zh-CN', { hour12: false })
  } catch { return String(t) }
}

function showDetail(row: any) {
  currentRow.value = row
  detailVisible.value = true
  const isF = row.devLabel?.indexOf('F') !== -1
  isSubstationDetail.value = isF
  const api = isF ? substationInfo : monitoringPointInfo
  api(row.devLabel).then((res: any) => {
    detailForm.value = (res.data || [])[0] || {}
  }).catch(() => {
    detailForm.value = {}
  })
}

function showHistory(row: any) {
  currentRow.value = row
  // 匹配参考项目：使用 devLabel 作为查询参数，附加暗色主题
  const name = row.name
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(name)}&themes=blue_black`
  historyVisible.value = true
}

onMounted(() => {
  getSelectOptions()
  getData()
  refreshTimer = setInterval(getData, 10000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.safety-monitor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(20, 29, 47, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* 头部 */
.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.3s;
}

.live-indicator.active {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success-glow);
  animation: live-pulse 2s ease-in-out infinite;
}

@keyframes live-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.monitor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.monitor-count {
  font-size: 12px;
  color: var(--text-muted);
}

.more-btn {
  font-weight: 500;
}

/* 筛选区 */
.monitor-filters {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color-light);
  background: rgba(255, 255, 255, 0.015);
}

.monitor-filters :deep(.el-form-item) {
  margin-bottom: 0;
}

.monitor-filters :deep(.el-form-item__label) {
  font-size: 12px;
  color: var(--text-muted);
}

/* 卡片网格 — 可滚动 */
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  align-content: flex-start;
}

/* 单个监测卡片 — 毛玻璃 */
.monitor-card {
  background: rgba(20, 29, 47, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 左侧装饰条 */
.monitor-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 3px 3px 0;
  transition: all var(--transition-base);
}

/* 正常状态 */
.monitor-card.is-normal::before {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.monitor-card.is-normal:hover {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 12px rgba(34, 197, 94, 0.05);
  transform: translateY(-2px);
}

/* 报警状态 */
.monitor-card.is-alarm {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.04);
}

.monitor-card.is-alarm::before {
  background: var(--color-danger);
  box-shadow: 0 0 12px var(--color-danger-glow);
}

.monitor-card.is-alarm:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.1);
  transform: translateY(-2px);
}

/* 卡片顶部 */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  padding: 0 8px;
  border-radius: 4px;
  line-height: 22px;
  display: inline-block;
}



.card-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

/* 报警徽标 */
.alarm-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alarm-badge.pulse {
  animation: alarm-badge-pulse 1.5s ease-in-out infinite;
}

@keyframes alarm-badge-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
  }

  50% {
    box-shadow: 0 0 8px 2px rgba(239, 68, 68, 0.1);
  }
}

/* 数值 */
.card-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
  margin: 6px 0;
}

.card-value.text-success {
  color: var(--color-success);
}

.card-value.text-danger {
  color: var(--color-danger);
  text-shadow: 0 0 20px var(--color-danger-glow);
}

/* 标签行 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-tag {
  font-size: 13px;
  color: var(--text-muted);
  background: rgba(148, 163, 184, 0.1);
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.card-tag.label-f {
  background: var(--color-primary, #3b82f6);
  color: #fff;
}

.card-tag.label-normal {
  color: var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.1);
}

/* 悬浮毛玻璃浮层 — 从下到上渐变显示 */
.card-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: linear-gradient(to top, rgba(20, 29, 47, 0.85) 0%, rgba(20, 29, 47, 0.4) 60%, transparent 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  overflow: hidden;
  transition: height 0.25s ease;
}

.monitor-card:hover .card-overlay {
  height: 48px;
}

.card-overlay-btns {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease 0.08s;
}

.overlay-btn {
  color: #fff !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  background: transparent !important;
  border: none !important;
}

.overlay-btn:hover {
  color: var(--color-primary-light) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.overlay-divider {
  color: rgba(255, 255, 255, 0.15);
  font-size: 12px;
}

.monitor-card:hover .card-overlay-btns {
  opacity: 1;
  transform: translateY(0);
}

/* 分类筛选指示条 */
.category-filter-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.06);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  font-size: 13px;
}

.category-filter-label {
  color: var(--text-muted);
}

.category-filter-tag {
  color: var(--color-primary);
  font-weight: 500;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 10px;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.clear-filter-btn {
  margin-left: 4px;
  font-size: 12px;
}

/* 加载中 */
.monitor-loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 0;
  min-height: 200px;
  background: rgba(20, 29, 47, 0.3);
  border-radius: var(--radius-md);
  margin: 16px;
}

.loading-pulse {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.15);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.monitor-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--text-muted);
  font-size: 14px;
}

/* 分页 */
.monitor-pagination {
  display: flex;
  justify-content: center;
  padding: 8px 16px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

/* ── 详情弹窗 ── */
.glass-dialog :deep(.el-dialog) {
  border-radius: 12px;
  background: var(--bg-card, #1e293b);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.glass-dialog :deep(.el-dialog__header) {
  padding: 16px 20px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  margin: 0;
}

.glass-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 14px;
}

.dialog-header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog-header-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 可滚动内容区 */
.dialog-scroll {
  max-height: 65vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.dialog-scroll::-webkit-scrollbar {
  width: 4px;
}

.dialog-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 2px;
}

/* 主数值区 */
.detail-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 10px;
  background: rgba(20, 29, 47, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.1);
  flex-shrink: 0;
}

.detail-hero.is-alarm {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}

.detail-hero.is-normal {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.04);
}

.detail-hero-value {
  font-family: var(--font-mono, monospace);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.5px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-hero.is-alarm .detail-hero-value {
  color: var(--color-danger, #ef4444);
  text-shadow: 0 0 24px rgba(239, 68, 68, 0.25);
}

.detail-hero.is-normal .detail-hero-value {
  color: var(--color-success, #22c55e);
}

.detail-hero-value :deep(*) {
  font-family: var(--font-mono, monospace) !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: inherit !important;
  line-height: 1.4 !important;
}

.detail-hero-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.alarm {
  background: var(--color-danger, #ef4444);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: live-pulse 2s ease-in-out infinite;
}

.status-dot.normal {
  background: var(--color-success, #22c55e);
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.3);
}

/* ===== 分组卡片 ===== */
.detail-section {
  background: rgba(20, 29, 47, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.06);
  border-radius: 8px;
  padding: 12px 14px;
  flex-shrink: 0;
}

.detail-section__header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
  letter-spacing: 0.5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}

.detail-field {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 0;
  min-width: 0;
}

.detail-field__label {
  font-size: 11px;
  color: var(--text-muted, #64748b);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 70px;
}

.detail-field__value {
  font-size: 13px;
  color: var(--text-primary, #e2e8f0);
  font-weight: 500;
  word-break: break-all;
  min-width: 0;
}

.detail-section--action {
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.detail-section--action:hover {
  border-color: rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.04);
}

.history-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary, #3b82f6);
}

.history-trigger svg {
  flex-shrink: 0;
}
</style>
