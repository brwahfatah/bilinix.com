import { computed, watch } from 'vue'
import { useRuntimeConfig } from '#app'

export type CartItem = {
  id: string
  type: 'domain' | 'server' | 'hosting' | 'dedicated'
  name: string
  price: number
  quantity?: number
  period: number
  periodLabel?: string
  meta?: Record<string, any>
  plan_id?: number
}

// Convert a period in months to a Laravel billing_cycle string
function periodToBillingCycle(period: number): string {
  if (period <= 1) return 'monthly'
  if (period === 3) return 'quarterly'
  if (period === 6) return 'semiannually'
  if (period === 12) return 'annually'
  return 'monthly'
}

export const useCart = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  /* ------------------------------------------------------------------ */
  /* 🔐 AUTH + CART HEADERS */
  /* ------------------------------------------------------------------ */
  const getHeaders = (cartToken?: string): Record<string, string> => {
    const h: Record<string, string> = { Accept: 'application/json' }
    if (!import.meta.client) return h

    const auth = useAuthStore()
    if (auth.token) h['Authorization'] = `Bearer ${auth.token}`
    if (cartToken) h['X-Cart-Token'] = cartToken

    return h
  }

  /* ------------------------------------------------------------------ */
  /* 🌍 GLOBAL STATE */
  /* ------------------------------------------------------------------ */
  const items = useState<CartItem[]>('GLOBAL_CART_ITEMS', () => [])
  const locked = useState<boolean>('GLOBAL_CART_LOCKED', () => false)
  const lastAction = useState<'add' | 'remove' | null>('GLOBAL_CART_LAST_ACTION', () => null)

  /* ------------------------------------------------------------------ */
  /* 🔑 CART TOKEN (ALWAYS EXISTS) */
  /* ------------------------------------------------------------------ */
  const cartToken = useState<string>('CART_TOKEN', () => {
    if (!import.meta.client) return ''
    let token = localStorage.getItem('cart_token')
    if (!token) {
      token = crypto.randomUUID()
      localStorage.setItem('cart_token', token)
    }
    return token
  })

  /* ------------------------------------------------------------------ */
  /* 🧠 LOAD ITEMS FROM LOCALSTORAGE */
  /* ------------------------------------------------------------------ */
  if (import.meta.client && items.value.length === 0) {
    try {
      const saved = localStorage.getItem('cart_items')
      if (saved) items.value = JSON.parse(saved)
    } catch {
      items.value = []
    }
  }

  /* ------------------------------------------------------------------ */
  /* 💾 SYNC WITH BACKEND
     The Laravel cart API tracks items per session token in the database.
     On each change we persist to localStorage (fast/offline) and do not
     call the backend eagerly — we sync at checkout time.
  */
  /* ------------------------------------------------------------------ */
  const saveLocal = () => {
    if (import.meta.client) {
      localStorage.setItem('cart_items', JSON.stringify(items.value))
    }
  }

  watch(items, saveLocal, { deep: true })

  /* ------------------------------------------------------------------ */
  /* 🔁 DUPLICATE DETECTION */
  /* ------------------------------------------------------------------ */
  const isSameItem = (a: CartItem, b: CartItem) => {
    if (a.type !== b.type) return false
    if (a.type === 'domain') {
      return a.meta?.domain === b.meta?.domain &&
             a.meta?.tld === b.meta?.tld &&
             a.period === b.period
    }
    return a.meta?.plan_id === b.meta?.plan_id &&
           a.meta?.hostname === b.meta?.hostname &&
           a.period === b.period
  }

  /* ------------------------------------------------------------------ */
  /* ➕ ADD ITEM */
  /* ------------------------------------------------------------------ */
  const addItem = async (item: CartItem) => {
    if (locked.value) return

    const existing = items.value.find(i => isSameItem(i, item))
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1)
    } else {
      items.value.push({ ...item, quantity: item.quantity ?? 1 })
    }

    lastAction.value = 'add'
    saveLocal()
  }

  /* ------------------------------------------------------------------ */
  /* ❌ REMOVE ITEM */
  /* ------------------------------------------------------------------ */
  const removeItem = async (id: string, period?: number) => {
    if (locked.value) return

    items.value = items.value.filter(i => {
      if (i.id !== id) return true
      if (period === undefined) return false
      return i.period !== period
    })

    lastAction.value = 'remove'
    saveLocal()
  }

  /* ------------------------------------------------------------------ */
  /* 🧹 CLEAR CART */
  /* ------------------------------------------------------------------ */
  const clearCart = (opts: { full?: boolean; force?: boolean } = {}) => {
    if (locked.value && !opts.force) return

    items.value = []
    lastAction.value = null
    locked.value = false

    if (import.meta.client) {
      try { localStorage.removeItem('cart_items') } catch {}

      if (opts.full) {
        try { localStorage.removeItem('cart_token') } catch {}
        try {
          const newToken = crypto.randomUUID()
          cartToken.value = newToken
          localStorage.setItem('cart_token', newToken)
        } catch {}
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* 🔒 LOCK / UNLOCK */
  /* ------------------------------------------------------------------ */
  const lockCart = () => (locked.value = true)
  const unlockCart = () => (locked.value = false)

  /* ------------------------------------------------------------------ */
  /* 🔢 COMPUTED */
  /* ------------------------------------------------------------------ */
  const count = computed(() => items.value.reduce((s, i) => s + (i.quantity || 1), 0))
  const total = computed(() => items.value.reduce((s, i) => s + i.price * (i.quantity || 1), 0))

  /* ------------------------------------------------------------------ */
  /* 🚀 PREPARE CART
     Pushes all localStorage items to the Laravel cart so the server has
     the current state before checkout. Clears the server cart first to
     avoid duplicates from earlier sessions.
  */
  /* ------------------------------------------------------------------ */
  const prepareCart = async (): Promise<{ cart_token: string }> => {
    if (!import.meta.client) throw new Error('Client only')

    if (!cartToken.value) {
      const newToken = crypto.randomUUID()
      cartToken.value = newToken
      localStorage.setItem('cart_token', newToken)
    }

    const headers = getHeaders(cartToken.value)

    // Clear server-side cart so we start fresh
    try {
      await $fetch(`${base}/cart`, { method: 'DELETE', headers })
    } catch {
      // Ignore — cart may not exist on server yet
    }

    // Re-add every item from localStorage
    for (const item of items.value) {
      await $fetch(`${base}/cart/items`, {
        method: 'POST',
        headers,
        body: {
          product_id:    item.id,
          name:          item.name,
          type:          item.type,
          billing_cycle: periodToBillingCycle(item.period),
          quantity:      item.quantity ?? 1,
          unit_price:    item.price,
        },
      })
    }

    lockCart()
    return { cart_token: cartToken.value }
  }

  /* ------------------------------------------------------------------ */
  /* 💳 CHECKOUT
     Sends current cart token to the order checkout endpoint. The backend
     converts the cart into a pending order + invoice.
  */
  /* ------------------------------------------------------------------ */
  const checkout = async () => {
    if (!import.meta.client) throw new Error('Client only')

    try {
      return await $fetch(`${base}/orders/checkout`, {
        method: 'POST',
        headers: getHeaders(cartToken.value),
      })
    } catch (e) {
      console.error('Checkout failed', e)
      throw e
    }
  }

  /* ------------------------------------------------------------------ */
  /* Legacy syncCart — kept for backward compat; now a no-op */
  /* ------------------------------------------------------------------ */
  const syncCart = async () => { /* handled at checkout via prepareCart */ }

  return {
    items,
    count,
    total,
    locked,
    lastAction,
    cartToken,

    addItem,
    removeItem,
    clearCart,
    lockCart,
    unlockCart,

    prepareCart,
    checkout,
    syncCart,
  }
}
