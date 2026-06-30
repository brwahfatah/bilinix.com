<script setup lang="ts">
import SectionHeader from '~/components/Ui/SectionHeader.vue'
import { homeFeatures } from '~/data/site'

useSeoMeta({
  title: 'Features — Everything in One Platform | Bilinix Hosting',
  description: 'Explore all Bilinix features: VPS management, domain registration, billing, support tickets, and more in a single unified dashboard.',
  ogTitle: 'Features | Bilinix Hosting',
})

const workflow = [
  'Search or choose a product',
  'Configure the service',
  'Review the cart',
  'Create an invoice',
  'Manage from the client area'
]
</script>

<template>
  <main class="bg-white dark:bg-slate-950">
    <section class="border-b border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Features"
          title="Everything important is connected."
          description="Bilinix is structured around practical workflows: order services, manage them, and keep billing readable."
          align="center"
        />
      </div>
    </section>

    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        <article v-for="feature in homeFeatures" :key="feature.title" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 class="text-xl font-black text-slate-950 dark:text-white">{{ feature.title }}</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section class="border-t border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <SectionHeader title="A cleaner customer workflow" align="center" />
        <ol class="mt-10 grid gap-3">
          <li v-for="(step, index) in workflow" :key="step" class="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">{{ index + 1 }}</span>
            <span class="font-bold text-slate-950 dark:text-white">{{ step }}</span>
          </li>
        </ol>
      </div>
    </section>
  </main>
</template>
