export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const auth = useAuthStore()
  if (!auth.token) auth.hydrate()

  if (!auth.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  if (!auth.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
})
