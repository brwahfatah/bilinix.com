import { createError, getRequestHeader, readBody } from 'h3'
import { callWhmcsApi } from '~/server/utils/whmcs'

const asNumber = (v: unknown, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const asString = (v: unknown, fallback = '') => {
  if (v === undefined || v === null) return fallback
  return String(v)
}

const VALID_HESTIA_PACKAGES = ['STARTER', 'BUSINESS', 'AGENCY'] as const

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const isFake = String(runtime.whmcsDriver) === 'fake'

  // Require a Bearer token (Sanctum token stored in browser localStorage)
  const authHeader = getRequestHeader(event, 'authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }

  let userEmail = ''

  if (!isFake) {
    // Production: verify the Sanctum token against the Laravel /auth/me endpoint
    // and capture the user's email for Hestia provisioning metadata
    const apiBase = asString(runtime.public.apiBase)
    try {
      const me = await $fetch<any>(`${apiBase}/auth/me`, {
        headers: { authorization: authHeader },
      })
      // Laravel /auth/me returns { data: { email } } or { user: { email } }
      userEmail = asString(me?.data?.email ?? me?.user?.email ?? me?.email ?? '').toLowerCase()
    } catch {
      throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
    }
  }

  const body = await readBody<{
    invoice_id?: string | number
    amount?: number
    // Dev/fake only: caller supplies email when auth is not validated server-side
    email?: string
    // Optional: triggers Hestia hosting provisioning after payment completes
    hosting_package?: string
    hosting_domain?: string
  }>(event)

  const invoiceId = asNumber(body?.invoice_id)
  if (!invoiceId) {
    throw createError({ statusCode: 422, statusMessage: 'invoice_id is required' })
  }

  // In fake mode accept email from the request body (no real session to validate)
  if (isFake && body?.email) {
    userEmail = asString(body.email).trim().toLowerCase()
  }

  const apiKey = asString(runtime.nowpaymentsApiKey)
  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Crypto payments are not configured' })
  }

  // NOWPayments enforces a minimum ~$18.82; guard at $20 to stay safely above it
  const NP_MIN_USD = 20

  let amount: number
  let invoiceNum: string

  if (isFake) {
    // Fake/dev mode: use amount from request body or default to $1.00 test
    amount = asNumber(body?.amount, 1.00)
    invoiceNum = `FAKE-${invoiceId}`
    console.log(`[NOWPayments][FAKE] Creating test payment for invoice #${invoiceId}, amount: $${amount}`)
  } else {
    const invoiceData = await callWhmcsApi('GetInvoice', { invoiceid: invoiceId })
    const inv = invoiceData as Record<string, any>
    invoiceNum = asString(inv.invoicenum || inv.number || String(invoiceId))
    amount = parseFloat(asString(inv.total || '0')) || 0
    if (amount <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invoice has no payable amount' })
    }
  }

  if (amount < NP_MIN_USD) {
    console.log(
      `[NOWPayments] Blocked invoice #${invoiceId}: amount $${amount} is below minimum $${NP_MIN_USD}`,
    )
    throw createError({
      statusCode: 400,
      statusMessage: `Minimum crypto payment is $${NP_MIN_USD}. This invoice total ($${amount}) is too low for crypto payments.`,
    })
  }

  // ── Hestia provisioning metadata ────────────────────────────────────────────
  // Store email + package now so the webhook can provision the account after
  // payment completes. We only store if all three conditions are met:
  //   1. A valid hosting package was requested
  //   2. We have the customer's email
  //   3. Hestia is configured (has apiUrl + apiKey)
  const hostingPackageRaw = asString(body?.hosting_package).toUpperCase()
  const hostingPackage = (VALID_HESTIA_PACKAGES as readonly string[]).includes(hostingPackageRaw)
    ? hostingPackageRaw
    : ''
  const hostingDomain = asString(body?.hosting_domain).trim().toLowerCase() || undefined

  const hestiaReady = !!(runtime.hestiaApiUrl && runtime.hestiaApiKey)

  if (hostingPackage && userEmail && hestiaReady) {
    const storage = useStorage('data')
    await storage.setItem(`hestia:pending:${invoiceId}`, {
      email: userEmail,
      package: hostingPackage,
      domain: hostingDomain,
      createdAt: Date.now(),
    })
    console.log(
      `[Hestia] Queued provisioning for invoice #${invoiceId}: ${userEmail} pkg=${hostingPackage}`,
    )
  }
  // ── End Hestia metadata ──────────────────────────────────────────────────────

  console.log(`[NOWPayments] Creating invoice #${invoiceId}, amount: $${amount}`)

  const nowPayment = (await $fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: String(invoiceId),
      order_description: `Invoice #${invoiceNum}`,
      ipn_callback_url: 'https://bilinix.com/api/payments/webhook/nowpayments',
      success_url: 'https://bilinix.com/dashboard/billing/invoices?payment=success',
      cancel_url: 'https://bilinix.com/dashboard/billing/invoices?payment=cancelled',
      is_fixed_rate: false,
      is_fee_paid_by_user: false,
    }),
  })) as { id: string; invoice_url: string }

  return {
    payment_url: nowPayment.invoice_url,
    payment_id: String(nowPayment.id),
    order_id: String(invoiceId),
    fake: isFake,
  }
})
