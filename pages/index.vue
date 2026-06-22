<script setup lang="ts">
import { computed, ref } from 'vue'
import { homeFeatures, hostingPlans, testimonials } from '~/data/site'

const billing = ref<'monthly' | 'yearly'>('monthly')

const computedPlans = computed(() =>
  hostingPlans.map((plan) => ({
    ...plan,
    price: billing.value === 'monthly' ? plan.monthly : plan.yearly
  }))
)

const faqs = [
  {
    question: 'Can I order hosting and domains together?',
    answer: 'Yes. You can add hosting, VPS plans, and domains to the cart before checkout.'
  },
  {
    question: 'Do VPS plans include full control?',
    answer: 'The VPS flow is built for root access, OS reinstall options, and transparent resource details.'
  },
  {
    question: 'Can I manage billing from the client area?',
    answer: 'Yes. The dashboard includes services, domains, invoices, and account links in one place.'
  }
]
</script>

<template>
  <div class="overflow-hidden">
    <MHeroSection />

    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
  <UiSectionHeader
          eyebrow="Platform"
          title="A cleaner path from order to operation"
          description="Public pages, cart, checkout, dashboard, and billing should feel connected. These are the core flows Beeliin is built around."
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
          eyebrow="Customers"
          title="Built for people who need hosting to feel manageable"
          align="center"
        />
        <div class="mt-10 grid gap-5 md:grid-cols-3">
          <figure v-for="testimonial in testimonials" :key="testimonial.name" class="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <blockquote class="text-sm leading-6 text-slate-600 dark:text-slate-300">
              "{{ testimonial.quote }}"
            </blockquote>
            <figcaption class="mt-5">
              <p class="font-bold text-slate-950 dark:text-white">{{ testimonial.name }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ testimonial.role }}</p>
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
        <h2 class="text-3xl font-black tracking-normal">Ready to build your hosting setup?</h2>
        <p class="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
          Start with VPS, search a domain, or go straight to the client area when you are ready to manage services.
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/vps" class="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600">
            View VPS Plans
          </NuxtLink>
          <NuxtLink to="/auth/signup" class="rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900">
            Create Account
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

