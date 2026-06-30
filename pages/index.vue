<script setup lang="ts">
import { computed, ref } from 'vue'
import { homeFeatures, hostingPlans, testimonials, faqs } from '~/data/site'

useSeoMeta({
  title: 'Bilinix Hosting — Cloud VPS, Shared Hosting & Domains',
  description: 'High-performance VPS, shared hosting, dedicated servers, and domain registration. NVMe SSD, 99.9% uptime SLA, 24/7 support. Deploy in minutes.',
  ogTitle: 'Bilinix Hosting — Cloud VPS, Shared Hosting & Domains',
  ogDescription: 'High-performance VPS, shared hosting, dedicated servers, and domain registration. NVMe SSD, 99.9% uptime SLA.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Bilinix Hosting',
  twitterDescription: 'High-performance VPS, shared hosting, and domains. NVMe SSD, 99.9% uptime SLA, 24/7 support.',
})

const billing = ref<'monthly' | 'yearly'>('monthly')

const computedPlans = computed(() =>
  hostingPlans.map((plan) => ({
    ...plan,
    price: billing.value === 'monthly' ? plan.monthly : plan.yearly
  }))
)

const trustStats = [
  { value: '2,400+', label: 'Active Clients' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '12+', label: 'Global Datacenters' },
  { value: '24/7', label: 'Expert Support' },
]
</script>

<template>
  <div class="overflow-hidden">
    <MHeroSection />

    <!-- ───── TRUST STATS BAR ───── -->
    <section class="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <dl class="grid grid-cols-2 sm:grid-cols-4">
          <div
            v-for="(stat, i) in trustStats"
            :key="stat.label"
            class="flex flex-col items-center py-3 text-center"
            :class="i < trustStats.length - 1 ? 'border-r border-slate-200 dark:border-slate-800' : ''"
          >
            <dd class="text-2xl font-black text-slate-950 dark:text-white">{{ stat.value }}</dd>
            <dt class="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ stat.label }}</dt>
          </div>
        </dl>
      </div>
    </section>

    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
  <UiSectionHeader
          eyebrow="Platform"
          title="A cleaner path from order to operation"
          description="Public pages, cart, checkout, dashboard, and billing should feel connected. These are the core flows Bilinix is built around."
          align="center"
        />

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          <article v-for="feature in homeFeatures" :key="feature.title" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <svg v-if="feature.icon === 'bolt'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m13 2-9 13h8l-1 7 9-13h-8l1-7Z" />
              </svg>
              <svg v-else-if="feature.icon === 'panel'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 5h16v14H4zM4 10h16M9 10v9" />
              </svg>
              <svg v-else-if="feature.icon === 'server'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 7H3a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
              </svg>
              <svg v-else-if="feature.icon === 'billing'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2 10h20M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
              </svg>
              <svg v-else-if="feature.icon === 'scale'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
              </svg>
            </div>
            <h3 class="mt-5 text-lg font-bold text-slate-950 dark:text-white">{{ feature.title }}</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="border-y border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
  <UiSectionHeader
          eyebrow="Services"
          title="Choose the product path your customer needs"
          description="Keep hosting, VPS, and domains visible as separate choices while the cart and checkout tie them together."
        />
        <div class="grid gap-5 md:grid-cols-3">
          <NuxtLink to="/vps" class="group rounded-lg border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">VPS</p>
            <h3 class="mt-3 text-xl font-bold text-slate-950 dark:text-white">Deploy servers</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Plans for root access, NVMe storage, and scalable workloads.</p>
          </NuxtLink>
          <NuxtLink to="/domains" class="group rounded-lg border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Domains</p>
            <h3 class="mt-3 text-xl font-bold text-slate-950 dark:text-white">Register names</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Search availability and add the right TLD to checkout.</p>
          </NuxtLink>
          <NuxtLink to="/dashboard" class="group rounded-lg border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Client Area</p>
            <h3 class="mt-3 text-xl font-bold text-slate-950 dark:text-white">Manage accounts</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Services, invoices, support, and account links in one dashboard.</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section id="pricing" class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <UiSectionHeader
            eyebrow="Pricing"
            title="Hosting plans that are easy to compare"
            description="Keep the cards calm and readable so customers can make the buying decision quickly."
          />
          <div class="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              class="rounded-md px-4 py-2 text-sm font-semibold transition"
              :class="billing === 'monthly' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'"
              @click="billing = 'monthly'"
            >
              Monthly
            </button>
            <button
              type="button"
              class="rounded-md px-4 py-2 text-sm font-semibold transition"
              :class="billing === 'yearly' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'"
              @click="billing = 'yearly'"
            >
              Yearly
            </button>
          </div>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-3">
          <VPSPricingCard
            v-for="plan in computedPlans"
            :key="plan.name"
            :plan="plan"
            :billing="billing"
          />
        </div>
      </div>
    </section>

    <section class="border-y border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <UiSectionHeader
          eyebrow="Trusted by 2,400+ businesses"
          title="Teams that switched to Bilinix"
          description="Real businesses running production workloads on our infrastructure."
          align="center"
        />
        <div class="mt-10 grid gap-5 md:grid-cols-3">
          <figure v-for="testimonial in testimonials" :key="testimonial.name" class="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div class="flex gap-0.5" aria-label="5 out of 5 stars">
              <svg v-for="i in 5" :key="i" class="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <blockquote class="mt-4 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              "{{ testimonial.quote }}"
            </blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <span class="text-xs font-black text-emerald-700 dark:text-emerald-400">{{ testimonial.initials }}</span>
              </div>
              <div>
                <p class="font-bold text-slate-950 dark:text-white">{{ testimonial.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ testimonial.role }}{{ testimonial.company ? ', ' + testimonial.company : '' }}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <UiSectionHeader
          eyebrow="FAQ"
          title="Quick answers before checkout"
          description="The public pages should reduce hesitation before the customer reaches the cart."
        />
        <div class="space-y-3">
          <details v-for="faq in faqs" :key="faq.question" class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <summary class="cursor-pointer font-semibold text-slate-950 dark:text-white">
              {{ faq.question }}
            </summary>
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ faq.answer }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <section class="px-4 pb-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl rounded-xl bg-slate-950 px-6 py-12 text-center text-white dark:bg-white dark:text-slate-950">
        <h2 class="text-3xl font-black tracking-normal">Ready to get started?</h2>
        <p class="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
          Deploy a VPS in under 2 minutes, search a domain, or create your account and explore the full client area.
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/auth/signup" class="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600">
            Get Started Free
          </NuxtLink>
          <NuxtLink to="/vps" class="rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900">
            View Plans →
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

