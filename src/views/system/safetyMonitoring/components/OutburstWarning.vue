<template>
  <Transition name="outburst-enter">
    <div v-if="hasOutburstRisk" class="outburst-warning" :class="`outburst-warning--${riskLevel}`">
      <div class="outburst-warning__icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div class="outburst-warning__body">
        <div class="outburst-warning__title">
          {{ riskTitle }}
          <span class="outburst-warning__badge">煤与瓦斯突出风险</span>
        </div>
        <div class="outburst-warning__reasons">
          <span v-for="(reason, i) in activeReasons" :key="i" class="outburst-warning__reason">
            {{ reason }}
          </span>
        </div>
        <div class="outburst-warning__actions">
          <span>断电范围: {{ cutoffRangeText }}</span>
          <button class="outburst-warning__btn" @click="$emit('acknowledge')">确认</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'OutburstWarning' })

import { computed } from 'vue'
import { ALARM_LEVELS } from '@/constants/kpi'

export interface OutburstCondition {
  /** Condition type */
  type: 'concentration_spike_fan_normal' | 'concentration_spike_wind_reversal' | 'multi_sensor_spike' | 'concentration_spike_both_airways'
  /** Human-readable description */
  description: string
  /** Is this condition currently active */
  active: boolean
}

const props = withDefaults(defineProps<{
  conditions?: OutburstCondition[]
  cutoffRange?: string
}>(), {
  conditions: () => [],
  cutoffRange: '',
})

defineEmits<{
  acknowledge: []
}>()

const activeConditions = computed(() => props.conditions.filter(c => c.active))
const activeReasons = computed(() => activeConditions.value.map(c => c.description))
const hasOutburstRisk = computed(() => activeConditions.value.length > 0)

const riskLevel = computed(() => {
  if (activeConditions.value.length >= 2) return 'critical'
  return 'warning'
})

const riskTitle = computed(() => {
  if (activeConditions.value.length >= 2) return '严重突出风险 - 立即撤人!'
  return '突出风险预警 - 注意监测'
})

const cutoffRangeText = computed(() => props.cutoffRange || '相关区域全部非本质安全型电气设备')
</script>

<style scoped>
.outburst-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid;
  flex-shrink: 0;
  margin: 0 12px;
}

.outburst-warning--warning {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}

.outburst-warning--critical {
  background: rgba(168, 85, 247, 0.08);
  border-color: rgba(168, 85, 247, 0.4);
  animation: outburst-flash 1s ease-in-out infinite;
}

.outburst-warning__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-danger);
  flex-shrink: 0;
}

.outburst-warning--critical .outburst-warning__icon {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.outburst-warning__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.outburst-warning__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 8px;
}

.outburst-warning--critical .outburst-warning__title {
  color: #e9d5ff;
}

.outburst-warning__badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
}

.outburst-warning__reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.outburst-warning__reason {
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(148, 163, 184, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.outburst-warning__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

.outburst-warning__btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--color-danger);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.outburst-warning__btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

/* transition */
.outburst-enter-enter-active {
  transition: all 0.35s ease;
}

.outburst-enter-leave-active {
  transition: all 0.25s ease;
}

.outburst-enter-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.outburst-enter-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 120px;
}

.outburst-enter-leave-to {
  opacity: 0;
  max-height: 0;
}

@keyframes outburst-flash {
  0%, 100% { border-color: rgba(168, 85, 247, 0.4); }
  50% { border-color: rgba(168, 85, 247, 0.1); }
}
</style>
