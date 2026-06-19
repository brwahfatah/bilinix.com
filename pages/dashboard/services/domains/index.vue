<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const store = useDomainStore()
const { triggerRenew, triggerToggleAutoRenew } = useDomainActions()
const { canCreate } = usePermissions()

await useAsyncData('domain-list', () => store.fetchList(), { lazy: true })

function handleManage(id: string) {
  navigateTo(`/dashboard/services/domains/${id}`)
}

async function handleRenew(id: string) {
  await triggerRenew(id)
}
</script>

<template>
  <div class="space-y-8">

    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Services</p>
        <h1 class="mt-1 text-3xl font-black text-slate-950 dark:text-white">My Domains</h1>
        <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Domains connected to your account and their renewal state.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Expiry alert badge -->
        <span
          v-if="!store.loading && store.expiredCount > 0"
          class="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20"
        >
          {{ store.expiredCount }} expired
        </span>
        <AppButton
          v-if="canCreate('domain')"
          variant="primary"
          size="sm"
          @click="navigateTo('/domains')"
        >
          Register Domain
        </AppButton>
      </div>
    </div>

    <!-- Domain table -->
    <DomainTable
      :domains="store.items"
      :loading="store.loading"
      @manage="handleManage"
      @renew="handleRenew"
    />

  </div>
</template>
