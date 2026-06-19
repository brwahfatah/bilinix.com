// Global types for Vue SFCs and Nuxt helpers
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '#app' {
  export * from 'nuxt/dist/app'
}

// Provide basic declarations for Nuxt auto-imported helpers used across the app
declare function definePageMeta(meta: any): void
declare function navigateTo(path: string): Promise<void>
declare function useRuntimeConfig(): any
declare const $fetch: any
