<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const { updateProfile, changePassword, logoutEverywhere, isLoading } = useAccountActions()

// ── Profile form ────────────────────────────────────────────────────────────
const profileForm = ref({ name: auth.user?.name ?? '' })
const profileError = ref('')
const profileSaving = ref(false)

async function saveProfile() {
  if (!profileForm.value.name.trim()) {
    profileError.value = 'Display name cannot be empty.'
    return
  }
  profileError.value = ''
  profileSaving.value = true
  await updateProfile(profileForm.value.name)
  profileSaving.value = false
}

// Sync form if user changes elsewhere in the session
watch(() => auth.user?.name, (v) => { if (v) profileForm.value.name = v })

// ── Password form ────────────────────────────────────────────────────────────
const passwordForm  = ref({ current: '', newPass: '', confirm: '' })
const passwordErrors = ref({ current: '', newPass: '', confirm: '', server: '' })
const passwordSaving = ref(false)
const showCurrent = ref(false)
const showNew     = ref(false)

function validatePasswordForm(): boolean {
  passwordErrors.value.current = passwordForm.value.current  ? '' : 'Current password is required.'
  passwordErrors.value.newPass = passwordForm.value.newPass.length >= 8 ? '' : 'Minimum 8 characters.'
  passwordErrors.value.confirm = passwordForm.value.confirm === passwordForm.value.newPass
    ? ''
    : 'Passwords do not match.'
  return !passwordErrors.value.current && !passwordErrors.value.newPass && !passwordErrors.value.confirm
}

async function savePassword() {
  if (!validatePasswordForm()) return
  passwordErrors.value.server = ''
  passwordSaving.value = true
  const ok = await changePassword(passwordForm.value.current, passwordForm.value.newPass)
  passwordSaving.value = false
  if (ok) {
    // Reset form on success
    passwordForm.value = { current: '', newPass: '', confirm: '' }
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
const newPasswordScore = computed(() => passwordStrength(passwordForm.value.newPass))
</script>

<template>
  <div class="space-y-8">

    <!-- Header -->
    <div>
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Account</p>
      <h1 class="mt-1 text-3xl font-black text-slate-950 dark:text-white">Settings</h1>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Manage your profile, security, and session preferences.
      </p>
    </div>

    <div class="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div class="space-y-6">

        <!-- ── Profile ─────────────────────────────────────────────────────── -->
        <AppCard title="Profile" description="Your public display name and contact information.">
          <form class="space-y-5" @submit.prevent="saveProfile">

            <!-- Avatar preview -->
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white">
                {{ auth.initials }}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-950 dark:text-white">{{ auth.displayName }}</p>
                <p class="text-xs text-slate-400">Avatar is auto-generated from your initials</p>
              </div>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <!-- Display name -->
              <AppFormField for="display-name" label="Display name" :error="profileError" required>
                <AppInput
                  id="display-name"
                  v-model="profileForm.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Your full name"
                  :error="!!profileError"
                />
              </AppFormField>

              <!-- Email (read-only) -->
              <AppFormField for="email-readonly" label="Email address" hint="Contact support to change your email.">
                <AppInput
                  id="email-readonly"
                  :model-value="auth.displayEmail"
                  type="email"
                  disabled
                />
              </AppFormField>
            </div>

            <div class="flex justify-end">
              <AppButton type="submit" variant="primary" size="sm" :loading="profileSaving">
                Save changes
              </AppButton>
            </div>
          </form>
        </AppCard>

        <!-- ── Security ───────────────────────────────────────────────────── -->
        <AppCard title="Change Password" description="Use a strong, unique password you don't use elsewhere.">
          <form class="space-y-5" @submit.prevent="savePassword">

            <!-- Current password -->
            <AppFormField for="current-pw" label="Current password" :error="passwordErrors.current" required>
              <AppInput
                id="current-pw"
                v-model="passwordForm.current"
                :type="showCurrent ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter current password"
                :error="!!passwordErrors.current"
              >
                <template #trailing>
                  <button
                    type="button"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    @click="showCurrent = !showCurrent"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        :d="showCurrent
                          ? 'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
                          : 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'"
                      />
                    </svg>
                  </button>
                </template>
              </AppInput>
            </AppFormField>

            <!-- New password + strength -->
            <AppFormField for="new-pw" label="New password" :error="passwordErrors.newPass" required>
              <AppInput
                id="new-pw"
                v-model="passwordForm.newPass"
                :type="showNew ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Min. 8 characters"
                :error="!!passwordErrors.newPass"
              >
                <template #trailing>
                  <button
                    type="button"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    @click="showNew = !showNew"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </button>
                </template>
              </AppInput>
              <!-- Strength meter -->
              <div v-if="passwordForm.newPass" class="mt-2 space-y-1">
                <div class="flex gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="i <= newPasswordScore
                      ? strengthColor[newPasswordScore]
                      : 'bg-slate-200 dark:bg-slate-800'"
                  />
                </div>
                <p class="text-[11px] font-semibold"
                  :class="['', 'text-rose-500', 'text-amber-500', 'text-sky-500', 'text-emerald-500'][newPasswordScore]">
                  {{ strengthLabel[newPasswordScore] }}
                </p>
              </div>
            </AppFormField>

            <!-- Confirm new password -->
            <AppFormField for="confirm-pw" label="Confirm new password" :error="passwordErrors.confirm" required>
              <AppInput
                id="confirm-pw"
                v-model="passwordForm.confirm"
                type="password"
                autocomplete="new-password"
                placeholder="Repeat new password"
                :error="!!passwordErrors.confirm"
              />
            </AppFormField>

            <div class="flex justify-end">
              <AppButton type="submit" variant="primary" size="sm" :loading="passwordSaving">
                Update password
              </AppButton>
            </div>
          </form>
        </AppCard>

        <!-- ── Danger Zone ─────────────────────────────────────────────────── -->
        <AppCard title="Sessions" description="Revoke access to your account on all other devices.">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-slate-950 dark:text-white">Log out everywhere</p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Invalidates all active sessions including this one.
              </p>
            </div>
            <AppButton variant="danger" size="sm" @click="logoutEverywhere">
              Log out all devices
            </AppButton>
          </div>
        </AppCard>

      </div>

      <!-- Sidebar: account info summary -->
      <aside class="space-y-5">
        <AppCard title="Account details" padding="md">
          <div class="space-y-4">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Account ID</p>
              <p class="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                {{ auth.user?.id ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</p>
              <p class="mt-1 text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
                {{ auth.user?.role ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
              <p class="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-300">
                {{ auth.displayEmail }}
              </p>
            </div>
          </div>
        </AppCard>

        <AppCard title="Security tips" padding="md">
          <ul class="space-y-3">
            <li
              v-for="tip in [
                'Use a unique password for this account.',
                'Enable 2FA when it becomes available.',
                'Never share your login credentials.',
              ]"
              :key="tip"
              class="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400"
            >
              <svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </AppCard>
      </aside>
    </div>

  </div>
</template>
