<template>
  <div :class="{ hidden: hidden }" class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      :small="small"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Pagination' })

import { computed } from 'vue'

const props = withDefaults(defineProps<{
  total: number
  page?: number
  limit?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  autoScroll?: boolean
  hidden?: boolean
  pagerCount?: number
  small?: boolean
}>(), {
  page: 1,
  limit: 20,
  pageSizes: () => [10, 12, 20, 22, 30, 50, 100, 200, 500],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  autoScroll: true,
  hidden: false,
  pagerCount: 7,
  small: false,
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
  pagination: [value: { page: number; limit: number }]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
})

const pageSize = computed({
  get: () => props.limit,
  set: (val) => emit('update:limit', val),
})

function handleSizeChange(val: number) {
  emit('pagination', { page: currentPage.value, limit: val })
}

function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: pageSize.value })
}
</script>

<style scoped>
.pagination-container {
  padding: 8px 0;
}
.pagination-container.hidden {
  display: none;
}
</style>
