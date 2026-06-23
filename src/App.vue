<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useAppStore } from '@/stores/app'
import { DATA_THEME } from '@/utils/constants'

const router = useRouter()
const settingsStore = useSettingsStore()
const appStore = useAppStore()

function checkDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  appStore.setIsMobile(isMobile)
  const height = window.innerHeight
  const size = height < 920 ? 'small' : height > 1000 ? 'default' : 'middle'
  appStore.setSize(size)
}

function getTheme() {
  const queryTheme = router.currentRoute.value.query[DATA_THEME] as string | undefined
  const localTheme = localStorage.getItem(DATA_THEME)
  const theme = queryTheme || localTheme || 'theme-dark'
  if (theme) {
    document.documentElement.setAttribute(DATA_THEME, theme)
    settingsStore.changeSetting({ key: 'theme', value: theme })
    localStorage.setItem(DATA_THEME, theme)
  }
}

onMounted(() => {
  getTheme()
  checkDeviceType()
  window.addEventListener('resize', checkDeviceType)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkDeviceType)
})
</script>

<style>
#app {
  height: 100%;
}
</style>
