<template>
  <div class="bg-gray-50 rounded-2xl p-8 shadow-lg">
    <h3 class="text-xl font-bold mb-6">Live VPS Monitoring</h3>

    <StatBar label="CPU Load" :value="cpu" />
    <StatBar label="RAM Usage" :value="ram" />
    <StatBar label="Disk Usage" :value="disk" />
    <StatBar label="Network" :value="network" />

    <p class="text-xs text-gray-500 mt-4">
      Live updates every 2 seconds
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatBar from '~/components/VPS/StatBar.vue'

const cpu = ref(30)
const ram = ref(50)
const disk = ref(40)
const network = ref(20)

onMounted(() => {
  setInterval(() => {
    cpu.value = Math.floor(Math.random() * 70) + 20
    ram.value = Math.floor(Math.random() * 70) + 20
    disk.value = Math.floor(Math.random() * 60) + 20
    network.value = Math.floor(Math.random() * 80) + 10
  }, 2000)
})
</script>
