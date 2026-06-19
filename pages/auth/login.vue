<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({ middleware: 'guest' })

const route = useRoute()
const auth = useAuthStore()
const loading = ref(false)

const form = ref({ email: '', password: '' })
const errors = ref({ email: '', password: '', server: '' })
const showPass = ref(false)
const resetState = ref<'idle' | 'loading' | 'sent'>('idle')

onMounted(() => {
  try {
    const draft = JSON.parse(localStorage.getItem('signupDraft') || '{}')
    if (draft.email) form.value.email = draft.email
  } catch {}
})

const validateEmail = () => {
  if (!form.value.email) errors.value.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) errors.value.email = 'Invalid email address'
  else errors.value.email = ''
}

const validatePassword = () => {
  errors.value.password = form.value.password ? '' : 'Password is required'
}

const handleForgotPassword = async () => {
  validateEmail()
  if (errors.value.email) return
  if (!form.value.email) {
    errors.value.email = 'Enter your email above to reset your password'
    return
  }
  resetState.value = 'loading'
  try {
    await auth.forgotPassword(form.value.email)
    resetState.value = 'sent'
  } catch {
    resetState.value = 'idle'
    errors.value.server = 'Could not send reset email. Please try again.'
  }
}

const submit = async () => {
  validateEmail()
  validatePassword()
  if (errors.value.email || errors.value.password) return

  loading.value = true
  errors.value.server = ''

  try {
    await auth.login(form.value.email, form.value.password)
    const raw = route.query.redirect
    const redirectPath = Array.isArray(raw) ? raw[0] : (raw || '/dashboard')
    await navigateTo(redirectPath as string)
  } catch (err: any) {
    if (err?.data?.errors) {
      errors.value.email = err.data.errors.email?.[0] || ''
      errors.value.password = err.data.errors.password?.[0] || ''
    } else {
      errors.value.server = err?.data?.message || err?.message || 'Invalid credentials. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div class="mx-auto grid min-h-screen max-w-6xl items-center gap-0 lg:grid-cols-[1fr_1fr]">

      <!-- Left panel (desktop) -->
      <div class="relative hidden overflow-hidden bg-[#020617] lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-10">
        <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-30" />
        <div class="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div class="absolute -bottom-32 -right-32 h-[300px] w-[300px] rounded-full bg-cyan-500/8 blur-3xl" />

        <div class="relative">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white">B</span>
            <span class="text-[15px] font-black text-white">Beeliin</span>
          </NuxtLink>
        </div>

        <div class="relative">
          <h2 class="text-3xl font-black leading-snug text-white">
            Welcome back to<br />
            <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">your client area.</span>
          </h2>
          <p class="mt-4 text-sm leading-6 text-slate-400">
            Manage VPS servers, domain registrations, invoices, and hosting accounts from one dashboard.
          </p>

          <div class="mt-8 space-y-3">
            <div v-for="item in [
              'Instant access to services and billing',
              'Cart preserved from your last session',
              'VPS controls and live monitoring'
            ]" :key="item" class="flex items-center gap-3">
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <svg class="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <span class="text-sm text-slate-300">{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="relative">
          <p class="text-xs text-slate-600">© {{ new Date().getFullYear() }} Beeliin Hosting</p>
        </div>
      </div>

      <!-- Right panel: form -->
      <div class="flex min-h-screen items-center justify-center p-8 lg:min-h-0">
        <div class="w-full max-w-sm">
          <!-- Mobile logo -->
          <NuxtLink to="/" class="mb-8 flex items-center gap-2.5 lg:hidden">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white">B</span>
            <span class="text-[15px] font-black text-slate-950 dark:text-white">Beeliin</span>
          </NuxtLink>

          <div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white">Sign in</h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              New here?
              <NuxtLink to="/auth/signup" class="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                Create an account
              </NuxtLink>
            </p>
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="submit">
            <!-- Email -->
            <AppFormField for="email" label="Email address" :error="errors.email">
              <AppInput
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                :error="!!errors.email"
                @blur="validateEmail"
              />
            </AppFormField>

            <!-- Password -->
            <AppFormField for="password" label="Password" :error="errors.password">
              <template #label-action>
                <button
                  v-if="resetState !== 'sent'"
                  type="button"
                  :disabled="resetState === 'loading'"
                  class="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
                  @click="handleForgotPassword"
                >
                  {{ resetState === 'loading' ? 'Sending…' : 'Forgot password?' }}
                </button>
                <span v-else class="text-xs text-emerald-600 dark:text-emerald-400">
                  Reset email sent!
                </span>
              </template>
              <AppInput
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                :error="!!errors.password"
                @blur="validatePassword"
              >
                <template #trailing>
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    tabindex="-1"
                    @click="showPass = !showPass"
                  >
                    <svg v-if="!showPass" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                </template>
              </AppInput>
            </AppFormField>

            <!-- Server error -->
            <div v-if="errors.server" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-400/20 dark:bg-rose-400/10">
              <p class="text-sm text-rose-700 dark:text-rose-300">{{ errors.server }}</p>
            </div>

            <AppButton type="submit" variant="primary" size="lg" full :loading="loading">
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </AppButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
