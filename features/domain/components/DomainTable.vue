<script setup lang="ts">
import { DomainEntity } from '~/domain/domain/DomainEntity'
import type { Domain } from '../types/domain'
import type { Column } from '~/core/ui/AppDataTable.vue'

const props = defineProps<{
  domains: Domain[]
  loading?: boolean
}>()

const emit = defineEmits<{
  manage: [id: string]
  renew: [id: string]
}>()

const store = useDomainStore()

const columns: Column<Domain>[] = [
  { key: 'name', label: 'Domain', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'expiresAt', label: 'Expiry', sortable: true },
  { key: 'autoRenew', label: 'Auto-Renew' },
]

function expiryClass(entity: DomainEntity): string {
  if (entity.isExpired) return 'text-rose-600 dark:text-rose-400'
  if (entity.isExpiringSoon) return 'text-amber-600 dark:text-amber-400'
  return 'text-slate-700 dark:text-slate-300'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <AppDataTable
    :columns="columns"
    :rows="domains"
    :loading="loading"
    row-key="id"
    clickable
    @row-click="emit('manage', $event.id)"
  >
    <!-- Domain name -->
    <template #cell-name="{ row }">
      <div>
        <p class="font-bold text-slate-950 dark:text-white">{{ row.name }}</p>
        <p class="mt-0.5 text-xs text-slate-400">Registered {{ formatDate(row.registeredAt) }}</p>
      </div>
    </template>

    <!-- Status badge -->
    <template #cell-status="{ row }">
      <AppStatusBadge :status="row.status" dot />
    </template>

    <!-- Expiry with urgency colouring -->
    <template #cell-expiresAt="{ row }">
      <div>
        <p class="text-sm font-semibold" :class="expiryClass(DomainEntity.from(row)!)">
          {{ formatDate(row.expiresAt) }}
        </p>
        <p
          v-if="DomainEntity.from(row)!.isExpiringSoon"
          class="mt-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400"
        >
          Expires in {{ DomainEntity.from(row)!.daysUntilExpiry }} days
        </p>
        <p
          v-else-if="DomainEntity.from(row)!.isExpired"
          class="mt-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400"
        >
          Expired
        </p>
      </div>
    </template>

    <!-- Auto-renew toggle display -->
    <template #cell-autoRenew="{ row }">
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        :class="row.autoRenew === 'enabled'
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20'
          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'"
      >
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="row.autoRenew === 'enabled' ? 'bg-emerald-500' : 'bg-slate-400'"
        />
        {{ row.autoRenew === 'enabled' ? 'On' : 'Off' }}
      </span>
    </template>

    <!-- Row actions -->
    <template #actions="{ row }">
      <div class="flex items-center justify-end gap-2">
        <AppButton
          v-if="DomainEntity.from(row)!.canRenew"
          variant="outline"
          size="sm"
          :loading="store.isActioning(row.id)"
          @click.stop="emit('renew', row.id)"
        >
          Renew
        </AppButton>
        <AppButton variant="outline" size="sm" @click.stop="emit('manage', row.id)">
          Manage
        </AppButton>
      </div>
    </template>

    <template #empty>
      <AppEmptyState
        icon="domain"
        title="No domains yet"
        description="Register your first domain and it will appear here after checkout."
      >
        <template #actions>
          <AppButton @click="navigateTo('/domains')">Search Domains</AppButton>
        </template>
      </AppEmptyState>
    </template>
  </AppDataTable>
</template>
