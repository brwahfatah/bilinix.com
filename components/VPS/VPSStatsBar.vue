<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div v-for="stat in stats" :key="stat.label">
      <h3 class="text-3xl font-bold text-blue-600">{{ stat.value }}</h3>
      <p class="text-sm text-gray-500">{{ stat.label }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: Array
})
</script>
