<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCart } from '~/composables/useCart'
import { domainTlds } from '~/data/site'

type DomainResult = {
  domain: string
  tld: string
  price: number
  available: boolean
}

type TldEntry = {
  tld: string
  price: number
  renew?: number
  popular?: boolean
  category?: string
}

useSeoMeta({
  title: 'Domain Name Registration — .com from $9.99/yr | Bilinix',
  description: 'Register .com, .net, .io, .dev and 100+ domain extensions. Instant registration, free DNS hosting, WHOIS privacy. Bundle with hosting or VPS in one cart.',
  ogTitle: 'Domain Name Registration | Bilinix',
  ogDescription: 'Search and register .com, .net, .io, .dev and 100+ domain extensions. Instant activation with free DNS.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Domain Names from $9.99/yr | Bilinix',
  twitterDescription: 'Register .com, .net, .io, .dev and 100+ TLDs. Instant activation with free DNS hosting.',
})

const config = useRuntimeConfig()
const { addItem, items, locked } = useCart()

const search = ref('')
const results = ref<DomainResult[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')
const extensions = ref<TldEntry[]>([...domainTlds])
const activeCategory = ref<string>('popular')

const categories = ['popular', 'tech', 'business', 'classic', 'personal', 'info']

const filteredExtensions = computed(() => {
  if (activeCategory.value === 'popular') {
    return extensions.value.filter((e) => e.popular)
  }
  return extensions.value.filter((e) => e.category === activeCategory.value)
})

const cartLocked = computed(() => locked.value)

const domainInCart = (domain: string) =>
  items.value.some((item) => item.type === 'domain' && item.meta?.domain === domain)

const normalizeSearch = () =>
  search.value.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\.[^.]+$/, '').trim().toLowerCase()

const searchDomain = async () => {
  const sld = normalizeSearch()
  if (!sld || sld.length < 2) {
    notice.value = 'Enter a domain name to search — for example, "mysite".'
    return
  }

  search.value = sld
  loading.value = true
  error.value = ''
  notice.value = ''
  results.value = []

  try {
    // Laravel API: domain availability search — route does not exist yet
    // When implemented it should accept { sld, tlds } and return { data: { results: [...] } }
    const res = await $fetch(`${config.public.apiBase}/domains/search`, {
      method: 'POST',
      body: {
        sld,
        tlds: extensions.value.filter((e) => e.popular).map((e) => e.tld),
      },
    }) as { data?: { results?: DomainResult[] }; results?: DomainResult[] }
    results.value = Array.isArray(res?.data?.results ?? res?.results)
      ? (res?.data?.results ?? res?.results ?? [])
      : []
  } catch (e: any) {
    results.value = []
    error.value = e?.data?.message || e?.message || 'Domain search is not available at this time.'
  } finally {
    loading.value = false
  }
}

const addDomain = async (result: DomainResult) => {
  if (locked.value || domainInCart(result.domain)) return

  await addItem({
    id: `domain-${result.domain}`,
    type: 'domain',
    name: result.domain,
    price: result.price,
    period: 1,
    periodLabel: '1 Year',
    meta: { domain: result.domain, tld: result.tld },
  })
}

const quickAdd = async (ext: TldEntry) => {
  const sld = normalizeSearch()
  if (!sld) {
    notice.value = 'Type a name first, then click an extension.'
    return
  }

  const domain = `${sld}${ext.tld}`
  if (domainInCart(domain) || locked.value) return

  await addItem({
    id: `domain-${domain}`,
    type: 'domain',
    name: domain,
    price: ext.price,
    period: 1,
    periodLabel: '1 Year',
    meta: { domain, tld: ext.tld },
  })
}

