export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  // ---------------------------------------------------------------------------
  // Auto-imports
  // ---------------------------------------------------------------------------
  imports: {
    dirs: [
      // Global stores
      'stores',
      // Feature-level stores and composables (composables own all orchestration)
      'features/*/store',
      'features/*/composables',
    ],
  },

  // ---------------------------------------------------------------------------
  // Components
  // CRITICAL: marketing VPS components (components/VPS/) and dashboard VPS
  // components (features/vps/components/) must have DIFFERENT prefixes to avoid
  // name collisions. Marketing components get prefix 'M', feature components
  // get no prefix (their names already include the feature noun: VpsTable etc.)
  // ---------------------------------------------------------------------------
  components: [
    // Shared UI primitives — no prefix: UiPageHeader, UiStatePanel...
    { path: '~/components/Ui', pathPrefix: false, prefix: 'Ui' },

    // Marketing / public-facing components — prefix 'M' to namespace them
    // MCartBadge, MDarkToggle, MVpsCard, MDomainCard, MNavbar, MFooter...
    { path: '~/components', pathPrefix: false, prefix: 'M' },

    // Core UI system — no prefix: AppButton, AppDataTable, AppInput...
    { path: '~/core/ui', pathPrefix: false },

    // Feature components — no prefix: VpsTable, VpsStatusBadge, VpsPowerPanel...
    { path: '~/features', pattern: '**/components/*.vue', pathPrefix: false },
  ],

  runtimeConfig: {
    // Server-only — set via environment variables, never exposed to the client
    whmcsApiUrl: '',           // e.g. https://billing.beeliin.com/includes/api.php
    whmcsApiIdentifier: '',    // WHMCS API identifier
    whmcsApiSecret: '',        // WHMCS API secret
    whmcsAccessKey: '',        // WHMCS access key (optional)
    whmcsTokenSecret: '',      // Secret for signing session tokens (min 32 chars)
    // Department IDs in WHMCS — match to your actual department setup
    whmcsDeptTechnical: 1,
    whmcsDeptBilling: 2,
    whmcsDeptSales: 3,
    whmcsDeptGeneral: 4,
    public: {
      apiBase: 'http://localhost:8000/api',
      appName: 'Beeliin Hosting',
      appEnv: 'development',
      enableDevMocks: false,
    },
  },

  vite: {
    server: {
      hmr: {
        port: 24700,
      },
    },
  },
})
