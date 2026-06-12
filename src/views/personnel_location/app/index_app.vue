<template>
  <div class="app-personnel-layout">
    <van-nav-bar title="人员定位" left-arrow @click-left="goBack" />
    <div class="app-content">
      <router-view />
    </div>
    <nav class="app-bottom-nav">
      <button
        v-for="(tab, idx) in tabs"
        :key="idx"
        class="app-bottom-nav__item"
        :class="{ 'is-active': active === idx }"
        @click="onTabClick(idx)"
      >
        <van-icon :name="tab.icon" class="app-bottom-nav__icon" />
        <span class="app-bottom-nav__label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppPersonnelLocation' })

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const tabs = [
  { label: '定位', icon: 'location-o', route: '/personnelLocation_phone.cpt/index_app' },
  { label: '历史', icon: 'clock-o', route: '/personnelLocation_phone.cpt/his_downhole_app' },
  { label: '查询', icon: 'search', route: '/personnelLocation_phone.cpt/downholepersonquery_app' },
  { label: '统计', icon: 'bar-chart-o', route: '/personnelLocation_phone.cpt/personCount_app' },
  { label: '设备', icon: 'setting-o', route: '/personnelLocation_phone.cpt/deviceState_app' },
]

const router = useRouter()
const route = useRoute()
const active = ref(0)

function onTabClick(index: number) {
  active.value = index
  router.push({ path: tabs[index].route, query: route.query })
}

function goBack() {
  router.back()
}

onMounted(() => {
  const idx = tabs.findIndex(t => t.route === route.path)
  if (idx >= 0) active.value = idx
})
</script>

<style scoped>
.app-personnel-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-content {
  flex: 1;
  padding-bottom: 56px;
}

.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  height: 50px;
  z-index: var(--z-sticky);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.app-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  color: var(--text-muted);
}

.app-bottom-nav__item.is-active {
  color: var(--color-primary);
}

.app-bottom-nav__icon {
  font-size: 20px;
}

.app-bottom-nav__label {
  font-size: 11px;
  line-height: 1;
}
</style>
