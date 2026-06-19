<template>
  <div class="space-y-4">
    <div
      v-for="domain in results"
      :key="domain.name"
      class="flex justify-between items-center bg-white p-6 rounded-xl shadow"
    >
      <div>
        <h4 class="font-semibold text-lg">{{ domain.name }}</h4>
        <p
          class="text-sm"
          :class="domain.available ? 'text-green-600' : 'text-red-500'"
        >
          {{ domain.available ? 'Available' : 'Not Available' }}
        </p>
      </div>

      <button
        v-if="domain.available"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
      >
        Register
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: Array
})
</script>
