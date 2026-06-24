<template>
  <div class="grade-panel glass-panel">
    <!-- header: AQ6201-2019 §5.6.12.3 分级报警 -->
    <div class="grade-panel__header">
      <div class="grade-panel__title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>分级报警</span>
        <span class="grade-panel__count">{{ totalAlarms }}</span>
      </div>
      <!-- AQ6201-2019 §5.6.12.4: 逻辑报警 -->
      <span v-if="logicAlarmCount > 0" class="grade-panel__logic-badge">
        逻辑报警 {{ logicAlarmCount }}
      </span>
    </div>

    <!-- L4: 突出危险 -->
    <div v-if="alarms.l4.length > 0" class="grade-section grade-section--l4" :class="{ collapsed: collapsedL4 }">
      <div class="grade-section__header" @click="collapsedL4 = !collapsedL4">
        <span class="grade-section__dot grade-section__dot--l4" />
        <span class="grade-section__label">L4 突出危险</span>
        <span class="grade-section__count">{{ alarms.l4.length }}</span>
        <span class="grade-section__chevron">{{ collapsedL4 ? '▸' : '▾' }}</span>
      </div>
      <div v-show="!collapsedL4" class="grade-section__items">
        <div v-for="item in alarms.l4" :key="item._key" class="grade-item" @click="$emit('selectAlarm', item)">
          <span class="grade-item__name">{{ item.devName }}</span>
          <span class="grade-item__value">{{ formatValue(item.detectionValue, item.unit) }}</span>
          <span class="grade-item__area">{{ item.devArea }}</span>
        </div>
      </div>
    </div>

    <!-- L3: 紧急 -->
    <div v-if="alarms.l3.length > 0" class="grade-section grade-section--l3" :class="{ collapsed: collapsedL3 }">
      <div class="grade-section__header" @click="collapsedL3 = !collapsedL3">
        <span class="grade-section__dot grade-section__dot--l3" />
        <span class="grade-section__label">L3 紧急</span>
        <span class="grade-section__count">{{ alarms.l3.length }}</span>
        <span class="grade-section__chevron">{{ collapsedL3 ? '▸' : '▾' }}</span>
      </div>
      <div v-show="!collapsedL3" class="grade-section__items">
        <div v-for="item in alarms.l3" :key="item._key" class="grade-item" @click="$emit('selectAlarm', item)">
          <span class="grade-item__name">{{ item.devName }}</span>
          <span class="grade-item__value">{{ formatValue(item.detectionValue, item.unit) }}</span>
          <span class="grade-item__area">{{ item.devArea }}</span>
        </div>
      </div>
    </div>

    <!-- L2: 报警 -->
    <div v-if="alarms.l2.length > 0" class="grade-section grade-section--l2" :class="{ collapsed: collapsedL2 }">
      <div class="grade-section__header" @click="collapsedL2 = !collapsedL2">
        <span class="grade-section__dot grade-section__dot--l2" />
        <span class="grade-section__label">L2 报警</span>
        <span class="grade-section__count">{{ alarms.l2.length }}</span>
        <span class="grade-section__chevron">{{ collapsedL2 ? '▸' : '▾' }}</span>
      </div>
      <div v-show="!collapsedL2" class="grade-section__items">
        <div v-for="item in alarms.l2" :key="item._key" class="grade-item" @click="$emit('selectAlarm', item)">
          <span class="grade-item__name">{{ item.devName }}</span>
          <span class="grade-item__value">{{ formatValue(item.detectionValue, item.unit) }}</span>
          <span class="grade-item__area">{{ item.devArea }}</span>
        </div>
      </div>
    </div>

    <!-- L1: 预警 -->
    <div v-if="alarms.l1.length > 0" class="grade-section grade-section--l1" :class="{ collapsed: collapsedL1 }">
      <div class="grade-section__header" @click="collapsedL1 = !collapsedL1">
        <span class="grade-section__dot grade-section__dot--l1" />
        <span class="grade-section__label">L1 预警</span>
        <span class="grade-section__count">{{ alarms.l1.length }}</span>
        <span class="grade-section__chevron">{{ collapsedL1 ? '▸' : '▾' }}</span>
      </div>
      <div v-show="!collapsedL1" class="grade-section__items">
        <div v-for="item in alarms.l1" :key="item._key" class="grade-item" @click="$emit('selectAlarm', item)">
          <span class="grade-item__name">{{ item.devName }}</span>
          <span class="grade-item__value">{{ formatValue(item.detectionValue, item.unit) }}</span>
          <span class="grade-item__area">{{ item.devArea }}</span>
        </div>
      </div>
    </div>

    <!-- 逻辑报警摘要: AQ6201-2019 §5.6.12.4 -->
    <div v-if="logicAlarms.length > 0" class="grade-section grade-section--logic">
      <div class="grade-section__header" @click="collapsedLogic = !collapsedLogic">
        <span class="grade-section__dot grade-section__dot--logic" />
        <span class="grade-section__label">逻辑报警</span>
        <span class="grade-section__count">{{ logicAlarms.length }}</span>
        <span class="grade-section__chevron">{{ collapsedLogic ? '▸' : '▾' }}</span>
      </div>
      <div v-show="!collapsedLogic" class="grade-section__items">
        <div v-for="(alarm, i) in logicAlarms" :key="i" class="grade-item grade-item--logic">
          <span class="grade-item__desc">{{ alarm.description }}</span>
        </div>
      </div>
    </div>

    <!-- empty -->
    <div v-if="totalAlarms === 0 && logicAlarmCount === 0" class="grade-panel__empty">
      系统运行正常，无报警
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'GradeAlarmPanel' })

