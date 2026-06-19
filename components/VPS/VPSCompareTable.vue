<template>
  <div class="overflow-x-auto bg-white rounded-2xl shadow-lg">
    <table class="min-w-full text-left">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-4">Plan</th>
          <th class="p-4">CPU</th>
          <th class="p-4">RAM</th>
          <th class="p-4">Storage</th>
          <th class="p-4">Price</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="plan in plans"
          :key="plan.name"
          class="border-t hover:bg-gray-50"
        >
          <td class="p-4 font-semibold">{{ plan.name }}</td>
          <td class="p-4">{{ plan.cpu }}</td>
          <td class="p-4">{{ plan.ram }}</td>
          <td class="p-4">{{ plan.disk }}</td>
          <td class="p-4 font-bold text-blue-600">
            ${{ plan.price }}/mo
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  plans: Array
})
</script>
