<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | number
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  placeholder?: string
  disabled?: boolean
  error?: boolean
  id?: string
  name?: string
}>(), {
  disabled: false,
  error: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      class="h-11 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm text-slate-950 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-white"
      :class="error
        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700'"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value); $emit('change', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
    </select>
    <!-- Chevron icon -->
    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>
