<script setup lang="ts">
withDefaults(defineProps<{
  lines?: number     // stacked line skeletons
  height?: string    // Tailwind height class e.g. 'h-4', 'h-10'
  rounded?: string   // Tailwind rounded class
  width?: string     // Tailwind width class
}>(), {
  lines: 1,
  height: 'h-4',
  rounded: 'rounded-lg',
  width: 'w-full',
})
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="animate-pulse bg-slate-100 dark:bg-slate-800"
      :class="[height, rounded, i === lines && lines > 1 ? 'w-3/4' : width]"
    />
  </div>
</template>
