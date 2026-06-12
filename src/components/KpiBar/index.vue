<template>
  <div class="kpi-bar" :class="{ 'kpi-bar--sm': size === 'small' }">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="kpi-item"
      :class="[`kpi-item--${item.type || 'default'}`, { 'kpi-item--clickable': !!item.onClick }]"
      @click="item.onClick?.()"
      role="button"
      :tabindex="item.onClick ? 0 : undefined"
      @keydown.enter="item.onClick?.()"
    >
      <div v-if="item.icon || item.iconHtml" class="kpi-icon" :class="`kpi-icon--${item.type || 'default'}`">
        <component :is="item.icon" v-if="item.icon" class="kpi-svg" />
        <span v-else-if="item.iconHtml" v-html="item.iconHtml" />
      </div>
      <div class="kpi-info">
        <span class="kpi-label">{{ item.label }}</span>
        <span
          class="kpi-value"
          :class="`kpi-value--${item.type || 'default'}`"
        >
          {{ item.value ?? '--' }}
        </span>
        <span v-if="item.unit" class="kpi-unit">{{ item.unit }}</span>
      </div>
      <div v-if="idx < items.length - 1" class="kpi-divider" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'KpiBar' })

export interface KpiItem {
  label: string
  value: string | number | null | undefined
  type?: 'default' | 'total' | 'alarm' | 'success' | 'warning' | 'info'
  icon?: any // component
  iconHtml?: string
  unit?: string
  onClick?: () => void
}

withDefaults(defineProps<{
  items: KpiItem[]
  size?: 'default' | 'small'
}>(), {
  size: 'default',
})
</script>

<style scoped>
.kpi-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px 20px;
  gap: 0;
}

.kpi-bar--sm {
  padding: 6px 14px;
}

.kpi-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  position: relative;
}

.kpi-item--clickable {
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.kpi-item--clickable:hover {
  opacity: 0.8;
}

.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-bar--sm .kpi-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.kpi-svg {
  width: 18px;
  height: 18px;
}

.kpi-icon--default { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); }
.kpi-icon--total { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); }
.kpi-icon--alarm { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }
.kpi-icon--success { background: rgba(34, 197, 94, 0.1); color: var(--color-success); }
.kpi-icon--warning { background: rgba(234, 179, 8, 0.1); color: var(--color-warning); }
.kpi-icon--info { background: rgba(100, 116, 139, 0.1); color: var(--color-info); }

.kpi-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-value {
  font-family: var(--font-mono);
  font-size: var(--font-size-lg);
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
}

.kpi-bar--sm .kpi-value {
  font-size: var(--font-size-base);
}

.kpi-value--default { color: var(--text-primary); }
.kpi-value--total { color: var(--color-primary); }
.kpi-value--alarm { color: var(--color-danger); text-shadow: 0 0 20px var(--color-danger-glow); }
.kpi-value--success { color: var(--color-success); }
.kpi-value--warning { color: var(--color-warning); }

.kpi-unit {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-left: 2px;
}

.kpi-divider {
  width: 1px;
  height: 32px;
  background: var(--border-color);
  margin: 0 16px;
  flex-shrink: 0;
}

.kpi-bar--sm .kpi-divider {
  margin: 0 10px;
}
</style>
