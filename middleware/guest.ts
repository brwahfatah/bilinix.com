import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  if (!auth.token) auth.hydrate()

  if (auth.isAuthenticated) {
    const raw = to.query?.redirect
    const redirectPath = Array.isArray(raw) ? raw[0] : (raw ?? '/dashboard')
    return navigateTo(redirectPath as string)
  }
})
