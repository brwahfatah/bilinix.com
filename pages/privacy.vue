<script setup lang="ts">
import SectionHeader from '~/components/Ui/SectionHeader.vue'

useSeoMeta({
  title: 'Privacy Policy | Bilinix Hosting',
  description: 'How Bilinix collects, uses, and protects your personal data. Covers data storage, cookies, third-party services, and your rights.',
  ogTitle: 'Privacy Policy | Bilinix Hosting',
})

const lastUpdated = '2026-06-25'
</script>

<template>
  <main class="bg-white dark:bg-slate-950">
    <section class="border-b border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Legal"
          title="Privacy Policy"
          :description="`Last updated: ${lastUpdated}`"
          align="center"
        />
      </div>
    </section>

    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div class="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly: name, email address, billing address, phone number, and payment information. We also collect technical data such as IP addresses, browser type, and usage patterns through server logs.</p>

        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to provide and maintain hosting services, process payments, send service-related communications, provide customer support, and comply with legal obligations. We do not sell your personal data to third parties.</p>

        <h2>3. Data Storage and Security</h2>
        <p>Your data is stored on servers located in Europe. We use industry-standard encryption for data in transit (TLS) and implement access controls to protect data at rest. Payment information is processed through PCI-compliant payment providers and is not stored on our servers.</p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following categories of third-party services to operate Bilinix:</p>
        <ul>
          <li><strong>Payment processing</strong> &mdash; to handle transactions securely</li>
          <li><strong>DNS and CDN</strong> &mdash; to serve and protect your websites</li>
          <li><strong>Email delivery</strong> &mdash; to send transactional notifications</li>
        </ul>
        <p>Each third-party processor is bound by their own privacy policy and data processing agreements.</p>

        <h2>5. Cookies</h2>
        <p>Bilinix uses essential cookies required for authentication and session management. We do not use advertising or tracking cookies. No data is shared with ad networks.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. You may also request a portable copy of your data. To exercise these rights, contact us through our support system or at our contact page.</p>

        <h2>7. Data Retention</h2>
        <p>Account data is retained for the duration of your service and for 30 days after account termination. Billing records are retained for 7 years to comply with financial regulations. Server logs are retained for 90 days.</p>

        <h2>8. Children</h2>
        <p>Bilinix services are not directed at individuals under the age of 18. We do not knowingly collect personal information from minors.</p>

        <h2>9. Changes to This Policy</h2>
        <p>We will notify you of material changes to this privacy policy via email or dashboard notification at least 14 days before the changes take effect.</p>

        <h2>10. Contact</h2>
        <p>For privacy-related inquiries, reach us at <NuxtLink to="/contact" class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">our contact page</NuxtLink>.</p>
      </div>
    </section>
  </main>
</template>
