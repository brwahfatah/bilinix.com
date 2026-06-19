<script setup lang="ts">
import { VpsEntity } from '~/domain/vps/VpsEntity'
import type { Vps, VpsPowerAction } from '../types/vps'
import type { Column } from '~/core/ui/AppDataTable.vue'

const props = defineProps<{
  servers: Vps[]
  loading?: boolean
}>()

const emit = defineEmits<{
  action: [id: string, action: VpsPowerAction]
  manage: [id: string]
}>()

const store = useVpsStore()

// Enrich raw Vps data with entity business logic for the template
const entities = computed(() =>
  props.servers.map((s) => ({ raw: s, entity: VpsEntity.from(s) })),
)

const columns: Column<Vps>[] = [
  { key: 'name', label: 'Server', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'ip', label: 'IP Address' },
  { key: 'os', label: 'OS / Region', sortable: true },
  { key: 'spec', label: 'Resources' },
]

const openMenuId = ref<string | null>(null)

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function onAction(id: string, action: VpsPowerAction) {
  openMenuId.value = null
  emit('action', id, action)
}

function handleClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('[data-action-menu]')) {
    openMenuId.value = null
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <AppDataTable
    :columns="columns"
    :rows="servers"
    :loading="loading"
    row-key="id"
    clickable
    @row-click="emit('manage', $event.id)"
  >
    <!-- Server name + plan -->
    <template #cell-name="{ row }">
      <div>
        <p class="font-bold text-slate-950 dark:text-white">{{ row.name }}</p>
        <p class="mt-0.5 text-xs text-slate-400">{{ row.plan }}</p>
      </div>
    </template>

    <!-- Status badge from design system -->
    <template #cell-status="{ row }">
      <AppStatusBadge :status="row.status" dot />
    </template>

    <!-- IP address -->
    <template #cell-ip="{ row }">
      <span class="font-mono text-sm" :class="row.ip ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'">
        {{ VpsEntity.from(row).displayAddress }}
      </span>
    </template>

    <!-- OS + region -->
    <template #cell-os="{ row }">
      <p class="font-medium text-slate-700 dark:text-slate-300">{{ row.os }}</p>
      <p class="mt-0.5 text-xs text-slate-400">{{ row.region }}</p>
    </template>

    <!-- Spec pills -->
    <template #cell-spec="{ row }">
      <div class="flex flex-wrap gap-1">
        <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {{ row.spec.cpu }}v
        </span>
        <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {{ row.spec.ramGb }}GB
        </span>
        <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {{ row.spec.diskGb }}G SSD
        </span>
      </div>
    </template>

    <!-- Actions column -->
    <template #actions="{ row }">
      <div class="flex items-center justify-end gap-2">

        <AppButton variant="outline" size="sm" @click.stop="emit('manage', row.id)">
          Manage
        </AppButton>

        <!-- 3-dot dropdown -->
        <div class="relative" data-action-menu>
          <AppButton
            variant="outline"
            size="sm"
            :loading="store.isActioning(row.id)"
            :disabled="store.isActioning(row.id)"
            class="!px-2"
            @click.stop="toggleMenu(row.id)"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </AppButton>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div
              v-if="openMenuId === row.id"
              class="absolute right-0 z-40 mt-2 w-44 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <template v-for="act in VpsEntity.from(row).availableActions()" :key="act">
                <button
                  class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold transition"
                  :class="act === 'destroy'
                    ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'"
                  @click="onAction(row.id, act)"
                >
                  {{ act.charAt(0).toUpperCase() + act.slice(1) }}
                </button>
                <div v-if="act === 'stop'" class="border-t border-slate-100 dark:border-slate-800" />
              </template>
            </div>
          </Transition>
        </div>

      </div>
    </template>

    <template #empty>
      <AppEmptyState
        icon="server"
        title="No VPS servers yet"
        description="Deploy your first cloud server and it will appear here after provisioning."
      >
        <template #actions>
          <AppButton @click="navigateTo('/vps')">Deploy VPS</AppButton>
        </template>
      </AppEmptyState>
    </template>
  </AppDataTable>
</template>
