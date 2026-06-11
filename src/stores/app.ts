import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebar = reactive({
    opened: true,
    withoutAnimation: false,
    hide: false,
  })
  const isMobile = ref(false)
  const size = ref<string>('small')
  const histPopup = ref(true)

  function toggleSideBar() {
    if (sidebar.hide) return
    sidebar.opened = !sidebar.opened
    sidebar.withoutAnimation = false
  }

  function closeSideBar(withoutAnimation: boolean) {
    sidebar.opened = false
    sidebar.withoutAnimation = withoutAnimation
  }

  function setIsMobile(val: boolean) {
    isMobile.value = val
    size.value = val ? 'mini' : 'small'
  }

  function setSize(val: string) {
    size.value = val
  }

  function setHistPopup(val: boolean) {
    histPopup.value = val
  }

  return {
    sidebar,
    isMobile,
    size,
    histPopup,
    toggleSideBar,
    closeSideBar,
    setIsMobile,
    setSize,
    setHistPopup,
  }
})
