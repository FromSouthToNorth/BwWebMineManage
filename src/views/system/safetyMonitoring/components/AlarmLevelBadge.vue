<template>
  <span class="alarm-level-badge" :class="[`alarm-level-badge--${levelConfig.color}`, `alarm-level-badge--anim-${levelConfig.animation}`]" :title="levelConfig.desc">
    <span class="alarm-level-badge__dot" />
    <span class="alarm-level-badge__label">{{ levelConfig.shortLabel }}</span>
    <span v-if="showLevel" class="alarm-level-badge__level">Lv{{ levelConfig.level }}</span>
  </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'AlarmLevelBadge' })

import { computed } from 'vue'
import { ALARM_LEVELS, type AlarmLevel } from '@/constants/kpi'

const props = withDefaults(defineProps<{
  level?: number
  showLevel?: boolean
}>(), {
  level: 0,
  showLevel: false,
})

const levelConfig = computed<AlarmLevel>(() => {
  const key = `LEVEL_${props.level}` as keyof typeof ALARM_LEVELS
  return ALARM_LEVELS[key] ?? ALARM_LEVELS.LEVEL_0
})
</script>

<style scoped>
.alarm-level-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
  user-select: none;
}

/* 正常 */
.alarm-level-badge--success {
  background: rgba(34, 197, 94, 0.12);
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

/* 预警 */
.alarm-level-badge--warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* 报警/紧急/突出 */
.alarm-level-badge--danger {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.alarm-level-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.alarm-level-badge__label {
  letter-spacing: 0.3px;
}

.alarm-level-badge__level {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  opacity: 0.8;
}

/* 动画 */
.alarm-level-badge--anim-pulse .alarm-level-badge__dot {
  animation: badge-pulse 2s ease-in-out infinite;
}

.alarm-level-badge--anim-flash {
  animation: badge-flash 1.2s ease-in-out infinite;
}

.alarm-level-badge--anim-flash .alarm-level-badge__dot {
  animation: badge-pulse 1s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px currentColor; }
  50% { opacity: 0.3; box-shadow: 0 0 8px currentColor; }
}

@keyframes badge-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
