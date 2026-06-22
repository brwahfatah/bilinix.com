<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { hostingPlans } from '~/data/site'
import { useCart } from '~/composables/useCart'

useSeoMeta({
  title: 'Shared Web Hosting with cPanel — from $2.99/mo | Beeliin',
  description: 'Shared hosting with cPanel, free SSL certificate, NVMe SSD storage, and automated backups. Plans for personal sites, growing businesses, and agencies.',
  ogTitle: 'Shared Web Hosting from $2.99/mo | Beeliin',
  ogDescription: 'cPanel hosting with free SSL, NVMe SSD, and daily backups. Personal to agency plans starting at $2.99/mo.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Web Hosting from $2.99/mo | Beeliin',
  twitterDescription: 'cPanel hosting with free SSL, NVMe SSD, and daily backups. Personal to agency plans.',
})

const router = useRouter()
const { addItem, items } = useCart()

const billing = ref<'monthly' | 'yearly'>('monthly')

const computedPlans = computed(() =>
  hostingPlans.map((plan) => ({
    ...plan,
    price: billing.value === 'monthly' ? plan.monthly : plan.yearly,
  }))
)

const planInCart = (planId: number) =>
  items.value.some((item) => item.type === 'server' && item.meta?.whmcs_product_id === planId)

const selectPlan = async (plan: (typeof computedPlans.value)[0]) => {
  if (planInCart(plan.id)) {
    router.push('/cart')
    return
  }

  await addItem({
    id: `hosting-${plan.id}-${billing.value}`,
    type: 'server',
    name: `${plan.name} Hosting`,
    price: plan.price,
    period: billing.value === 'yearly' ? 12 : 1,
    periodLabel: billing.value === 'yearly' ? 'Yearly' : 'Monthly',
    meta: {
      whmcs_product_id: plan.whmcs_product_id || plan.id,
      plan_id: plan.id,
      product_type: 'hosting',
    },
  })

  router.push('/cart')
}

const compareRows = [
  { label: 'Websites', starter: '1', business: '10', agency: 'Unlimited' },
  { label: 'NVMe SSD Storage', starter: '50 GB', business: '150 GB', agency: '300 GB' },
  { label: 'Bandwidth', starter: '100 GB', business: 'Unmetered', agency: 'Unmetered' },
  { label: 'Email Accounts', starter: '10', business: '50', agency: 'Unlimited' },
  { label: 'MySQL Databases', starter: '5', business: 'Unlimited', agency: 'Unlimited' },
  { label: 'Free SSL Certificate', starter: 'check', business: 'check', agency: 'check' },
  { label: 'cPanel Included', starter: 'check', business: 'check', agency: 'check' },
  { label: 'FTP Access', starter: 'check', business: 'check', agency: 'check' },
  { label: 'Backups', starter: 'Weekly', business: 'Daily', agency: 'Daily' },
  { label: 'Dedicated IP', starter: 'cross', business: 'cross', agency: 'check' },
  { label: 'Priority Support', starter: 'cross', business: 'check', agency: 'check' },
]

const techFeatures = [
  { icon: 'lightning', title: 'NVMe SSD Storage', desc: 'Up to 10× faster than traditional HDD. Every plan ships with NVMe storage.' },
  { icon: 'cpanel', title: 'cPanel Included', desc: 'The industry-standard control panel. Manage files, databases, email, and more.' },
  { icon: 'ssl', title: 'Free SSL Certificate', desc: 'Let\'s Encrypt SSL provisioned automatically. HTTPS on day one.' },
  { icon: 'mail', title: 'Professional Email', desc: 'Create mailboxes on your domain. Works with Outlook, Gmail, and any mail client.' },
  { icon: 'backup', title: 'Automatic Backups', desc: 'Daily and weekly backups depending on plan. One-click restore from cPanel.' },
  { icon: 'wp', title: 'WordPress Ready', desc: 'One-click WordPress install. Optimized PHP settings for maximum WP performance.' },
]
</script>

