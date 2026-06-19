<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  rows?: number
  id?: string
  name?: string
}>(), {
  rows: 4,
  disabled: false,
  error: false,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :id="id"
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :rows="rows"
    class="block w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
    :class="error
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/30 dark:border-rose-400/40'
      : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/30 dark:border-slate-700 dark:focus:border-emerald-500'"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
