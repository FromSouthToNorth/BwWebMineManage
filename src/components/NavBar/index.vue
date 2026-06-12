<template>
  <div class="nav-bar">
    <div v-if="title" class="nav-bar__left">
      <span v-if="icon" class="nav-bar__icon" v-html="icon" />
      <h2 class="nav-bar__title" :class="{ 'nav-bar__title--gradient': gradient }">
        {{ title }}
      </h2>
      <span v-if="subtitle" class="nav-bar__subtitle">{{ subtitle }}</span>
    </div>
    <div v-if="$slots.default" class="nav-bar__center">
      <slot />
    </div>
    <div v-if="$slots.actions" class="nav-bar__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NavBar' })

withDefaults(defineProps<{
  title?: string
  subtitle?: string
  icon?: string
  gradient?: boolean
}>(), {
  gradient: true,
})
</script>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
  min-height: 48px;
}

.nav-bar__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-bar__icon {
  display: flex;
  align-items: center;
  color: var(--color-primary);
}

.nav-bar__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
}

.nav-bar__title--gradient {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-bar__subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.nav-bar__center {
  flex: 1;
}

.nav-bar__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
