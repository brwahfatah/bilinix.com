<script setup lang="ts">
import SectionHeader from '~/components/Ui/SectionHeader.vue'

useSeoMeta({
  title: 'Terms of Service | Bilinix Hosting',
  description: 'Bilinix Hosting terms of service covering account responsibilities, acceptable use, billing, data handling, and service level agreements.',
  ogTitle: 'Terms of Service | Bilinix Hosting',
})

const lastUpdated = '2026-06-25'
</script>

<template>
  <main class="bg-white dark:bg-slate-950">
    <section class="border-b border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Legal"
          title="Terms of Service"
          :description="`Last updated: ${lastUpdated}`"
          align="center"
        />
      </div>
    </section>

    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div class="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Bilinix Hosting services, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.</p>

        <h2>2. Services</h2>
        <p>Bilinix provides shared hosting, cloud VPS, dedicated servers, and domain registration services. Service specifications, uptime guarantees, and resource limits are described on the relevant product pages and in your service agreement.</p>

        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an account. You agree not to share your account access with unauthorized third parties.</p>

        <h2>4. Acceptable Use</h2>
        <p>You may not use Bilinix services to host content that is illegal, infringes intellectual property rights, distributes malware, sends unsolicited email (spam), or engages in denial-of-service attacks. We reserve the right to suspend or terminate accounts that violate this policy.</p>

        <h2>5. Payment and Billing</h2>
        <p>Services are billed in advance on a recurring basis. You agree to pay all fees associated with your selected plan. Failure to pay may result in suspension or termination of services. Refunds are handled on a case-by-case basis within 30 days of purchase.</p>

        <h2>6. Service Level Agreement</h2>
        <p>Bilinix targets 99.9% network uptime for all hosting services. Scheduled maintenance windows are excluded from uptime calculations. Downtime credits are applied to your account upon request if uptime falls below the guaranteed threshold.</p>

        <h2>7. Data and Backups</h2>
        <p>You are responsible for maintaining your own backups. While Bilinix performs periodic server-level backups, these are for disaster recovery and are not guaranteed. We strongly recommend using independent backup solutions.</p>

        <h2>8. Limitation of Liability</h2>
        <p>Bilinix is not liable for indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for the affected service in the preceding 12 months.</p>

        <h2>9. Termination</h2>
        <p>Either party may terminate the service agreement at any time. Upon termination, your data will be retained for 30 days before permanent deletion. You may request an export of your data during this period.</p>

        <h2>10. Changes to Terms</h2>
        <p>Bilinix may update these terms at any time. Material changes will be communicated via email or dashboard notification at least 14 days before taking effect. Continued use of services constitutes acceptance of the updated terms.</p>

        <h2>11. Contact</h2>
        <p>For questions about these terms, contact us at <NuxtLink to="/contact" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">our contact page</NuxtLink>.</p>
      </div>
    </section>
  </main>
</template>
