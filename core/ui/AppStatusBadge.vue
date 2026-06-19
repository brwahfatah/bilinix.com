<script setup lang="ts">
import { getStatusToken } from '~/core/design-system/tokens'

const props = defineProps<{
  status: string | null | undefined
  dot?: boolean  // show animated dot alongside badge
}>()

const token = computed(() => getStatusToken(props.status))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1"
    :class="token.badge"
  >
    <span
      v-if="dot"
      class="h-1.5 w-1.5 rounded-full shrink-0"
      :class="[token.dot, token.animated ? 'animate-pulse' : '']"
    />
    {{ token.label }}
  </span>
</template>
