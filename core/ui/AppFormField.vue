<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  hint?: string
  error?: string
  required?: boolean
  for?: string
}>(), {
  required: false,
})
</script>

<template>
  <div class="space-y-1.5">
    <div v-if="label || $slots['label-action']" class="flex items-center justify-between">
      <label
        v-if="label"
        :for="$props.for"
        class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {{ label }}
        <span v-if="required" class="ml-0.5 text-rose-500">*</span>
      </label>
      <slot name="label-action" />
    </div>

    <slot />

    <p
      v-if="error"
      role="alert"
      class="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400"
    >
      <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.27-12.61c.866-1.5 3.032-1.5 3.898 0l7.27 12.61zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {{ error }}
    </p>

    <p v-else-if="hint" class="text-xs text-slate-400 dark:text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>