<template>
  <div class="bg-white dark:bg-slate-950">

    <!-- ───── HERO ───── -->
    <section class="relative overflow-hidden bg-[#020617]">
      <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-40" />
      <div class="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
      <div class="absolute -right-48 top-16 h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:grid lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-10 lg:px-8">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 animate-enter anim-d0">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span class="text-xs font-semibold text-emerald-400">cPanel · NVMe SSD · Free SSL</span>
          </div>

          <h1 class="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl animate-enter anim-d0">
            Shared Hosting
            <br />
            <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">done right.</span>
          </h1>

          <p class="mt-6 text-lg leading-8 text-slate-400 animate-enter anim-d100">
            Plans built for personal blogs, business websites, and agency client work. cPanel included, backups automated, SSL free.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row animate-enter anim-d200">
            <NuxtLink to="/auth/signup" class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-glow transition hover:bg-emerald-400">
              Get Started
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" /></svg>
            </NuxtLink>
            <NuxtLink to="/domains" class="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
              Search Domain Name
            </NuxtLink>
          </div>

          <!-- Trust badges -->
          <div class="mt-10 flex flex-wrap items-center gap-4 animate-enter anim-d200">
            <span class="flex items-center gap-2 text-sm text-slate-400">
              <svg class="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              30-day money back
            </span>
            <span class="flex items-center gap-2 text-sm text-slate-400">
              <svg class="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              99.9% uptime SLA
            </span>
            <span class="flex items-center gap-2 text-sm text-slate-400">
              <svg class="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              24/7 support
            </span>
          </div>
        </div>

        <!-- Side panel: cPanel mock -->
        <div class="mt-12 hidden lg:block animate-enter anim-d300">
          <div class="animate-float rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
            <div class="flex items-center gap-2 bg-slate-950 px-4 py-3">
              <div class="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
              <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <div class="ml-2 text-[10px] text-slate-500">cPanel — File Manager</div>
            </div>
            <div class="p-5 space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div v-for="item in ['Files', 'Databases', 'Email', 'WordPress', 'SSL', 'Backups']" :key="item" class="flex flex-col items-center gap-2 rounded-xl bg-slate-950 p-3">
                  <div class="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <div class="h-3 w-3 rounded bg-emerald-400" />
                  </div>
                  <span class="text-[10px] font-semibold text-slate-400">{{ item }}</span>
                </div>
              </div>
              <div class="rounded-xl bg-slate-950 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Disk Usage</p>
                <div class="h-2 rounded-full bg-slate-800">
                  <div class="h-2 w-1/3 rounded-full bg-emerald-500" />
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-[10px] text-slate-500">14.2 GB used</span>
                  <span class="text-[10px] text-slate-500">50 GB total</span>
                </div>
              </div>
              <div class="rounded-xl bg-slate-950 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Active Domains</p>
                <div class="space-y-1.5">
                  <div v-for="d in ['mysite.com', 'blog.io', 'shop.store']" :key="d" class="flex items-center justify-between">
                    <span class="text-[11px] text-slate-300">{{ d }}</span>
                    <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">SSL ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── TECH FEATURES ───── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto max-w-2xl text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Included in all plans</p>
          <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Everything you need from day one</h2>
        </div>
        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feat, i) in techFeatures"
            :key="feat.title"
            class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 animate-enter"
            :style="{ animationDelay: `${i * 75}ms` }"
          >
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 class="mt-4 font-bold text-slate-950 dark:text-white">{{ feat.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── SOCIAL PROOF ───── -->
    <section class="px-4 py-14 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 dark:border-emerald-500/10 dark:bg-emerald-500/5">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-sm">
              <p class="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Trusted by 2,400+ businesses</p>
              <p class="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Businesses rely on Beeliin for hosting that just works.</p>
              <div class="mt-5 space-y-2.5">
                <span class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <svg class="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  99.9% uptime guarantee with SLA
                </span>
                <span class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <svg class="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Free SSL provisioned on day one
                </span>
                <span class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <svg class="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Daily backups — one-click restore
                </span>
                <span class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <svg class="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  24/7 support via client area
                </span>
              </div>
            </div>
            <figure class="max-w-md flex-1">
              <div class="flex gap-0.5 mb-3" aria-label="5 out of 5 stars">
                <svg v-for="i in 5" :key="i" class="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <blockquote class="text-base leading-7 text-slate-700 dark:text-slate-300">
                "Switched from a crowded shared server. Beeliin's hosting plans are transparent — free SSL was provisioned automatically and cPanel was ready immediately. Very smooth experience."
              </blockquote>
              <figcaption class="mt-5 flex items-center gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                  <span class="text-xs font-black text-emerald-700 dark:text-emerald-400">LB</span>
                </div>
                <div>
                  <p class="font-bold text-slate-950 dark:text-white">Lena Brandt</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Operations Lead, Brandhaus</p>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── PRICING ───── -->
    <section id="pricing" class="border-y border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Pricing</p>
            <h2 class="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Simple, honest plans</h2>
          </div>
          <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              class="rounded-lg px-5 py-2 text-sm font-bold transition"
              :class="billing === 'monthly' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'"
              @click="billing = 'monthly'"
            >Monthly</button>
            <button
              type="button"
              class="relative rounded-lg px-5 py-2 text-sm font-bold transition"
              :class="billing === 'yearly' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500'"
              @click="billing = 'yearly'"
            >
              Annual
              <span class="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">-20%</span>
            </button>
          </div>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-3">
          <article
            v-for="(plan, i) in computedPlans"
            :key="plan.id"
            class="relative flex flex-col rounded-2xl border p-7 shadow-card transition hover:shadow-card-hover animate-enter"
            :style="{ animationDelay: `${400 + i * 75}ms` }"
            :class="plan.popular
              ? 'border-emerald-500/70 bg-slate-950 text-white ring-2 ring-emerald-500/50'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'"
          >
            <div v-if="plan.badge" class="absolute -top-3.5 left-6">
              <span class="rounded-full px-3 py-1 text-xs font-black"
                :class="plan.popular ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'">
                {{ plan.badge }}
              </span>
            </div>

            <div>
              <p class="text-xs font-black uppercase tracking-widest"
                :class="plan.popular ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'">
                {{ plan.name }}
              </p>
              <p class="mt-1.5 text-sm"
                :class="plan.popular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-500'">
                {{ plan.tagline }}
              </p>
            </div>

            <div class="mt-7 flex items-end gap-1">
              <span class="text-5xl font-black tabular-nums"
                :class="plan.popular ? 'text-white' : 'text-slate-950 dark:text-white'">
                ${{ plan.price.toFixed(2) }}
              </span>
              <span class="mb-1.5 text-sm font-semibold text-slate-400">/{{ billing === 'yearly' ? 'yr' : 'mo' }}</span>
            </div>
            <p v-if="billing === 'yearly'" class="mt-1 text-xs text-emerald-400">
              Save ${{ ((plan.monthly * 12) - plan.yearly).toFixed(2) }} annually
            </p>

            <ul class="mt-7 flex-1 space-y-2.5">
              <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2.5 text-sm">
                <svg class="mt-0.5 h-4 w-4 shrink-0"
                  :class="plan.popular ? 'text-emerald-400' : 'text-emerald-500 dark:text-emerald-400'"
                  fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span :class="plan.popular ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'">{{ feat }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="mt-7 w-full rounded-xl py-3.5 text-sm font-bold transition"
              :class="planInCart(plan.id)
                ? 'bg-emerald-700 text-white'
                : plan.popular
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                  : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'"
              @click="selectPlan(plan)"
            >
              {{ planInCart(plan.id) ? 'View Cart →' : 'Get Started' }}
            </button>
            <a
              href="#compare"
              class="mt-2 block text-center text-xs transition"
              :class="plan.popular ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
            >
              Compare all features ↓
            </a>
          </article>
        </div>

        <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          All plans include free domain for the first year on annual billing.
          <NuxtLink to="/domains" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Check domain pricing →</NuxtLink>
        </p>
      </div>
    </section>

    <!-- ───── COMPARE TABLE ───── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Compare</p>
          <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Full plan comparison</h2>
        </div>

        <div class="mt-10 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900">
                <th class="py-4 pl-6 pr-4 text-left font-bold text-slate-700 dark:text-slate-300">Feature</th>
                <th v-for="plan in hostingPlans" :key="plan.id" class="px-4 py-4 text-center font-black"
                  :class="plan.popular ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-950 dark:text-white'">
                  {{ plan.name }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="row in compareRows" :key="row.label" class="bg-white transition hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900">
                <td class="py-3.5 pl-6 pr-4 font-medium text-slate-700 dark:text-slate-300">{{ row.label }}</td>
                <td v-for="(val, col) in [row.starter, row.business, row.agency]" :key="col" class="px-4 py-3.5 text-center">
                  <svg v-if="val === 'check'" class="mx-auto h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <svg v-else-if="val === 'cross'" class="mx-auto h-5 w-5 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span v-else class="text-slate-700 dark:text-slate-300">{{ val }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ───── CTA ───── -->
    <section class="px-4 pb-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="relative overflow-hidden rounded-3xl bg-[#020617] p-10 text-center">
          <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-30" />
          <div class="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div class="relative">
            <h2 class="text-3xl font-black text-white">Start hosting in minutes.</h2>
            <p class="mt-3 text-slate-400">Pick a plan, register your domain, and your site can be live today.</p>
            <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#pricing" class="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-400">
                Choose a plan
              </a>
              <NuxtLink to="/vps" class="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800">
                Need more power? Try VPS →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
