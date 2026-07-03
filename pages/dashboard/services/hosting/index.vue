<script setup lang="ts">
import HostingTable from '~/features/hosting/components/HostingTable.vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const store = useHostingStore()

await useAsyncData('hosting-list', () => store.fetchList(), { lazy: true })
</script>

<template>
  <div class="space-y-8">

    <UiPageHeader
      eyebrow="Services"
      title="Hosting Accounts"
      description="Manage your shared hosting plans and access the control panel."
    >
      <template #actions>
        <AppButton @click="navigateTo('/hosting')">Browse Plans</AppButton>
      </template>
    </UiPageHeader>

    <AppEmptyState
      v-if="store.error && !store.loading"
      title="Could not load hosting accounts"
      :description="store.error.message"
      tone="danger"
    >
      <template #actions>
        <AppButton variant="outline" @click="store.fetchList()">Retry</AppButton>
      </template>
    </AppEmptyState>

    <HostingTable
      v-else
      :accounts="store.items"
      :loading="store.loading"
      @manage="(id) => navigateTo(`/dashboard/services/hosting/${id}`)"
    />

  </div>
</template>
