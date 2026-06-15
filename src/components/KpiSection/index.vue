<template>
  <section class="kpi-section">
    <div v-for="item in kpiItems" :key="item.key" class="kpi-card" :class="`kpi-card--${item.type || 'default'}`">
      <div class="kpi-card__icon" v-html="item.iconHtml" />
      <div class="kpi-card__info">
        <span class="kpi-card__label">{{ item.label }}</span>
        <span class="kpi-card__value" :class="`kpi-card__value--${item.type || 'default'}`">
          {{ item.value ?? '--' }}
          <span v-if="item.unit" class="kpi-card__unit">{{ item.unit }}</span>
        </span>
      </div>
      <div class="kpi-card__glow" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'KpiSection' })

import { computed } from 'vue'
import { KPI_CONFIG } from '@/constants/kpi'

const props = defineProps<{
  data: Record<string, any>
}>()

interface KpiItem {
  key: string
  label: string
  value: number
  type: string
  iconHtml: string
  unit?: string
}

const kpiItems = computed<KpiItem[]>(() => {
  return Object.keys(KPI_CONFIG)
    .filter(k => k in props.data)
    .map(k => {
      const meta = KPI_CONFIG[k]
      return {
        key: k,
        label: meta.label,
        value: props.data[k] ?? 0,
        type: mapKpiColor(meta.color),
        iconHtml: meta.icon,
      }
    })
})

function mapKpiColor(color: string): string {
  const map: Record<string, string> = {
    primary: 'total',
    danger: 'alarm',
    warning: 'warning',
    success: 'success',
  }
  return map[color] || 'default'
}
</script>

<style scoped>
.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  flex-shrink: 0;
}

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: var(--shadow-md);
}

.kpi-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.kpi-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 1;
  min-width: 0;
}

.kpi-card__label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.kpi-card__value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.kpi-card__unit {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 2px;
  font-weight: 500;
}

.kpi-card__glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  filter: blur(24px);
  opacity: 0.15;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.kpi-card:hover .kpi-card__glow {
  opacity: 0.25;
}

.kpi-card--total .kpi-card__icon {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-primary);
}

.kpi-card--total .kpi-card__glow {
  background: var(--color-primary);
}

.kpi-card--total .kpi-card__value {
  color: var(--color-primary);
}

.kpi-card--alarm .kpi-card__icon {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.kpi-card--alarm .kpi-card__glow {
  background: var(--color-danger);
}

.kpi-card--alarm .kpi-card__value {
  color: var(--color-danger);
  text-shadow: 0 0 16px var(--color-danger-glow);
}

.kpi-card--success .kpi-card__icon {
  background: rgba(34, 197, 94, 0.12);
  color: var(--color-success);
}

.kpi-card--success .kpi-card__glow {
  background: var(--color-success);
}

.kpi-card--success .kpi-card__value {
  color: var(--color-success);
}

.kpi-card--info .kpi-card__icon {
  background: rgba(100, 116, 139, 0.12);
  color: var(--color-info);
}

.kpi-card--info .kpi-card__glow {
  background: var(--color-info);
}

.kpi-card--info .kpi-card__value {
  color: var(--text-primary);
}

.kpi-card--warning .kpi-card__icon {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-warning);
}

.kpi-card--warning .kpi-card__glow {
  background: var(--color-warning);
}

.kpi-card--warning .kpi-card__value {
  color: var(--color-warning);
}

@media (max-width: 768px) {
  .kpi-section {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}
</style>
