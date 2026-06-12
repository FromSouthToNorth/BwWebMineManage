<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h2 class="gradient-title" style="font-size: 20px; font-weight: 700;">设备状态</h2>
    </div>
    <div class="device-grid">
      <div
        v-for="item in devices"
        :key="item.name"
        class="device-card"
        :class="item.online ? 'online' : 'offline'"
      >
        <div class="device-indicator">
          <span class="device-dot" :class="item.online ? 'online' : 'offline'"></span>
        </div>
        <div class="device-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"
            :style="{ color: item.online ? 'var(--color-success)' : 'var(--text-muted)' }">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div class="device-name">{{ item.name }}</div>
        <div class="device-tag">
          <span v-if="item.online" class="tag tag-online">在线</span>
          <span v-else class="tag tag-offline">离线</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceStatus' })

const devices = [
  { name: 'KJ370 分站#1', online: true },
  { name: 'KJ370 分站#2', online: true },
  { name: 'KJ370 分站#3', online: false },
  { name: 'KJ370 分站#4', online: true },
  { name: 'KJ370 分站#5', online: true },
  { name: 'KJ370 分站#6', online: false },
  { name: 'KJ370 分站#7', online: true },
  { name: 'KJ370 分站#8', online: true },
]
</script>

<style scoped>
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.device-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.device-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}

.device-card.online::before {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success-glow);
}

.device-card.offline::before {
  background: var(--text-muted);
}

.device-card.online:hover {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.device-card.offline {
  opacity: 0.6;
}

.device-indicator {
  position: absolute;
  top: 10px;
  right: 12px;
}

.device-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.device-dot.online {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success-glow);
}

.device-dot.offline {
  background: var(--text-muted);
}

.device-icon {
  margin: 4px 0;
}

.device-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.tag {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 10px;
}

.tag-online {
  background: rgba(34, 197, 94, 0.12);
  color: var(--color-success);
}

.tag-offline {
  background: rgba(148, 163, 184, 0.12);
  color: var(--text-muted);
}
</style>
