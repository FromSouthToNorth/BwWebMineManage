<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="back-to-top"
      @click="scrollToTop"
    >
      <el-icon><Top /></el-icon>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'BackToTop' })

import { ref, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)
const scrollEl = ref<HTMLElement | Window>()

function scrollToTop() {
  const target = scrollEl.value || window
  if (target instanceof Window) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    target.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  visible.value = scrollTop > 200
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  transition: all 0.3s;
}

.back-to-top:hover {
  background: var(--color-primary);
  color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
