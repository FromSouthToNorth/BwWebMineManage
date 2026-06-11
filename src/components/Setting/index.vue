<template>
  <div class="setting-panel">
    <el-drawer v-model="visible" title="设置" size="280px">
      <div class="setting-item">
        <span class="label">主题</span>
        <el-switch
          v-model="isDark"
          active-text="暗黑"
          inactive-text="浅色"
          @change="handleThemeChange"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SettingPanel' })

import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { DATA_THEME } from '@/utils/constants'

const settingsStore = useSettingsStore()

const visible = ref(false)
const isDark = computed(() => settingsStore.theme === 'theme-dark')

function handleThemeChange(val: boolean) {
  const theme = val ? 'theme-dark' : 'theme-light'
  settingsStore.changeSetting({ key: 'theme', value: theme })
  document.documentElement.setAttribute(DATA_THEME, theme)
  localStorage.setItem(DATA_THEME, theme)
}

function open() {
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped>
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.label {
  font-size: 14px;
  color: var(--text-primary);
}
</style>
