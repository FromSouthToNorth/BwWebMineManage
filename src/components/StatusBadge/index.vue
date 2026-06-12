<template>
  <span
    class="status-badge"
    :class="[
      `status-badge--${status}`,
      `status-badge--${variant}`,
      { 'status-badge--pulse': pulse && status === 'alarm' },
    ]"
  >
    <span class="status-badge__dot" />
    <span v-if="$slots.default || label" class="status-badge__label">
      <slot>{{ label }}</slot>
    </span>
  </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'StatusBadge' })

withDefaults(defineProps<{
  /** normal | warning | alarm | offline | info */
  status?: 'normal' | 'warning' | 'alarm' | 'offline' | 'info'
  /** dot | badge | text — 显示形态 */
  variant?: 'dot' | 'badge' | 'text'
  /** 标签文字 (仅 badge/text 模式) */
  label?: string
  /** 报警状态是否脉冲动画 */
  pulse?: boolean
}>(), {
  status: 'info',
  variant: 'dot',
  pulse: true,
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* 状态圆点 */
.status-badge__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

/* 标签文字 */
.status-badge__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* ===== 状态色 ===== */
.status-badge--normal .status-badge__dot {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}
.status-badge--normal .status-badge__label { color: var(--color-success); }

.status-badge--warning .status-badge__dot {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning-glow);
}
.status-badge--warning .status-badge__label { color: var(--color-warning); }

.status-badge--alarm .status-badge__dot {
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger-glow);
}
.status-badge--alarm .status-badge__label { color: var(--color-danger); }

.status-badge--offline .status-badge__dot {
  background: transparent;
  border: 2px solid var(--color-info);
  box-shadow: none;
}
.status-badge--offline .status-badge__label { color: var(--text-muted); }

.status-badge--info .status-badge__dot {
  background: var(--color-info);
  box-shadow: none;
}
.status-badge--info .status-badge__label { color: var(--text-secondary); }

/* ===== 显示形态 ===== */
.status-badge--dot .status-badge__label {
  display: none;
}

.status-badge--badge {
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
}
.status-badge--badge .status-badge__dot { display: none; }

.status-badge--badge.status-badge--normal {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.2);
}
.status-badge--badge.status-badge--warning {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.2);
}
.status-badge--badge.status-badge--alarm {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.25);
}

/* ===== 脉冲动画 ===== */
.status-badge--pulse.status-badge--alarm .status-badge__dot {
  animation: pulse-alarm 1.5s ease-in-out infinite;
}
</style>
