<template>
  <div class="feed-panel glass-panel">
    <!-- header -->
    <div class="feed-panel__header">
      <div class="feed-panel__title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="10" y1="2" x2="10" y2="22" />
        </svg>
        <span>馈电状态监测</span>
        <span v-if="abnormalCount > 0" class="feed-panel__abnormal-badge">{{ abnormalCount }} 异常</span>
      </div>
      <span class="feed-panel__total">共计 {{ items.length }} 点</span>
    </div>

    <!-- status summary -->
    <div class="feed-panel__summary">
      <div class="summary-item summary-item--ok">
        <span class="summary-dot" />
        <span>正常 {{ normalCount }}</span>
      </div>
      <div class="summary-item summary-item--abnormal">
        <span class="summary-dot" />
        <span>异常 {{ abnormalCount }}</span>
      </div>
      <div class="summary-item summary-item--cutoff">
        <span class="summary-dot" />
        <span>断电 {{ cutoffCount }}</span>
      </div>
      <div class="summary-item summary-item--offline">
        <span class="summary-dot" />
        <span>离线 {{ offlineCount }}</span>
      </div>
    </div>

    <!-- list body -->
    <div class="feed-panel__body">
      <div v-if="items.length === 0" class="feed-panel__empty">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"
          style="color: var(--text-muted); opacity: 0.3;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>馈电状态正常</span>
      </div>

      <TransitionGroup name="feed-enter" tag="div" class="feed-panel__list">
        <div v-for="item in displayItems" :key="item._key"
          class="feed-item"
          :class="[`feed-item--${item.feedState}`, { 'feed-item--new': item.isNew }]">
          <div class="feed-item__indicator" :class="`indicator--${item.feedState}`" />
          <div class="feed-item__body">
            <div class="feed-item__top">
              <span class="feed-item__name">{{ item.devName }}</span>
              <!-- AQ1029-2019 §9.2.2: 断电命令 vs 馈电状态 -->
              <span v-if="item.cutoffCmd" class="feed-item__cmd-badge">断电命令</span>
            </div>
            <div class="feed-item__detail">
              <span class="feed-item__field">
                馈电: <strong :style="{ color: item.feedState === 'abnormal' ? 'var(--color-danger)' : item.feedState === 'cutoff' ? '#f97316' : 'var(--color-success)' }">
                  {{ item.feedLabel }}
                </strong>
              </span>
              <span class="feed-item__field">区域: {{ item.area || '-' }}</span>
              <span v-if="item.duration" class="feed-item__field">持续: {{ item.duration }}</span>
            </div>
            <div v-if="item.startTime" class="feed-item__time">{{ item.startTime }}</div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FeedStatusPanel' })

import { computed } from 'vue'

export interface FeedItem {
  devName: string
  /** 馈电状态: normal | abnormal | cutoff | offline */
  feedState: 'normal' | 'abnormal' | 'cutoff' | 'offline'
  feedLabel: string
  area?: string
  cutoffCmd?: boolean
  startTime?: string
  duration?: string
  isNew?: boolean
  _key: string
}

const props = withDefaults(defineProps<{
  items: FeedItem[]
  loading?: boolean
  maxItems?: number
}>(), {
  loading: false,
  maxItems: 20,
  items: () => [],
})

const normalCount = computed(() => props.items.filter(i => i.feedState === 'normal').length)
const abnormalCount = computed(() => props.items.filter(i => i.feedState === 'abnormal').length)
const cutoffCount = computed(() => props.items.filter(i => i.feedState === 'cutoff').length)
const offlineCount = computed(() => props.items.filter(i => i.feedState === 'offline').length)

const displayItems = computed(() => {
  // Sort: abnormal first, then cutoff, then offline, then normal
  const sorted = [...props.items].sort((a, b) => {
    const order: Record<string, number> = { abnormal: 0, cutoff: 1, offline: 2, normal: 3 }
    return (order[a.feedState] ?? 4) - (order[b.feedState] ?? 4)
  })
  return sorted.slice(0, props.maxItems)
})
</script>

<style scoped>
.feed-panel {
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
}

.feed-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 6px;
}

.feed-panel__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.feed-panel__abnormal-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: var(--color-danger);
  padding: 0 7px;
  border-radius: 8px;
  line-height: 16px;
  animation: feed-abnormal-pulse 2s ease-in-out infinite;
}

@keyframes feed-abnormal-pulse {
  0%, 100% { box-shadow: 0 0 4px rgba(239,68,68,0.3); }
  50% { box-shadow: 0 0 10px rgba(239,68,68,0.6); }
}

.feed-panel__total {
  font-size: 10px;
  color: var(--text-muted);
}

/* summary */
.feed-panel__summary {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
  margin-bottom: 6px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.summary-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.summary-item--ok .summary-dot { background: var(--color-success); }
.summary-item--abnormal .summary-dot { background: var(--color-danger); box-shadow: 0 0 4px var(--color-danger-glow); }
.summary-item--cutoff .summary-dot { background: #f97316; }
.summary-item--offline .summary-dot { background: var(--color-info); }

/* body */
.feed-panel__body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: 320px;
}

.feed-panel__body::-webkit-scrollbar {
  width: 3px;
}

.feed-panel__body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.12);
  border-radius: 2px;
}

/* empty */
.feed-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}

/* list */
.feed-panel__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feed-item {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.feed-item:hover {
  background: rgba(148, 163, 184, 0.04);
}

.feed-item--abnormal {
  background: rgba(239, 68, 68, 0.04);
  border-left: 2px solid rgba(239, 68, 68, 0.3);
}

.feed-item--cutoff {
  background: rgba(249, 115, 22, 0.04);
  border-left: 2px solid rgba(249, 115, 22, 0.3);
}

.feed-item--offline {
  opacity: 0.6;
}

.feed-item--new {
  animation: feed-fade-in 0.4s ease;
}

@keyframes feed-fade-in {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

.feed-item__indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.indicator--normal {
  background: var(--color-success);
}

.indicator--abnormal {
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger-glow);
  animation: indicator-blink 1.2s ease-in-out infinite;
}

.indicator--cutoff {
  background: #f97316;
  box-shadow: 0 0 6px rgba(249,115,22,0.4);
}

.indicator--offline {
  background: var(--color-info);
}

@keyframes indicator-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.feed-item__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feed-item__top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.feed-item__name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono, monospace);
}

.feed-item__cmd-badge {
  font-size: 9px;
  font-weight: 600;
  color: #f97316;
  background: rgba(249,115,22,0.1);
  border: 1px solid rgba(249,115,22,0.15);
  padding: 0 5px;
  border-radius: 3px;
  line-height: 15px;
}

.feed-item__detail {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feed-item__field {
  font-size: 11px;
  color: var(--text-secondary);
}

.feed-item__field strong {
  font-family: var(--font-mono, monospace);
}

.feed-item__time {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
}
</style>
