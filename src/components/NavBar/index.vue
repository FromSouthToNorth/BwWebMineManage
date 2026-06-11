<template>
  <div class="nav-bar">
    <h2 :class="h2ClassName" v-if="title">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NavBar' })

defineProps<{
  title?: string
  h2ClassName?: string
}>()
</script>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.gradient-title {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
