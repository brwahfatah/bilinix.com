<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  error?: boolean
  id?: string
  autocomplete?: string
  name?: string
}>(), {
  type: 'text',
  disabled: false,
  error: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [e: FocusEvent]
  focus: [e: FocusEvent]
}>()
</script>

<template>
  <div class="relative">
    <slot name="leading" />
    <input
      :id="id"
      :type="type"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-white"
      :class="[
        error
          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
          : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:focus:border-emerald-500',
        $slots.leading  ? 'pl-10' : '',
        $slots.trailing ? 'pr-10' : '',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <slot name="trailing" />
  </div>
</template>
