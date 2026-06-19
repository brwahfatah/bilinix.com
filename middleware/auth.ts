import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  // Auth relies on client-side localStorage. Allow SSR pass-through;
  // the client will redirect after hydration if not authenticated.
  if (import.meta.server) return

  const auth = useAuthStore()

  // Restore session from localStorage on first client-side run
  if (!auth.token) auth.hydrate()

  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
})