import { ref, computed } from 'vue'

export interface GradeAlarmItem {
  _key: string
  devName: string
  detectionValue: number
  unit?: string
  devArea?: string
  alarmLevel: number
}

export interface LogicAlarmItem {
  description: string
  type: string
}

const props = withDefaults(defineProps<{
  alarms: {
    l1: GradeAlarmItem[]
    l2: GradeAlarmItem[]
    l3: GradeAlarmItem[]
    l4: GradeAlarmItem[]
  }
  logicAlarms?: LogicAlarmItem[]
}>(), {
  alarms: () => ({ l1: [], l2: [], l3: [], l4: [] }),
  logicAlarms: () => [],
})

defineEmits<{
  selectAlarm: [item: GradeAlarmItem]
}>()

const collapsedL1 = ref(true)   // 默认折叠
const collapsedL2 = ref(true)   // 默认折叠
const collapsedL3 = ref(false)  // 默认展开
const collapsedL4 = ref(false)  // 默认展开
const collapsedLogic = ref(true)

const totalAlarms = computed(() =>
  props.alarms.l1.length + props.alarms.l2.length + props.alarms.l3.length + props.alarms.l4.length
)

const logicAlarmCount = computed(() => props.logicAlarms.length)

function formatValue(val: number, unit?: string): string {
  if (val == null || Number.isNaN(val)) return '-'
  return `${val.toFixed(2)}${unit || ''}`
}
</script>

<style scoped>
.grade-panel {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  overflow: hidden;
}

.grade-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 6px;
}

.grade-panel__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.grade-panel__count {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: var(--color-danger);
  padding: 0 6px;
  border-radius: 8px;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
}

.grade-panel__logic-badge {
  font-size: 10px;
  font-weight: 600;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
  padding: 1px 8px;
  border-radius: 6px;
  border: 1px solid rgba(168, 85, 247, 0.15);
}

/* grade section */
.grade-section {
  margin-top: 2px;
  border-radius: 6px;
  overflow: hidden;
}

.grade-section--l4 { background: rgba(168, 85, 247, 0.05); border-left: 2px solid rgba(168, 85, 247, 0.3); }
.grade-section--l3 { background: rgba(249, 115, 22, 0.04); border-left: 2px solid rgba(249, 115, 22, 0.2); }
.grade-section--l2 { background: rgba(239, 68, 68, 0.03); border-left: 2px solid rgba(239, 68, 68, 0.15); }
.grade-section--l1 { background: rgba(234, 179, 8, 0.03); border-left: 2px solid rgba(234, 179, 8, 0.15); }
.grade-section--logic { background: rgba(168, 85, 247, 0.03); border-left: 2px solid rgba(168, 85, 247, 0.15); }

.grade-section__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.grade-section__header:hover {
  background: rgba(148, 163, 184, 0.04);
}

.grade-section__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.grade-section__dot--l1 { background: var(--color-warning); }
.grade-section__dot--l2 { background: var(--color-danger); box-shadow: 0 0 4px var(--color-danger-glow); }
.grade-section__dot--l3 { background: #f97316; box-shadow: 0 0 6px rgba(249,115,22,0.4); }
.grade-section__dot--l4 { background: #a855f7; box-shadow: 0 0 8px rgba(168,85,247,0.5); animation: l4-dot-pulse 1s ease-in-out infinite; }
.grade-section__dot--logic { background: #c084fc; }

@keyframes l4-dot-pulse {
  0%, 100% { box-shadow: 0 0 4px rgba(168,85,247,0.3); }
  50% { box-shadow: 0 0 12px rgba(168,85,247,0.6); }
}

.grade-section__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.grade-section__count {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}

.grade-section__chevron {
  font-size: 10px;
  color: var(--text-muted);
}

.grade-section__items {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 8px 4px;
}

.grade-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.grade-item:hover {
  background: rgba(148, 163, 184, 0.06);
}

.grade-item__name {
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grade-item__value {
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  color: var(--text-primary);
}

.grade-item__area {
  font-size: 10px;
  color: var(--text-muted);
}

.grade-item__desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.grade-item--logic {
  cursor: default;
}

.grade-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
