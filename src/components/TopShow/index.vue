<template>
  <div class="top-show" v-if="$slots.default">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TopShow' })
</script>
