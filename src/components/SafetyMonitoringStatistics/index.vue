<template>
  <div v-if="html" class="safety-statistics" v-html="html" />
  <div v-if="isShowTotal && total" class="statistics-total">
    统计总数：<span class="total-num">{{ total }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SafetyMonitoringStatistics' })

defineProps<{
  html?: string
  isShowTotal?: boolean
  total?: number | string
}>()
</script>

<style scoped>
.safety-statistics {
  margin: 8px 0;
}

.statistics-total {
  font-size: 14px;
  padding: 8px 0;
}

.total-num {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 18px;
}
</style>
