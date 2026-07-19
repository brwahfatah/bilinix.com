<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '~/composables/useCart'

const router = useRouter()
const auth = useAuthStore()
const { items, total, clearCart, prepareCart, checkout } = useCart()

const loading = ref(false)
const error = ref('')
const mode = ref<'login' | 'register'>('login')

const form = reactive({
  email: '',
  password: '',
  password_confirmation: ''
})

const cart = computed(() => items.value || [])
const cartEmpty = computed(() => cart.value.length === 0)
const isLoggedIn = computed(() => auth.isAuthenticated)
const formatPrice = (value: number) => Number(value || 0).toFixed(2)

onMounted(() => {
  if (cartEmpty.value) router.push('/cart')
})

const validateForm = () => {
  if (!form.email || !form.password) {
    error.value = 'Email and password are required'
    return false
  }

  if (mode.value === 'register' && form.password !== form.password_confirmation) {
    error.value = 'Passwords do not match'
    return false
  }

  return true
}

const placeOrder = async () => {
  if (loading.value || cartEmpty.value) return
  if (!isLoggedIn.value && !validateForm()) return

  loading.value = true
  error.value = ''

  try {
    if (!isLoggedIn.value) {
      if (mode.value === 'register') {
        // Derive a default display name from the email prefix during checkout registration
        const defaultName = form.email.split('@')[0] ?? 'Customer'
        await auth.register(defaultName, form.email, form.password)
      } else {
        await auth.login(form.email, form.password)
      }
    }

    await prepareCart()
    const res: any = await checkout()
    // Laravel order response: { data: { invoice_id, ... }, message }
    const invoiceId = res?.data?.invoice_id ?? res?.invoice?.id
    if (!invoiceId) throw new Error('Invoice creation failed')

    clearCart({ full: true, force: true })
    router.push(`/dashboard/billing/invoices/${invoiceId}`)
  } catch (e: any) {
    try {
      clearCart({ full: true, force: true })
    } catch {}
    error.value = e?.data?.message || e?.message || JSON.stringify(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl space-y-10">
      <UiPageHeader
        eyebrow="Checkout"
        title="Confirm and create your invoice"
        description="Sign in if needed, review the order one last time, then generate the invoice for provisioning."
      />

      <div class="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 class="text-xl font-black text-slate-950 dark:text-white">
            Account
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {{ isLoggedIn ? 'You are signed in and ready to place the order.' : 'Sign in or create an account to continue.' }}
          </p>

          <p v-if="error" class="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
            {{ error }}
          </p>

          <div v-if="!isLoggedIn" class="mt-6">
            <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                class="rounded-md px-4 py-2 text-sm font-bold transition"
                :class="mode === 'login' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'"
                @click="mode = 'login'"
              >
                Login
              </button>
              <button
                type="button"
                class="rounded-md px-4 py-2 text-sm font-bold transition"
                :class="mode === 'register' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'"
                @click="mode = 'register'"
              >
                Register
              </button>
            </div>

            <div class="mt-6 space-y-4">
              <AppFormField for="co-email" label="Email">
                <AppInput
                  id="co-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                />
              </AppFormField>
              <AppFormField for="co-password" label="Password">
                <AppInput
                  id="co-password"
                  v-model="form.password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                />
              </AppFormField>
              <AppFormField v-if="mode === 'register'" for="co-confirm" label="Confirm password">
                <AppInput
                  id="co-confirm"
                  v-model="form.password_confirmation"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Repeat your password"
                />
              </AppFormField>
            </div>
          </div>

          <button
            type="button"
            class="mt-8 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading || cartEmpty"
            @click="placeOrder"
          >
            {{ loading ? 'Creating invoice...' : (isLoggedIn ? 'Create Invoice' : 'Place Order') }}
          </button>
        </section>

        <aside class="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 class="text-xl font-black text-slate-950 dark:text-white">
            Order Summary
          </h2>

          <div class="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
            <div v-for="item in cart" :key="`${item.id}-${item.period}`" class="flex justify-between gap-4 py-4">
              <div>
                <p class="font-bold text-slate-950 dark:text-white">{{ item.name }}</p>
                <p class="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {{ item.type }} · {{ item.periodLabel || `${item.period} months` }}
                </p>
              </div>
              <p class="font-black text-slate-950 dark:text-white">${{ formatPrice(item.price * (item.quantity || 1)) }}</p>
            </div>
          </div>

          <div class="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
            <div class="flex justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span>${{ formatPrice(total) }}</span>
            </div>
            <div class="mt-4 flex justify-between text-2xl font-black text-slate-950 dark:text-white">
              <span>Total</span>
              <span>${{ formatPrice(total) }}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>
