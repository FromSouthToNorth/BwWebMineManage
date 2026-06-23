import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('theme-dark')
  const viewStyle = ref<'legacy' | 'safety'>('legacy')

  function changeSetting(payload: { key: string; value: string }) {
    if (payload.key === 'theme') {
      theme.value = payload.value
    }
  }

  function changeViewStyle(value: 'legacy' | 'safety') {
    viewStyle.value = value
  }

  return { theme, viewStyle, changeSetting, changeViewStyle }
})
