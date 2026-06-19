<script setup lang="ts">
import { VpsEntity } from '~/domain/vps/VpsEntity'
import VpsSpecGrid from '~/features/vps/components/VpsSpecGrid.vue'
import VpsPowerPanel from '~/features/vps/components/VpsPowerPanel.vue'
import VpsDangerZone from '~/features/vps/components/VpsDangerZone.vue'
import type { VpsPowerAction } from '~/features/vps/types/vps'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const store = useVpsStore()
const { triggerPowerAction, isActioning } = useVpsActions()

const actioning = isActioning(id)

await useAsyncData(`vps-${id}`, () => store.fetchOne(id), { lazy: true })

// Compute entity from store — gets reactive business methods for free
const entity = computed(() =>
  store.current?.id === id ? VpsEntity.from(store.current) : null,
)

async function handlePowerAction(action: VpsPowerAction) {
  await triggerPowerAction(id, action)
}

async function handleDestroy() {
  await triggerPowerAction(id, 'destroy')
}
</script>

<template>
  <div class="space-y-8">

    <div v-if="store.loading" class="space-y-4">
      <AppSkeleton height="h-10" width="w-64" />
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-for="i in 4" :key="i" height="h-20" rounded="rounded-xl" />
      </div>
      <AppSkeleton height="h-40" rounded="rounded-2xl" />
    </div>

    <template v-else-if="entity">

      <UiPageHeader
        eyebrow="VPS Service"
        :title="entity.name"
        :description="`${entity.plan} · ${entity.region}`"
      >
        <template #actions>
          <AppStatusBadge :status="entity.status" dot />
          <AppButton
            variant="outline"
            size="sm"
            @click="navigateTo('/dashboard/services/vps')"
          >
            ← All servers
          </AppButton>
        </template>
      </UiPageHeader>

      <!-- Expiry warning -->
      <div
        v-if="entity.isExpiringSoon"
        class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-400/20 dark:bg-amber-400/10"
      >
        <svg class="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span class="font-semibold text-amber-800 dark:text-amber-200">
          This server expires in {{ entity.daysUntilExpiry }} day{{ entity.daysUntilExpiry !== 1 ? 's' : '' }}. Renew to avoid service interruption.
        </span>
      </div>

      <VpsSpecGrid :vps="entity.toPlain()" />

      <VpsPowerPanel
        :vps="entity.toPlain()"
        :loading="actioning"
        @action="handlePowerAction"
      />

      <VpsDangerZone
        :loading="actioning"
        :disabled="!entity.canDestroy"
        @destroy="handleDestroy"
      />

    </template>

    <AppEmptyState
      v-else
      icon="server"
      title="Server not found"
      description="This server could not be loaded or no longer exists."
    >
      <template #actions>
        <AppButton variant="outline" @click="navigateTo('/dashboard/services/vps')">
          Back to servers
        </AppButton>
      </template>
    </AppEmptyState>

  </div>
</template>
