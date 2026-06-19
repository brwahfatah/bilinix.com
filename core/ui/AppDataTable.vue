<script setup lang="ts" generic="T extends Record<string, any>">
import { TABLE_HEADER, TABLE_CELL, TABLE_ROW_HOVER } from '~/core/design-system/tokens'

export interface Column<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  width?: string
}

const props = withDefaults(defineProps<{
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  skeletonRows?: number
  rowKey?: keyof T
  clickable?: boolean
}>(), {
  skeletonRows: 4,
  rowKey: 'id' as any,
  clickable: false,
})

const emit = defineEmits<{
  rowClick: [row: T]
}>()

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value!]
    const bv = b[sortKey.value!]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function alignClass(align: Column['align'] = 'left') {
  return { left: 'text-left', right: 'text-right', center: 'text-center' }[align]
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">

        <thead :class="TABLE_HEADER" class="border-b border-slate-100 dark:border-slate-800">
          <tr>
            <th
              v-for="col in columns"
              :key="String(col.key)"
              :class="[TABLE_CELL, alignClass(col.align), col.width ?? '', col.sortable ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200' : '']"
              class="py-3.5 font-black"
              @click="col.sortable ? toggleSort(String(col.key)) : undefined"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <template v-if="col.sortable">
                  <svg
                    class="h-3 w-3 transition-transform"
                    :class="sortKey === String(col.key) ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'"
                    :style="sortKey === String(col.key) && sortDir === 'desc' ? 'transform:rotate(180deg)' : ''"
                    fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                  </svg>
                </template>
              </span>
            </th>
            <th v-if="$slots.actions" :class="[TABLE_CELL, 'text-right py-3.5 font-black']" />
          </tr>
        </thead>

        <!-- Loading skeleton -->
        <tbody v-if="loading">
          <tr v-for="i in skeletonRows" :key="i" class="border-b border-slate-100 dark:border-slate-800">
            <td v-for="col in columns" :key="String(col.key)" :class="TABLE_CELL">
              <div class="h-4 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" :style="`width: ${60 + Math.random() * 30}%`" />
            </td>
            <td v-if="$slots.actions" :class="TABLE_CELL" class="text-right">
              <div class="ml-auto h-8 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            </td>
          </tr>
        </tbody>

        <!-- Data rows -->
        <tbody v-else-if="sortedRows.length > 0" class="divide-y divide-slate-100 dark:divide-slate-800/60">
          <tr
            v-for="row in sortedRows"
            :key="row[rowKey]"
            :class="[TABLE_ROW_HOVER, clickable ? 'cursor-pointer' : '']"
            @click="clickable ? emit('rowClick', row) : undefined"
          >
            <td
              v-for="col in columns"
              :key="String(col.key)"
              :class="[TABLE_CELL, alignClass(col.align)]"
            >
              <slot :name="`cell-${String(col.key)}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" :class="[TABLE_CELL, 'text-right']">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>

      </table>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && sortedRows.length === 0" class="p-8">
      <slot name="empty">
        <AppEmptyState title="No data found" description="There is nothing to show here yet." />
      </slot>
    </div>
  </div>
</template>
