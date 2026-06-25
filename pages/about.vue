<script setup lang="ts">
import SectionHeader from '~/components/Ui/SectionHeader.vue'

useSeoMeta({
  title: 'About Bilinix — Hosting Made Simpler',
  description: 'Bilinix brings hosting, domains, VPS, billing, and support into one connected experience. Learn about our values and approach.',
  ogTitle: 'About Bilinix Hosting',
  ogDescription: 'Hosting, domains, VPS, billing, and support in one calm flow.',
})

const values = [
  { title: 'Clear buying paths', description: 'Customers should understand what they are ordering before they reach checkout.' },
  { title: 'Operational calm', description: 'Dashboards should support repeated work without noisy decoration.' },
  { title: 'Room to grow', description: 'Hosting, domains, VPS, billing, and support belong in one connected experience.' }
]
</script>

<template>
  <main class="bg-white dark:bg-slate-950">
    <section class="border-b border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="About"
          title="Beeliin is built to make hosting feel easier to manage."
          description="The product brings service ordering, domain registration, VPS management, and billing into one calmer flow."
          align="center"
        />
      </div>
    </section>

    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        <article v-for="value in values" :key="value.title" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 class="text-xl font-black text-slate-950 dark:text-white">{{ value.title }}</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ value.description }}</p>
        </article>
      </div>
    </section>
  </main>
</template>
