<template>
  <div
    class="glass-card"
    :class="[
      `glass-card--${status}`,
      `glass-card--${padding}`,
      { 'glass-card--hoverable': hoverable },
    ]"
  >
    <!-- 顶部状态条 -->
    <div v-if="statusBar && status !== 'default'" class="glass-card__bar" />

    <!-- 头部插槽 -->
    <div v-if="$slots.header || title" class="glass-card__header">
      <slot name="header">
        <span v-if="titleIcon" class="glass-card__header-icon" v-html="titleIcon" />
        <span class="glass-card__title">{{ title }}</span>
        <div v-if="$slots.extra" class="glass-card__extra">
          <slot name="extra" />
        </div>
      </slot>
    </div>

    <!-- 内容 -->
    <div class="glass-card__body">
      <slot />
    </div>

    <!-- 底部插槽 -->
    <div v-if="$slots.footer" class="glass-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'GlassCard' })

withDefaults(defineProps<{
  title?: string
  titleIcon?: string
  status?: 'default' | 'normal' | 'warning' | 'alarm'
  statusBar?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}>(), {
  status: 'default',
  statusBar: true,
  padding: 'md',
  hoverable: false,
})
</script>

<style scoped>
.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.glass-card--hoverable:hover {
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 顶部状态条 */
.glass-card__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.glass-card--normal .glass-card__bar {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success-glow);
}
.glass-card--warning .glass-card__bar {
  background: var(--color-warning);
  box-shadow: 0 0 8px var(--color-warning-glow);
}
.glass-card--alarm .glass-card__bar {
  background: var(--color-danger);
  box-shadow: 0 0 12px var(--color-danger-glow);
}

/* 头部 */
.glass-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: var(--font-size-base);
}

.glass-card__header-icon {
  display: flex;
  align-items: center;
}

.glass-card__title {
  flex: 1;
  color: var(--text-primary);
}

.glass-card__extra {
  flex-shrink: 0;
}

/* 内容 */
.glass-card__body {
  padding: var(--spacing-md) var(--spacing-lg);
}

.glass-card--none .glass-card__body { padding: 0; }
.glass-card--sm .glass-card__body { padding: var(--spacing-sm); }
.glass-card--md .glass-card__body { padding: var(--spacing-md) var(--spacing-lg); }
.glass-card--lg .glass-card__body { padding: var(--spacing-lg); }

/* 底部 */
.glass-card__footer {
  padding: 12px 18px;
  border-top: 1px solid var(--border-color);
}
</style>
