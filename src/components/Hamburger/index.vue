<template>
  <div class="hamburger-container" @click="toggleClick">
    <el-icon :size="20">
      <svg
        :style="{ transform: `rotate(${isActive ? 90 : 0}deg)` }"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
      >
        <path d="M128 256h768v86.528H128V256zM128 554.496V468h768v86.496H128zM128 768v-86.528h768V768H128z" fill="currentColor" />
      </svg>
    </el-icon>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Hamburger' })

defineProps<{
  isActive: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

function toggleClick() {
  emit('toggle')
}
</script>

<style scoped>
.hamburger-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.hamburger-container:hover {
  background: var(--bg-hover);
}
</style>
