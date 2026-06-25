<script setup lang="ts">
import SectionHeader from '~/components/Ui/SectionHeader.vue'

useSeoMeta({
  title: 'Contact Us | Bilinix Hosting',
  description: 'Get in touch with Bilinix Hosting. Email support, open a ticket, or learn about our response times.',
  ogTitle: 'Contact Bilinix Hosting',
})
</script>

<template>
  <main class="bg-white dark:bg-slate-950">
    <section class="border-b border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Support"
          title="Get in Touch"
          description="Have a question about our services? We are here to help."
          align="center"
        />
      </div>
    </section>

    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        <article class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 class="mt-4 text-lg font-bold text-slate-950 dark:text-white">Email</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">For general inquiries and sales questions.</p>
          <a href="mailto:support@bilinix.com" class="mt-3 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">support@bilinix.com</a>
        </article>

        <article class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
          </div>
          <h2 class="mt-4 text-lg font-bold text-slate-950 dark:text-white">Support Tickets</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">For existing customers with technical or billing issues.</p>
          <NuxtLink to="/dashboard/support/new" class="mt-3 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">Open a Ticket</NuxtLink>
        </article>

        <article class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 class="mt-4 text-lg font-bold text-slate-950 dark:text-white">Response Times</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">We aim to respond within 2 hours during business hours (09:00 &ndash; 18:00 UTC).</p>
          <p class="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Critical issues: 30 minutes</p>
        </article>
      </div>
    </section>
  </main>
</template>
