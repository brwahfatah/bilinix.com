<script setup lang="ts">
import VpsTable from '~/features/vps/components/VpsTable.vue'
import type { VpsPowerAction } from '~/features/vps/types/vps'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const store = useVpsStore()
const { triggerPowerAction } = useVpsActions()

await useAsyncData('vps-list', () => store.fetchList(), { lazy: true })

async function handleAction(id: string, action: VpsPowerAction) {
  await triggerPowerAction(id, action)
}
</script>

<template>
  <div class="space-y-8">

    <UiPageHeader
      eyebrow="Services"
      title="VPS Servers"
      description="Monitor and manage your virtual machines."
    >
      <template #actions>
        <AppButton @click="navigateTo('/vps')">Deploy VPS</AppButton>
      </template>
    </UiPageHeader>

    <!-- Error state -->
    <AppEmptyState
      v-if="store.error && !store.loading"
      title="Could not load servers"
      :description="store.error.message"
      tone="danger"
    >
      <template #actions>
        <AppButton variant="outline" @click="store.fetchList()">Retry</AppButton>
      </template>
    </AppEmptyState>

    <!-- Table — handles loading + empty states internally via AppDataTable -->
    <VpsTable
      v-else
      :servers="store.items"
      :loading="store.loading"
      @action="handleAction"
      @manage="(id) => navigateTo(`/dashboard/services/vps/${id}`)"
    />

  </div>
</template>
