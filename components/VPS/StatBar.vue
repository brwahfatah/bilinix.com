<template>
  <div class="mb-6">
    <div class="flex justify-between text-sm mb-2">
      <span class="font-medium">{{ label }}</span>
      <span>{{ value }}%</span>
    </div>

    <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-blue-600 rounded-full transition-all duration-1000"
        :style="{ width: animated + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  label: String,
  value: Number
})

const animated = ref(0)

onMounted(() => {
  setTimeout(() => {
    animated.value = props.value
  }, 200)
})
</script>
