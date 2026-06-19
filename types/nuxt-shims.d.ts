// Lightweight shims to help the TypeScript server resolve Nuxt/Vue auto-imports

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '#app' {
  export function useRuntimeConfig(): any
  export function navigateTo(url: any): Promise<any>
  export function defineNuxtRouteMiddleware(fn: any): any
  export function useState<T = any>(key: string, init?: () => T): { value: T }
}

// Global helpers often auto-imported by Nuxt
declare function definePageMeta(meta: any): void
declare function navigateTo(url: any): Promise<any>
declare function useRuntimeConfig(): any
declare function defineNuxtRouteMiddleware(fn: any): any
declare function useState<T = any>(key: string, init?: () => T): { value: T }
declare const $fetch: any

declare function useAuth(): any
declare function useCart(): any

// Wildcard module declarations for Nuxt alias imports
declare module '~/*' {
  const component: any
  export default component
}

declare module '#components' {
  const components: any
  export default components
}

// Additional wildcard declarations for components folders (cover nested paths)
declare module '*components/*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*components/*/*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*components/*/*/*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
