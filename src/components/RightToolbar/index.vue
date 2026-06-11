<template>
  <div class="top-row">
    <div class="left">
      <slot name="left" />
    </div>
    <div class="right">
      <slot name="right" />
      <el-button
        :icon="showSearch ? 'Search' : 'Hide'"
        size="small"
        circle
        @click="toggleSearch"
      />
      <el-button
        icon="Refresh"
        size="small"
        circle
        @click="refresh"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'RightToolbar' })

const emit = defineEmits<{
  'update:show-search': [value: boolean]
  queryTable: []
}>()

const props = withDefaults(defineProps<{
  showSearch?: boolean
}>(), {
  showSearch: true,
})

function toggleSearch() {
  emit('update:show-search', !props.showSearch)
}

function refresh() {
  emit('queryTable')
}
</script>

<style scoped>
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
