<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()

// Restore session before any middleware or layout logic runs.
// Must run here so layout switching below is based on real auth state.
if (import.meta.client && !auth.token) {
  auth.hydrate()
}

// Layout selection: /checkout and /cart follow auth state.
// All other pages use their own definePageMeta({ layout }).
const layoutName = computed(() => {
  if (route.path === '/checkout' || route.path === '/cart') {
    return auth.isAuthenticated ? 'dashboard' : 'default'
  }
  return undefined
})
</script>

<template>
  <NuxtLayout :name="layoutName">
    <NuxtPage />
  </NuxtLayout>

  <!-- Global overlays — rendered outside NuxtLayout via Teleport -->
  <AppToastContainer />
  <AppModal />
</template>
