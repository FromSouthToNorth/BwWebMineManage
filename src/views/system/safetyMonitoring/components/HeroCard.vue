<template>
  <div class="hero-card" :class="`hero-card--${color}`">
    <!-- glow orb -->
    <div class="hero-card__orb" />

    <!-- scatter dots -->
    <div class="hero-card__dots">
      <span v-for="dot in scatterDots" :key="dot.key" class="scatter-dot"
        :style="{ left: dot.x, top: dot.y, width: dot.s, height: dot.s, animationDelay: dot.d, opacity: dot.o }" />
    </div>

    <!-- content -->
    <div class="hero-card__icon">
      <slot name="icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </slot>
    </div>
    <div class="hero-card__body">
      <span class="hero-card__label">{{ label }}</span>
      <span class="hero-card__value">
        <span v-if="loading" class="hero-card__shimmer" />
        <template v-else>{{ displayValue }}</template>
      </span>
      <div v-if="$slots.footer" class="hero-card__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HeroCard' })

import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: number
  suffix?: string
  color?: 'primary' | 'success' | 'danger' | 'warning'
  loading?: boolean
}>(), {
  suffix: '',
  color: 'primary',
  loading: false,
})

const displayValue = computed(() => {
  if (props.suffix) return `${props.value}${props.suffix}`
  return props.value.toLocaleString()
})

// 预生成散射光点位置，保证每张卡片不同但渲染稳定
const scatterDots = computed(() => {
  const dots: { key: number; x: string; y: string; s: string; d: string; o: number }[] = []
  const seed = props.label.length + props.color.charCodeAt(0)
  for (let i = 0; i < 5; i++) {
    const x = 12 + ((seed * (i + 1) * 17 + i * 31) % 76)
    const y = 12 + ((seed * (i + 2) * 13 + i * 23) % 76)
    const s = `${2 + ((i * seed) % 3)}px`
    const d = `${(i * 0.7 + 1.2).toFixed(1)}s`
    const o = 0.25 + ((i * seed) % 4) * 0.1
    dots.push({ key: i, x: `${x}%`, y: `${y}%`, s, d, o })
  }
  return dots
})
</script>

<style scoped>
.hero-card {
  --hero-color: var(--color-primary);
  --hero-glow: var(--color-primary-glow, rgba(59, 130, 246, 0.3));
  --hero-bg: rgba(20, 29, 47, 0.5);

  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(20, 29, 47, 0.55) 0%, rgba(15, 23, 42, 0.5) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.hero-card:hover {
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px var(--hero-glow);
  transform: translateY(-2px);
}

/* 颜色变体 */
.hero-card--primary {
  --hero-color: var(--color-primary, #3b82f6);
  --hero-glow: rgba(59, 130, 246, 0.2);
}

.hero-card--success {
  --hero-color: var(--color-success, #22c55e);
  --hero-glow: rgba(34, 197, 94, 0.2);
}

.hero-card--danger {
  --hero-color: var(--color-danger, #ef4444);
  --hero-glow: rgba(239, 68, 68, 0.25);
}

.hero-card--warning {
  --hero-color: var(--color-warning, #f59e0b);
  --hero-glow: rgba(245, 158, 11, 0.2);
}

/* glow orb */
.hero-card__orb {
  position: absolute;
  top: -24px;
  right: -16px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--hero-glow) 0%, transparent 70%);
  pointer-events: none;
  animation: orb-breathe 4s ease-in-out infinite;
}

@keyframes orb-breathe {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.15); }
}

/* scatter dots */
.hero-card__dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scatter-dot {
  position: absolute;
  border-radius: 50%;
  background: var(--hero-color);
  animation: dot-drift 3s ease-in-out infinite;
}

@keyframes dot-drift {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(2px, -3px); }
  66% { transform: translate(-2px, 2px); }
}

/* icon */
.hero-card__icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hero-color);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.hero-card__icon :slotted(svg),
.hero-card__icon svg {
  width: 18px;
  height: 18px;
}

/* body */
.hero-card__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  position: relative;
  z-index: 1;
  min-width: 0;
}

.hero-card__label {
  font-size: 11px;
  color: var(--text-muted, #64748b);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.hero-card__value {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #f0f2f5);
  letter-spacing: 0.5px;
  line-height: 1.15;
}

.hero-card__footer {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}

.hero-card--danger .hero-card__value {
  color: var(--color-danger, #ef4444);
  text-shadow: 0 0 16px rgba(239, 68, 68, 0.3);
}

.hero-card--warning .hero-card__value {
  color: var(--color-warning, #f59e0b);
}

.hero-card--success .hero-card__value {
  color: var(--color-success, #22c55e);
}

/* loading shimmer */
.hero-card__shimmer {
  display: inline-block;
  width: 48px;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0.15) 50%, rgba(148, 163, 184, 0.08) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
