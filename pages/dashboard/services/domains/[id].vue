<script setup lang="ts">
import { DomainEntity } from '~/domain/domain/DomainEntity'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const store = useDomainStore()
const {
  triggerRenew,
  triggerToggleAutoRenew,
  triggerToggleLock,
  triggerUpdateNameservers,
  isActioning,
} = useDomainActions()

const actioning = isActioning(id)

await useAsyncData(`domain-${id}`, () => store.fetchOne(id), { lazy: true })

const entity = computed(() =>
  store.current?.id === id ? DomainEntity.from(store.current) : null,
)

// Nameservers edit state
const editingNs = ref(false)
const nsForm = ref<string[]>([])
const nsError = ref('')

function openNsEditor() {
  nsForm.value = entity.value ? [...entity.value.nameservers] : []
  nsError.value = ''
  editingNs.value = true
}

function cancelNsEditor() {
  editingNs.value = false
}

async function saveNameservers() {
  nsError.value = ''
  const filtered = nsForm.value.map((ns) => ns.trim()).filter(Boolean)
  if (filtered.length < 2) {
    nsError.value = 'At least 2 nameservers are required.'
    return
  }
  const result = await triggerUpdateNameservers(id, filtered)
  if (result.ok) editingNs.value = false
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-8">

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="space-y-4">
      <AppSkeleton height="h-10" width="w-64" />
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-for="i in 4" :key="i" height="h-24" rounded="rounded-xl" />
      </div>
      <AppSkeleton height="h-40" rounded="rounded-2xl" />
    </div>

    <template v-else-if="entity">

      <UiPageHeader
        eyebrow="Domain"
        :title="entity.fullName"
        :description="`Registered ${formatDate(entity.registeredAt.toISOString())}`"
      >
        <template #actions>
          <AppStatusBadge :status="entity.status" dot />
          <AppButton
            variant="outline"
            size="sm"
            @click="navigateTo('/dashboard/services/domains')"
          >
            ← All domains
          </AppButton>
        </template>
      </UiPageHeader>

      <!-- Expiry alerts -->
      <div
        v-if="entity.isExpired"
        class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-400/20 dark:bg-rose-400/10"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.27-12.61c.866-1.5 3.032-1.5 3.898 0l7.27 12.61zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div class="flex-1">
          <p class="font-bold text-rose-800 dark:text-rose-200">This domain has expired.</p>
          <p class="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
            Renew now before it enters the redemption period and becomes unavailable.
          </p>
        </div>
        <AppButton variant="danger" size="sm" :loading="actioning" @click="triggerRenew(id)">
          Renew now
        </AppButton>
      </div>

      <div
        v-else-if="entity.isExpiringSoon"
        class="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-400/10"
      >
        <div class="flex items-center gap-3">
          <svg class="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span class="font-semibold text-amber-800 dark:text-amber-200">
            Expires in {{ entity.daysUntilExpiry }} day{{ entity.daysUntilExpiry !== 1 ? 's' : '' }} — {{ formatDate(entity.expiresAt.toISOString()) }}
          </span>
        </div>
        <AppButton variant="outline" size="sm" :loading="actioning" @click="triggerRenew(id)">
          Renew
        </AppButton>
      </div>

      <!-- Stats row -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AppCard padding="md">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
          <div class="mt-2">
            <AppStatusBadge :status="entity.status" />
          </div>
        </AppCard>
        <AppCard padding="md">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Expires</p>
          <p class="mt-2 text-sm font-bold"
            :class="entity.isExpired
              ? 'text-rose-600 dark:text-rose-400'
              : entity.isExpiringSoon
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-950 dark:text-white'"
          >
            {{ formatDate(entity.expiresAt.toISOString()) }}
          </p>
        </AppCard>
        <AppCard padding="md">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Transfer Lock</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-sm font-bold" :class="entity.locked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'">
              {{ entity.locked ? 'Locked' : 'Unlocked' }}
            </span>
            <button
              v-if="entity.canToggleLock"
              class="text-xs font-semibold text-slate-400 underline-offset-2 hover:text-slate-700 dark:hover:text-white"
              :disabled="actioning"
              @click="triggerToggleLock(id)"
            >
              Change
            </button>
          </div>
        </AppCard>
        <AppCard padding="md">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Privacy</p>
          <p class="mt-2 text-sm font-bold"
            :class="entity.privacyProtection ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'"
          >
            {{ entity.privacyProtection ? 'Protected' : 'Exposed' }}
          </p>
        </AppCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="space-y-6">

          <!-- Auto-Renew card -->
          <AppCard title="Auto-Renew" description="Automatically renew this domain before it expires.">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-slate-950 dark:text-white">
                  Auto-renew is
                  <span :class="entity.isAutoRenewEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
                    {{ entity.isAutoRenewEnabled ? 'enabled' : 'disabled' }}
                  </span>
                </p>
                <p class="mt-0.5 text-xs text-slate-400">
                  {{ entity.isAutoRenewEnabled
                    ? 'Your domain will be automatically renewed 30 days before expiry.'
                    : 'You must manually renew this domain before it expires.' }}
                </p>
              </div>
              <AppButton
                :variant="entity.isAutoRenewEnabled ? 'outline' : 'primary'"
                size="sm"
                :loading="actioning"
                @click="triggerToggleAutoRenew(id)"
              >
                {{ entity.isAutoRenewEnabled ? 'Disable' : 'Enable' }}
              </AppButton>
            </div>
          </AppCard>

          <!-- Nameservers card -->
          <AppCard title="Nameservers" description="Custom nameservers let you point your domain to any DNS provider.">
            <div v-if="!editingNs" class="space-y-3">
              <div class="divide-y divide-slate-100 dark:divide-slate-800">
                <p
                  v-for="(ns, i) in entity.nameservers"
                  :key="i"
                  class="py-2.5 font-mono text-sm text-slate-700 dark:text-slate-300"
                >
                  {{ ns }}
                </p>
              </div>
              <AppButton
                v-if="entity.canEditNameservers"
                variant="outline"
                size="sm"
                @click="openNsEditor"
              >
                Edit nameservers
              </AppButton>
            </div>

            <div v-else class="space-y-4">
              <div class="space-y-2">
                <div
                  v-for="(ns, i) in nsForm"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <div class="flex-1">
                    <AppInput
                      :model-value="ns"
                      :placeholder="`ns${i + 1}.example.com`"
                      @update:model-value="(v: string) => { nsForm[i] = v }"
                    />
                  </div>
                  <button
                    v-if="nsForm.length > 2"
                    type="button"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10 dark:hover:text-rose-400"
                    @click="nsForm.splice(i, 1)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                v-if="nsForm.length < 6"
                type="button"
                class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                @click="nsForm.push('')"
              >
                + Add nameserver
              </button>

              <p v-if="nsError" class="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {{ nsError }}
              </p>

              <div class="flex gap-2">
                <AppButton variant="primary" size="sm" :loading="actioning" @click="saveNameservers">
                  Save
                </AppButton>
                <AppButton variant="outline" size="sm" @click="cancelNsEditor">
                  Cancel
                </AppButton>
              </div>
            </div>
          </AppCard>

        </div>

        <!-- Sidebar: domain info -->
        <aside class="space-y-5">
          <AppCard title="Domain details" padding="md">
            <div class="space-y-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Domain ID</p>
                <p class="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">{{ entity.id }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">TLD</p>
                <p class="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{{ entity.tld }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Annual price</p>
                <p class="mt-1 text-sm font-bold text-slate-950 dark:text-white">${{ entity.annualPrice.toFixed(2) }}/yr</p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Registered</p>
                <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ formatDate(entity.registeredAt.toISOString()) }}</p>
              </div>
            </div>
          </AppCard>

          <AppCard title="Registrant" padding="md">
            <div class="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <p class="font-semibold text-slate-950 dark:text-white">{{ entity.registrantContact.name }}</p>
              <p>{{ entity.registrantContact.email }}</p>
              <p>{{ entity.registrantContact.address }}</p>
              <p>{{ entity.registrantContact.city }}, {{ entity.registrantContact.country }}</p>
            </div>
            <p class="mt-3 text-xs text-slate-400">Contact support to update registrant information.</p>
          </AppCard>

          <!-- Renew action -->
          <AppCard v-if="entity.canRenew" padding="md">
            <p class="text-sm font-bold text-slate-950 dark:text-white">Manual renewal</p>
            <p class="mt-1 text-xs text-slate-400">Extend this domain by 1 year. An invoice will be generated.</p>
            <AppButton
              class="mt-3 w-full"
              variant="primary"
              size="sm"
              :loading="actioning"
              @click="triggerRenew(id)"
            >
              Renew for ${{ entity.annualPrice.toFixed(2) }}
            </AppButton>
          </AppCard>
        </aside>
      </div>

    </template>

    <!-- Not found -->
    <AppEmptyState
      v-else
      icon="domain"
      title="Domain not found"
      description="This domain could not be loaded or no longer exists."
    >
      <template #actions>
        <AppButton variant="outline" @click="navigateTo('/dashboard/services/domains')">
          Back to domains
        </AppButton>
      </template>
    </AppEmptyState>

  </div>
</template>