onMounted(async () => {
  try {
    // Laravel API: GET /api/products/grouped → domain products in data.domain
    const res = await $fetch(`${config.public.apiBase}/products/grouped`) as {
      data?: { domain?: Array<{ id: string; name: string; price: string; specifications?: { tld?: string } }> }
      extensions?: TldEntry[]
    }
    const domainProducts = res?.data?.domain ?? res?.extensions
    if (Array.isArray(domainProducts) && domainProducts.length) {
      // Map domain products to TldEntry format if they look like TLD products
      const popularTlds = new Set(['.com', '.net', '.org', '.io', '.co'])
      const mapped = domainProducts
        .map((p: any) => ({
          tld:     p.specifications?.tld || p.slug?.replace('domain-', '.') || '',
          price:   parseFloat(p.price) || 0,
          popular: p.featured ?? popularTlds.has(p.specifications?.tld ?? ''),
        }))
        .filter((e) => e.tld)
      if (mapped.length) {
        extensions.value = mapped
        return
      }
    }
  } catch {}
  extensions.value = [...domainTlds]
})
</script>

<template>
  <div class="bg-white dark:bg-slate-950">

    <!-- ───── HERO ───── -->
    <section class="relative overflow-hidden bg-[#020617]">
      <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-40" />
      <div class="absolute -left-48 -top-32 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
      <div class="absolute -right-48 top-10 h-[400px] w-[400px] rounded-full bg-emerald-500/8 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 animate-enter anim-d0">
            <span class="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span class="text-xs font-semibold text-amber-400">100+ TLDs · Instant registration · WHMCS managed</span>
          </div>

          <h1 class="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl animate-enter anim-d0">
            Find your perfect
            <br />
            <span class="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">domain name.</span>
          </h1>

          <p class="mt-6 text-lg leading-8 text-slate-400 animate-enter anim-d100">
            Search availability across 100+ extensions. Add your domain to the same cart as hosting or VPS.
          </p>
        </div>

        <!-- Search box -->
        <div class="mx-auto mt-10 max-w-2xl animate-enter anim-d200">
          <div class="flex overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 transition">
            <input
              v-model.trim="search"
              class="min-h-14 flex-1 bg-transparent px-5 text-base text-white placeholder-slate-500 outline-none"
              placeholder="yourbrand"
              @keyup.enter="searchDomain"
            />
            <span class="flex items-center px-4 text-slate-500 text-sm">.com</span>
            <button
              type="button"
              class="m-1.5 rounded-xl bg-amber-500 px-6 text-sm font-bold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="searchDomain"
            >
              {{ loading ? 'Searching…' : 'Search' }}
            </button>
          </div>

          <p v-if="notice" class="mt-3 text-center text-sm text-amber-400">{{ notice }}</p>
          <p v-if="error" class="mt-3 text-center text-sm text-rose-400">{{ error }}</p>
        </div>
      </div>
    </section>

    <!-- ───── SEARCH RESULTS ───── -->
    <section v-if="loading || results.length" class="border-b border-slate-200 px-4 py-10 dark:border-slate-800 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
        </div>

        <!-- Results -->
        <div v-else class="space-y-3">
          <article
            v-for="result in results"
            :key="result.domain"
            class="flex flex-col gap-4 rounded-xl border p-5 transition sm:flex-row sm:items-center sm:justify-between"
            :class="result.available
              ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="result.available ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-slate-100 dark:bg-slate-800'">
                <svg v-if="result.available" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <svg v-else class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 class="font-black text-slate-950 dark:text-white">{{ result.domain }}</h2>
                <p class="text-sm text-slate-500">${{ result.price.toFixed(2) }}/year</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="rounded-full px-3 py-1 text-xs font-black"
                :class="result.available
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'">
                {{ result.available ? '✓ Available' : '✗ Taken' }}
              </span>
              <button
                v-if="result.available"
                type="button"
                class="rounded-xl px-4 py-2 text-sm font-bold transition"
                :class="domainInCart(result.domain)
                  ? 'bg-emerald-600 text-white cursor-default'
                  : locked
                    ? 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'"
                :disabled="cartLocked"
                @click="addDomain(result)"
              >
                {{ domainInCart(result.domain) ? '✓ Added' : 'Add to Cart' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ───── TLD BROWSER ───── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Extensions</p>
            <h2 class="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Browse domain extensions</h2>
            <p class="mt-3 text-base text-slate-600 dark:text-slate-400">
              Type a name above and click any extension to add it directly to your cart.
            </p>
          </div>
          <!-- Category filter -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="rounded-full px-4 py-1.5 text-xs font-bold capitalize transition"
              :class="activeCategory === cat
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900'"
              @click="activeCategory = cat"
            >{{ cat }}</button>
          </div>
        </div>

        <div class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            v-for="(ext, i) in filteredExtensions"
            :key="ext.tld"
            type="button"
            class="group flex items-center justify-between rounded-2xl border bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:bg-slate-900 animate-enter"
            :style="{ animationDelay: `${Math.min(i, 7) * 60}ms` }"
            :class="domainInCart(`${normalizeSearch()}${ext.tld}`) && search
              ? 'border-emerald-300 dark:border-emerald-500/40'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-500/30'"
            @click="quickAdd(ext)"
          >
            <div>
              <div class="flex items-center gap-2">
                <p class="text-xl font-black text-slate-950 dark:text-white">{{ ext.tld }}</p>
                <span v-if="ext.popular" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  Popular
                </span>
              </div>
              <p class="mt-1 text-sm font-bold text-slate-950 dark:text-white">${{ ext.price.toFixed(2) }}<span class="text-xs font-normal text-slate-400">/yr</span></p>
              <p v-if="ext.renew" class="text-[11px] text-slate-400">Renew ${{ ext.renew.toFixed(2) }}/yr</p>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition group-hover:bg-amber-500 group-hover:text-white dark:bg-slate-800">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- ───── TRUST STRIP ───── -->
    <section class="border-y border-slate-200 bg-amber-50 px-4 py-5 dark:border-slate-800 dark:bg-amber-500/5 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <dl class="grid grid-cols-2 sm:grid-cols-4">
          <div v-for="(stat, i) in [
            { value: '100+', label: 'Domain extensions' },
            { value: '< 60s', label: 'Avg. activation time' },
            { value: 'Free', label: 'DNS hosting included' },
            { value: '24/7', label: 'Domain support' },
          ]" :key="stat.label"
            class="flex flex-col items-center py-3 text-center"
            :class="i < 3 ? 'border-r border-amber-200 dark:border-amber-500/20' : ''"
          >
            <dd class="text-xl font-black text-slate-950 dark:text-white">{{ stat.value }}</dd>
            <dt class="mt-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">{{ stat.label }}</dt>
          </div>
        </dl>
      </div>
    </section>

    <!-- ───── WHY ───── -->
    <section class="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(item, i) in [
            { label: 'WHMCS managed', desc: 'Renewals, transfers, DNS, and WHOIS managed through your client area.' },
            { label: 'Instant activation', desc: 'Most domain registrations complete in under 60 seconds.' },
            { label: 'DNS included', desc: 'Point to any nameserver or use our DNS hosting. No extra charge.' },
            { label: 'Bundle with hosting', desc: 'Add hosting and your domain to the same cart. One invoice.' },
          ]" :key="item.label" class="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 animate-enter"
            :style="{ animationDelay: `${i * 75}ms` }">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 class="mt-4 font-bold text-slate-950 dark:text-white">{{ item.label }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── CTA ───── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="relative overflow-hidden rounded-3xl bg-[#020617] p-10 text-center">
          <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-30" />
          <div class="absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div class="relative">
            <h2 class="text-3xl font-black text-white">Ready to register?</h2>
            <p class="mt-3 text-slate-400">Search a domain name above, or go straight to cart if you've already added one.</p>
            <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <NuxtLink to="/cart" class="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-400">
                View Cart
              </NuxtLink>
              <NuxtLink to="/hosting" class="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800">
                Bundle with Hosting →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
