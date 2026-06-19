<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const auth = useAuthStore()
const loading = ref(false)
const showPass = ref(false)
const showConfirm = ref(false)

const form = ref({ name: '', email: '', password: '', confirmPassword: '' })
const errors = ref({ name: '', email: '', password: '', confirmPassword: '', server: '' })

// Pre-fill email from signup draft saved by login page
onMounted(() => {
  try {
    const draft = JSON.parse(localStorage.getItem('signupDraft') || '{}')
    if (draft.email) form.value.email = draft.email
  } catch {}
})

// Debounced draft save (email only, never password)
let draftTimer: ReturnType<typeof setTimeout> | null = null
function saveDraft() {
  if (draftTimer) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    try { localStorage.setItem('signupDraft', JSON.stringify({ email: form.value.email })) } catch {}
  }, 600)
}

function validateName() {
  errors.value.name = form.value.name.trim().length < 2 ? 'Full name is required.' : ''
}
function validateEmail() {
  if (!form.value.email) errors.value.email = 'Email is required.'
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) errors.value.email = 'Invalid email address.'
  else errors.value.email = ''
}
function validatePassword() {
  if (!form.value.password) errors.value.password = 'Password is required.'
  else if (form.value.password.length < 8) errors.value.password = 'Minimum 8 characters.'
  else errors.value.password = ''
}
function validateConfirm() {
  errors.value.confirmPassword = form.value.confirmPassword === form.value.password
    ? ''
    : 'Passwords do not match.'
}

async function submit() {
  validateName()
  validateEmail()
  validatePassword()
  validateConfirm()
  if (errors.value.name || errors.value.email || errors.value.password || errors.value.confirmPassword) return

  loading.value = true
  errors.value.server = ''
  try {
    await auth.register(form.value.name.trim(), form.value.email, form.value.password)
    try { localStorage.removeItem('signupDraft') } catch {}
    await navigateTo('/dashboard')
  } catch (e: any) {
    errors.value.server = e?.data?.message || e?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Password strength
function passwordStrength(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500']
const passwordScore = computed(() => passwordStrength(form.value.password))
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div class="mx-auto grid min-h-screen max-w-6xl items-center lg:grid-cols-[1fr_1fr]">

      <!-- Left panel (desktop only) -->
      <div class="relative hidden overflow-hidden bg-[#020617] lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-10">
        <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-30" />
        <div class="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-3xl" />
        <div class="absolute -bottom-32 -right-32 h-[300px] w-[300px] rounded-full bg-emerald-500/8 blur-3xl" />

        <div class="relative">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white">B</span>
            <span class="text-[15px] font-black text-white">Beeliin</span>
          </NuxtLink>
        </div>

        <div class="relative">
          <h2 class="text-3xl font-black leading-snug text-white">
            One account.<br />
            <span class="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              All your services.
            </span>
          </h2>
          <p class="mt-4 text-sm leading-6 text-slate-400">
            Register once and manage VPS, domains, dedicated servers, and hosting from your client dashboard.
          </p>
          <div class="mt-8 rounded-xl bg-slate-900 p-5 space-y-3">
            <p class="text-sm font-bold text-white">After signup you can:</p>
            <ul class="space-y-2.5">
              <li
                v-for="item in [
                  'Order VPS and dedicated servers',
                  'Register and manage domains',
                  'View invoices and billing history',
                  'Open support tickets'
                ]"
                :key="item"
                class="flex items-center gap-2.5"
              >
                <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <svg class="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span class="text-sm text-slate-300">{{ item }}</span>
              </li>
            </ul>
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
            <h1 class="text-3xl font-black text-slate-950 dark:text-white">Create account</h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Already have one?
              <NuxtLink to="/auth/login" class="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                Sign in
              </NuxtLink>
            </p>
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="submit">

            <!-- Full name -->
            <AppFormField for="name" label="Full name" :error="errors.name" required>
              <AppInput
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="Your full name"
                :error="!!errors.name"
                @blur="validateName"
              />
            </AppFormField>

            <!-- Email -->
            <AppFormField for="email" label="Email address" :error="errors.email" required>
              <AppInput
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                :error="!!errors.email"
                @blur="validateEmail"
                @input="saveDraft"
              />
            </AppFormField>

            <!-- Password -->
            <AppFormField for="password" label="Password" :error="errors.password" required>
              <AppInput
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Min. 8 characters"
                :error="!!errors.password"
                @blur="validatePassword"
              >
                <template #trailing>
                  <button
                    type="button"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    @click="showPass = !showPass"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path v-if="!showPass" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                </template>
              </AppInput>

              <!-- Strength meter -->
              <div v-if="form.password" class="mt-2 space-y-1.5">
                <div class="flex gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="i <= passwordScore
                      ? strengthColor[passwordScore]
                      : 'bg-slate-200 dark:bg-slate-800'"
                  />
                </div>
                <p
                  class="text-[11px] font-semibold"
                  :class="['', 'text-rose-500', 'text-amber-500', 'text-sky-500', 'text-emerald-500'][passwordScore]"
                >
                  {{ strengthLabel[passwordScore] }}
                </p>
              </div>
            </AppFormField>

            <!-- Confirm password -->
            <AppFormField for="confirm" label="Confirm password" :error="errors.confirmPassword" required>
              <AppInput
                id="confirm"
                v-model="form.confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Repeat your password"
                :error="!!errors.confirmPassword"
                @blur="validateConfirm"
              >
                <template #trailing>
                  <button
                    type="button"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    @click="showConfirm = !showConfirm"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </button>
                </template>
              </AppInput>
            </AppFormField>

            <!-- Server error -->
            <div
              v-if="errors.server"
              class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-400/20 dark:bg-rose-400/10"
            >
              <p class="text-sm text-rose-700 dark:text-rose-300">{{ errors.server }}</p>
            </div>

            <AppButton type="submit" variant="primary" size="lg" full :loading="loading">
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </AppButton>

            <p class="text-center text-xs text-slate-500 dark:text-slate-400">
              By registering you agree to our
              <a href="#" class="underline hover:text-slate-700">Terms of Service</a>
              and
              <a href="#" class="underline hover:text-slate-700">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>
