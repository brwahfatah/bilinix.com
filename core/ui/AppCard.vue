<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  highlighted?: boolean
  flush?: boolean
}>(), {
  padding: 'md',
  hoverable: false,
  highlighted: false,
  flush: false,
})

const PADDING = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border bg-white dark:bg-slate-900"
    :class="[
      highlighted
        ? 'border-emerald-200 dark:border-emerald-400/20'
        : 'border-slate-200 dark:border-slate-800',
      hoverable
        ? 'cursor-pointer shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
        : 'shadow-sm',
    ]"
  >
    <!-- Header — only rendered when title or #header slot provided -->
    <div
      v-if="title || $slots.header || $slots['header-action']"
      class="flex items-center justify-between px-6 py-4"
      :class="flush ? '' : 'border-b border-slate-100 dark:border-slate-800'"
    >
      <slot name="header">
        <div>
          <h3 class="text-sm font-bold text-slate-950 dark:text-white">{{ title }}</h3>
          <p v-if="description" class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {{ description }}
          </p>
        </div>
      </slot>
      <slot name="header-action" />
    </div>

    <!-- Body -->
    <div :class="PADDING[padding]">
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      class="border-t border-slate-100 px-6 py-3 dark:border-slate-800"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
