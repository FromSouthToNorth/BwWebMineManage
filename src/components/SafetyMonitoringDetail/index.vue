<template>
  <!-- 详情弹窗 -->
  <el-dialog v-model="visible" width="560px" top="8vh" class="glass-dialog" destroy-on-close>
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
          <div class="dialog-header-sub">{{ currentRow?.site || currentRow?.devName || currentRow?.devLabel || '' }}</div>
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
            <span class="detail-field__value">{{ detailForm.devLabel || currentRow.devLabel || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">识别ID</span>
            <span class="detail-field__value">{{ detailForm.uniqueID || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">编号</span>
            <span class="detail-field__value">{{ detailForm.stationNo || detailForm.devNo || currentRow.substation || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">是否在使用</span>
            <span class="detail-field__value">{{ detailForm.isUsed === true || detailForm.isUsed === 1 ? '是' : '否' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">安装区域</span>
            <span class="detail-field__value">{{ detailForm.stationArea || detailForm.devArea || currentRow.area || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">安装位置</span>
            <span class="detail-field__value">{{ detailForm.stationAddress || detailForm.devAddress || currentRow.site || currentRow.devName || '-' }}</span>
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
            <div class="detail-field"><span class="detail-field__label">正常状态</span><span class="detail-field__value" v-html="detailForm.state1 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">异常状态</span><span class="detail-field__value" v-html="detailForm.state2 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">调校</span><span class="detail-field__value" v-html="detailForm.state3 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">分站故障</span><span class="detail-field__value" v-html="detailForm.state4 || '-'"></span></div>
            <div v-if="detailForm.stationModel" class="detail-field">
              <span class="detail-field__label">电量</span>
              <span class="detail-field__value">{{ detailForm.stationModel.split(',')[1] || '-' }}</span>
            </div>
            <div v-if="detailForm.stationModel" class="detail-field">
              <span class="detail-field__label">电压</span>
              <span class="detail-field__value">{{ detailForm.stationModel.split(',')[0] || '-' }}</span>
            </div>
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
              <span class="detail-field__value">{{ detailForm.detectionParam || currentRow.detectionParam || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">是否模拟量</span>
              <span class="detail-field__value">{{ detailForm.isAnalog === true || detailForm.isAnalog === 1 ? '是' : '否' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">最新值</span>
              <span class="detail-field__value">{{ detailForm.value ?? currentRow.detectionVal ?? currentRow.devValue ?? '-' }}</span>
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
              <span class="detail-field__value">{{ detailForm.categoryStateText || currentRow.statusTxt || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">当前状态</span>
              <span class="detail-field__value" v-html="detailForm.curState || '-'"></span>
            </div>
            <div class="detail-field">
              <span class="detail-field__label">标校时间</span>
              <span class="detail-field__value">{{ detailForm.calibrationDatetime ? formatTime(detailForm.calibrationDatetime) : '-' }}</span>
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
            <div class="detail-field"><span class="detail-field__label">正常</span><span class="detail-field__value" v-html="detailForm.state1 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">异常</span><span class="detail-field__value" v-html="detailForm.state2 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">分站故障</span><span class="detail-field__value" v-html="detailForm.state4 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">传感器故障</span><span class="detail-field__value" v-html="detailForm.state5 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">超上限警报</span><span class="detail-field__value" v-html="detailForm.state6 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">超下限警报</span><span class="detail-field__value" v-html="detailForm.state7 || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">调校</span><span class="detail-field__value" v-html="detailForm.state3 || '-'"></span></div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">【开关量】特有属性</div>
          <div class="detail-grid">
            <div class="detail-field"><span class="detail-field__label">开启值</span><span class="detail-field__value">{{ detailForm.onValue ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">关闭值</span><span class="detail-field__value">{{ detailForm.offValue ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">开启状态</span><span class="detail-field__value" v-html="detailForm.onIcon || '-'"></span></div>
            <div class="detail-field"><span class="detail-field__label">关闭状态</span><span class="detail-field__value" v-html="detailForm.offIcon || '-'"></span></div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__header">【模拟量】特有属性</div>
          <div class="detail-grid">
            <div class="detail-field"><span class="detail-field__label">单位</span><span class="detail-field__value">{{ detailForm.unit || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">量程</span><span class="detail-field__value">{{ detailForm.range || '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">标记高报警</span><span class="detail-field__value">{{ detailForm.alarmMarkHigh === true || detailForm.alarmMarkHigh === 1 ? '是' : '否' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">标记低报警</span><span class="detail-field__value">{{ detailForm.alarmMarkLow === true || detailForm.alarmMarkLow === 1 ? '是' : '否' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">高报警限值</span><span class="detail-field__value">{{ detailForm.highAlarm ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">低报警限值</span><span class="detail-field__value">{{ detailForm.LowAlarm ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">高报警恢复值</span><span class="detail-field__value">{{ detailForm.highAlarmRestore ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">低报警恢复值</span><span class="detail-field__value">{{ detailForm.LowAlarmRestore ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">下限预警</span><span class="detail-field__value">{{ detailForm.lowEarlyAlarm ?? '-' }}</span></div>
            <div class="detail-field"><span class="detail-field__label">上限预警</span><span class="detail-field__value">{{ detailForm.highEarlyAlarm ?? '-' }}</span></div>
          </div>
        </div>
      </template>

      <!-- 时间属性 -->
      <div class="detail-section">
        <div class="detail-section__header">时间属性</div>
        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-field__label">定义时间</span>
            <span class="detail-field__value">{{ detailForm.devDefineDT ? formatTime(detailForm.devDefineDT) : '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">编辑时间</span>
            <span class="detail-field__value">{{ detailForm.devUpdateDT ? formatTime(detailForm.devUpdateDT) : '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">{{ isSubstationDetail ? '状态变更时间' : '值变更时间' }}</span>
            <span class="detail-field__value">{{ detailForm.valueUpdateDT ? formatTime(detailForm.valueUpdateDT) : formatTime(currentRow.valueUpdateDT) || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-field__label">最后更新时间</span>
            <span class="detail-field__value">{{ detailForm.updateDT ? formatTime(detailForm.updateDT) : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 历史趋势入口 -->
      <div class="detail-section detail-section--action" @click="showHistory">
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
          <div class="dialog-header-sub">{{ currentRow?.site || currentRow?.devName || currentRow?.devLabel || '' }}</div>
        </div>
      </div>
    </template>
    <iframe v-if="historySrc" :src="historySrc" style="width: 100%; height: 520px; border: none; border-radius: 8px;" />
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringDetail' })

import { ref, computed, watch } from 'vue'
import { substationInfo, monitoringPointInfo } from '@/api/system/safetyMonitoring'

const props = defineProps<{
  modelValue: boolean
  row?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const currentRow = computed(() => props.row)
const detailForm = ref<any>({})
const isSubstationDetail = ref(false)
const historyVisible = ref(false)
const historySrc = ref('')

function isSubstation(row: any) {
  return String(row?.devLabel || '').includes('F')
}

function formatTime(t: string | number | undefined | null): string {
  if (!t) return '-'
  try {
    const d = new Date(t)
    if (Number.isNaN(d.getTime())) return String(t)
    return d.toLocaleString('zh-CN', { hour12: false })
  } catch {
    return String(t)
  }
}

function loadDetail() {
  if (!currentRow.value) return
  isSubstationDetail.value = isSubstation(currentRow.value)
  detailForm.value = {}
  const api = isSubstationDetail.value ? substationInfo : monitoringPointInfo
  api(currentRow.value.devLabel).then((res: any) => {
    detailForm.value = (res.data || [])[0] || {}
  }).catch(() => {
    detailForm.value = {}
  })
}

function showHistory() {
  if (!currentRow.value) return
  const name = currentRow.value.name || currentRow.value.devLabel || ''
  historySrc.value = `/DigitizingMine/Historical/HisIndex?name=${encodeURIComponent(name)}&themes=blue_black`
  historyVisible.value = true
}

watch(visible, (val) => {
  if (val) loadDetail()
})

defineExpose({ showHistory })
</script>

<style scoped>
/* 弹窗滚动区 */
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
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger-glow);
  animation: pulse-alarm 1.5s ease-in-out infinite;
}

.status-dot.normal {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

/* 详情分组卡片 */
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
  color: var(--text-secondary);
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
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 70px;
}

.detail-field__value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
  min-width: 0;
}

/* 历史趋势入口 */
.detail-section--action {
  cursor: pointer;
  transition: all 0.2s ease;
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
  color: var(--color-primary);
}

.history-trigger svg {
  flex-shrink: 0;
}

@keyframes pulse-alarm {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
