<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '~/composables/useCart'
import PageHeader from '~/components/Ui/PageHeader.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

type VpsPlan = { id: number; name: string; cpu: string; ram: string; storage: string; price: number; popular?: boolean; whmcs_product_id?: number }

const router = useRouter()
const { addItem } = useCart()
const config = useRuntimeConfig()

const fallbackPlans: VpsPlan[] = [
  { id: 1, name: 'Starter VPS', cpu: '1 vCPU', ram: '2 GB RAM', storage: '40 GB NVMe', price: 6 },
  { id: 2, name: 'Business VPS', cpu: '2 vCPU', ram: '4 GB RAM', storage: '80 GB NVMe', price: 14, popular: true },
  { id: 3, name: 'Pro VPS', cpu: '4 vCPU', ram: '8 GB RAM', storage: '160 GB NVMe', price: 29 }
]

const plans = ref<VpsPlan[]>([...fallbackPlans])
const selectedPlan = ref<VpsPlan | null>(null)
const hostname = ref('')
const os = ref('ubuntu_22')
const location = ref('germany')
const backups = ref(false)
const ipv6 = ref(true)

const hostnameValid = computed(() => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(hostname.value) && hostname.value.length >= 3)
const totalPrice = computed(() => (selectedPlan.value?.price || 0) + (backups.value ? 3 : 0))

const selectPlan = (plan: VpsPlan) => {
  selectedPlan.value = plan
}

const buildItem = () => ({
  id: `vps-${selectedPlan.value!.id}-${hostname.value}`,
  type: 'server' as const,
  name: `${selectedPlan.value!.name} (${hostname.value})`,
  price: totalPrice.value,
  quantity: 1,
  period: 1,
  periodLabel: 'Monthly',
  meta: {
    plan_id: selectedPlan.value!.id,
    whmcs_product_id: selectedPlan.value!.whmcs_product_id || selectedPlan.value!.id,
    hostname: hostname.value,
    os: os.value,
    location: location.value,
    backups: backups.value,
    ipv6: ipv6.value
  }
})

const addToCartHandler = async () => {
  if (!selectedPlan.value || !hostnameValid.value) return
  await addItem(buildItem())
}

const deployNow = async () => {
  await addToCartHandler()
  router.push('/cart')
}

onMounted(async () => {
  try {
    // Laravel: GET /api/products/grouped → { data: { vps: [...] } }
    const res: any = await $fetch(`${config.public.apiBase}/products/grouped`)
    const apiVps = res?.data?.vps ?? res?.plans
    if (Array.isArray(apiVps) && apiVps.length) {
      plans.value = apiVps.map((p: any, i: number) => ({
        ...fallbackPlans[i] ?? fallbackPlans[0],
        id: Number(p.id) || i + 1,
        name: p.name ?? fallbackPlans[i]?.name ?? '',
        price: (parseFloat(p.price) || fallbackPlans[i]?.price) ?? 0,
        popular: p.featured ?? false,
        whmcs_product_id: Number(p.id) || fallbackPlans[i]?.whmcs_product_id,
      })) as VpsPlan[]
    }
  } catch {
    plans.value = [...fallbackPlans]
  }
})
</script>

<template>
  <div class="space-y-8">
    <PageHeader eyebrow="Order" title="Deploy a new VPS" description="Choose a plan, define the server identity, and add it to your cart." />

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-xl font-black text-slate-950 dark:text-white">Choose a plan</h2>
      <div class="mt-5 grid gap-4 md:grid-cols-3">
        <button
          v-for="plan in plans"
          :key="plan.id"
          type="button"
          class="relative rounded-lg border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
          :class="selectedPlan?.id === plan.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'"
          @click="selectPlan(plan)"
        >
          <span v-if="plan.popular" class="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Popular</span>
          <h3 class="pr-20 font-black text-slate-950 dark:text-white">{{ plan.name }}</h3>
          <ul class="mt-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
            <li>{{ plan.cpu }}</li>
            <li>{{ plan.ram }}</li>
            <li>{{ plan.storage }}</li>
          </ul>
          <p class="mt-5 text-2xl font-black text-slate-950 dark:text-white">${{ plan.price }}/mo</p>
        </button>
      </div>
    </section>

    <section class="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-xl font-black text-slate-950 dark:text-white">Server details</h2>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200">Hostname</label>
            <input v-model="hostname" class="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" placeholder="vps-01" />
            <p v-if="hostname && !hostnameValid" class="mt-2 text-sm text-rose-600 dark:text-rose-300">Use at least 3 lowercase letters, numbers, or hyphens.</p>
          </div>
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200">Operating system</label>
            <select v-model="os" class="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950">
              <option value="ubuntu_22">Ubuntu 22.04</option>
              <option value="debian_12">Debian 12</option>
              <option value="almalinux_9">AlmaLinux 9</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200">Datacenter</label>
            <select v-model="location" class="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950">
              <option value="germany">Germany</option>
              <option value="netherlands">Netherlands</option>
              <option value="usa">United States</option>
            </select>
          </div>
          <div class="space-y-3">
            <label class="flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
              <input v-model="backups" type="checkbox" class="h-4 w-4 rounded" />
              Daily backups (+$3/month)
            </label>
            <label class="flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
              <input v-model="ipv6" type="checkbox" class="h-4 w-4 rounded" />
              Enable IPv6
            </label>
          </div>
        </div>
      </div>

      <aside class="h-fit rounded-xl bg-slate-950 p-6 text-white shadow-xl dark:bg-white dark:text-slate-950">
        <p class="text-sm font-bold text-slate-300 dark:text-slate-600">Monthly total</p>
        <p class="mt-2 text-4xl font-black">${{ totalPrice.toFixed(2) }}</p>
        <p class="mt-2 text-sm text-slate-400 dark:text-slate-500">{{ selectedPlan?.name || 'Choose a plan' }}</p>
        <div class="mt-8 grid gap-3">
          <button class="rounded-lg border border-white/20 px-4 py-3 text-sm font-bold dark:border-slate-200" :disabled="!selectedPlan || !hostnameValid" @click="addToCartHandler">Add to Cart</button>
          <button class="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60" :disabled="!selectedPlan || !hostnameValid" @click="deployNow">Deploy Now</button>
        </div>
      </aside>
    </section>
  </div>
</template>
