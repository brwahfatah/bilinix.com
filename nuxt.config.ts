export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/animations.css'],

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
    // NOWPayments — server-only secrets
    nowpaymentsApiKey: '',     // NUXT_NOWPAYMENTS_API_KEY
    nowpaymentsIpnSecret: '',  // NUXT_NOWPAYMENTS_IPN_SECRET
    // Set to 'fake' to skip all WHMCS calls (matches Laravel WHMCS_DRIVER=fake)
    whmcsDriver: 'whmcs',      // NUXT_WHMCS_DRIVER
    // HestiaCP provisioning — creates hosting accounts after payment
    hestiaApiUrl: '',          // NUXT_HESTIA_API_URL  e.g. https://207.180.243.94:8083/api/
    hestiaApiKey: '',          // NUXT_HESTIA_API_KEY  (v-generate-api-key output)
    hestiaAdminUser: 'admin',  // NUXT_HESTIA_ADMIN_USER
    public: {
      apiBase: 'http://localhost:8000/api',
      appName: 'Beeliin Hosting',
      appEnv: 'development',
      enableDevMocks: false,
      // Payment feature flags
      enableStripe: false,       // NUXT_PUBLIC_ENABLE_STRIPE
      enableNowPayments: true,   // NUXT_PUBLIC_ENABLE_NOWPAYMENTS
    },
  },

  // Dashboard is fully auth-gated and relies on client-side localStorage for auth.
  // Server-rendering dashboard routes produces hydration mismatches because the
  // auth store (usePermissions, initials, displayName) has no data during SSR.
  // Disabling SSR for /dashboard/** prevents the layout from being server-rendered
  // and eliminates all hydration mismatches on these routes.
  routeRules: {
    '/dashboard/**': { ssr: false },
  },

  vite: {
    server: {
      hmr: {
        port: 24700,
      },
    },
  },
})
