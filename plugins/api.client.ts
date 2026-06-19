// Registers global error handlers and base URL into the api $fetch instance.
// Runs client-side only — Pinia and navigateTo are available here.

const TOKEN_KEY = 'auth_token'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Wire up the Laravel API base URL so all service calls use the correct origin
  setApiBaseUrl(config.public.apiBase)

  const auth = useAuthStore()
  const notify = useNotificationStore()

  setApiErrorHandler((status: number) => {
    if (status === 401) {
      auth.$patch({ token: null, user: null })
      localStorage.removeItem(TOKEN_KEY)
      navigateTo('/auth/login')
      return
    }
    if (status >= 500) {
      notify.push({
        type: 'error',
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again.',
        duration: 6000,
      })
    }
  })
})
