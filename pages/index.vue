<script setup lang="ts">
import { computed, ref } from 'vue'
import { heroMetrics, homeFeatures, hostingPlans, testimonials } from '~/data/site'

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
  <div class="overflow-hidden bg-white dark:bg-slate-950">
    <section class="relative border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Hosting, VPS, domains, and billing in one client flow
          </p>
          <h1 class="mt-5 text-4xl font-black tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
            Modern hosting that feels calm to run.
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Beeliin helps customers launch sites, register domains, deploy VPS servers, and manage invoices without a cluttered control-panel experience.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/vps" class="inline-flex justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
              Explore VPS Plans
            </NuxtLink>
            <NuxtLink to="/domains" class="inline-flex justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-white dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900">
              Search Domains
            </NuxtLink>
          </div>

          <dl class="mt-10 grid gap-4 sm:grid-cols-3">
            <div v-for="metric in heroMetrics" :key="metric.label" class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {{ metric.label }}
              </dt>
              <dd class="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {{ metric.value }}
              </dd>
              <dd class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ metric.detail }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="relative">
          <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
            <!-- Inline SVG animation: stylized server rack + moving cloud + blinking LEDs -->
            <div class="aspect-[4/3] w-full rounded-lg overflow-hidden bg-black hero-svg-wrapper">
              <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated server illustration">
                <defs>
                  <linearGradient id="gradBg" x1="0" x2="1">
                    <stop offset="0%" stop-color="#0f172a" />
                    <stop offset="100%" stop-color="#071026" />
                  </linearGradient>
                  <linearGradient id="rackGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0b1220" />
                    <stop offset="100%" stop-color="#111827" />
                  </linearGradient>
                </defs>

                <rect width="800" height="600" fill="url(#gradBg)" />

                <!-- moving cloud -->
                <g id="clouds" transform="translate(-200,40)">
                  <g class="cloud" opacity="0.95" transform="translate(0,0)">
                    <ellipse cx="220" cy="80" rx="90" ry="34" fill="#0ea5a4" opacity="0.12" />
                    <ellipse cx="280" cy="68" rx="60" ry="26" fill="#38bdf8" opacity="0.08" />
                    <ellipse cx="160" cy="72" rx="60" ry="26" fill="#7dd3fc" opacity="0.06" />
                  </g>
                  <g class="cloud" transform="translate(280,40)">
                    <ellipse cx="220" cy="80" rx="90" ry="34" fill="#60a5fa" opacity="0.08" />
                    <ellipse cx="280" cy="68" rx="60" ry="26" fill="#38bdf8" opacity="0.06" />
                    <ellipse cx="160" cy="72" rx="60" ry="26" fill="#06b6d4" opacity="0.05" />
                  </g>
                </g>

                <!-- server rack -->
                <g transform="translate(170,120)">
                  <rect x="0" y="0" width="460" height="320" rx="18" ry="18" fill="url(#rackGrad)" stroke="#111827" stroke-opacity="0.6" />

                  <!-- rack units -->
                  <g fill="#0f1724" transform="translate(28,26)">
                    <rect x="0" y="0" width="404" height="44" rx="8" />
                    <rect x="0" y="64" width="404" height="44" rx="8" />
                    <rect x="0" y="128" width="404" height="44" rx="8" />
                    <rect x="0" y="192" width="404" height="44" rx="8" />
                  </g>

                  <!-- LEDs (animated) -->
                  <g id="leds" transform="translate(360,36)">
                    <circle cx="0" cy="8" r="6" fill="#10b981" class="led1" />
                    <circle cx="0" cy="72" r="6" fill="#34d399" class="led2" />
                    <circle cx="0" cy="136" r="6" fill="#60a5fa" class="led3" />
                    <circle cx="0" cy="200" r="6" fill="#f97316" class="led4" />
                  </g>

                  <!-- tiny network lines -->
                  <g stroke="#063c2f" stroke-width="2" transform="translate(36,40)">
                    <path d="M0 200 L100 200" stroke-opacity="0.18" />
                    <path d="M0 136 L130 136" stroke-opacity="0.12" />
                    <path d="M0 72 L150 72" stroke-opacity="0.10" />
                  </g>

                  <!-- overlay subtle glow -->
                  <rect x="24" y="18" width="412" height="284" rx="14" fill="none" stroke="#06b6d4" opacity="0.02" />
                  </g>

                  <!-- decorative animated pulses -->
                  <g>
                    <circle cx="640" cy="420" r="20" fill="#06b6d4" opacity="0.06" class="pulse1" />
                    <circle cx="580" cy="460" r="14" fill="#34d399" opacity="0.05" class="pulse2" />
                  </g>
              </svg>
              <!-- fallback image for older browsers -->
              <img src="/vps-dashboard.png" alt="Beeliin VPS dashboard preview" class="hidden" />
            </div>
          </div>
          <div class="absolute -bottom-5 left-5 right-5 rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:left-auto sm:w-72">
            <p class="text-sm font-semibold text-slate-950 dark:text-white">Resource overview</p>
            <div class="mt-3 space-y-3">
              <div>
                <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>CPU</span>
                  <span>45%</span>
                </div>
                <div class="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div class="h-2 w-[45%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Memory</span>
                  <span>62%</span>
                </div>
                <div class="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div class="h-2 w-[62%] rounded-full bg-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

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

<style scoped>
/* SVG-scoped animations moved out of the inline SVG (Vue client components cannot have <style> inside templates) */
@keyframes cloudMove { 0% { transform: translateX(-220px);} 50% { transform: translateX(20px);} 100% { transform: translateX(-220px);} }
@keyframes ledBlink { 0% { opacity: 0.15; transform: scale(0.9);} 50% { opacity: 1; transform: scale(1.15);} 100% { opacity: 0.15; transform: scale(0.9);} }
@keyframes pulse { 0% { r: 8; opacity: 0.18; } 70% { r: 44; opacity: 0; } 100% { r: 8; opacity: 0; } }

/* Apply animations to SVG elements by class or ID */
#clouds { animation: cloudMove 12s linear infinite; }
.led1 { animation: ledBlink 1.8s ease-in-out infinite; transform-origin: center; }
.led2 { animation: ledBlink 2.6s ease-in-out 0.3s infinite; transform-origin: center; }
.led3 { animation: ledBlink 2.2s ease-in-out 0.6s infinite; transform-origin: center; }
.led4 { animation: ledBlink 3s ease-in-out 0.9s infinite; transform-origin: center; }
.pulse1 { animation: pulse 2.8s ease-out infinite; transform-origin: center; }
.pulse2 { animation: pulse 3.6s ease-out 0.6s infinite; transform-origin: center; }

/* Ensure the SVG scales cleanly inside the card */
.hero-svg-wrapper svg { display: block; width: 100%; height: 100%; }
</style>
