import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('theme-dark')

  function changeSetting(payload: { key: string; value: string }) {
    if (payload.key === 'theme') {
      theme.value = payload.value
    }
  }

  return { theme, changeSetting }
})
