<template>
  <div
    class="bg-white rounded-xl shadow p-6 border
           hover:shadow-xl hover:-translate-y-1 transition-all duration-300
           relative"
    :class="tld.popular && 'ring-2 ring-indigo-500'"
  >
    <span
      v-if="tld.popular"
      class="absolute -top-3 right-4 bg-indigo-600
             text-white text-xs px-3 py-1 rounded-full"
    >
      POPULAR
    </span>

    <h3 class="text-2xl font-bold mb-2">
      {{ tld.name }}
    </h3>

    <p class="text-gray-500 mb-4">
      Registration
    </p>

    <div class="text-4xl font-extrabold mb-2">
      ${{ tld.price }}
    </div>

    <p class="text-sm text-gray-500 mb-6">
      Renewal: ${{ tld.renewal }}/year
    </p>

    <button
      @click="$emit('buy', tld)"
      class="w-full bg-indigo-600 text-white py-3 rounded-lg
             hover:bg-indigo-500 transition"
    >
      Buy Now
    </button>
  </div>
</template>

<script setup>
defineProps({
  tld: Object
})
</script>
