<template>
  <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4">
    <input
      v-model="query"
      type="text"
      placeholder="Search your domain name..."
      class="flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
    />

    <select
      v-model="tld"
      class="border rounded-lg px-4 py-3"
    >
      <option>.com</option>
      <option>.net</option>
      <option>.org</option>
      <option>.io</option>
      <option>.ai</option>
    </select>

    <button
      @click="search"
      class="bg-indigo-600 text-white px-6 py-3 rounded-lg
             hover:bg-indigo-500 transition"
    >
      Search
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const query = ref('')
const tld = ref('.com')

function search() {
  alert(`Searching for ${query.value}${tld.value}`)
}
</script>
