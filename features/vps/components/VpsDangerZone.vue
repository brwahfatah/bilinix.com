<script setup lang="ts">
defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ destroy: [] }>()
</script>

<template>
  <section class="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-400/20 dark:bg-rose-400/10">
    <h2 class="text-xl font-black text-rose-700 dark:text-rose-300">Danger Zone</h2>
    <p class="mt-2 text-sm text-rose-700/80 dark:text-rose-300/80">
      Destroying a server is immediate and permanent. All data, snapshots, and backups will be erased.
    </p>
    <button
      type="button"
      :disabled="loading"
      class="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
      @click="emit('destroy')"
    >
      <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Destroy Server
    </button>
  </section>
</template>
