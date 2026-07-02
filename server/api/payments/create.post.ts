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

  const authHeader = getRequestHeader(event, 'authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }

  let userEmail = ''

  if (!isFake) {
    const apiBase = asString(runtime.public.apiBase)
    try {
      const me = (await $fetch(`${apiBase}/auth/me`, {
        headers: { authorization: authHeader },
      })) as Record<string, any>
      userEmail = asString(me?.data?.email ?? me?.user?.email ?? me?.email ?? '').toLowerCase()
    } catch {
      throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
    }
  }

  const body = await readBody<{
    invoice_id?: string | number
    amount?: number
    email?: string
    hosting_package?: string
    hosting_domain?: string
  }>(event)

  const invoiceId = asNumber(body?.invoice_id)
  if (!invoiceId) {
    throw createError({ statusCode: 422, statusMessage: 'invoice_id is required' })
  }

  if (isFake && body?.email) {
    userEmail = asString(body.email).trim().toLowerCase()
  }

  const apiKey = asString(runtime.nowpaymentsApiKey)
  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Crypto payments are not configured' })
  }

  let amount: number
  let invoiceNum: string

  if (isFake) {
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

  // ── Hestia provisioning metadata ────────────────────────────────────────────
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

  console.log(`[NOWPayments] Creating invoice #${invoiceId}, amount: $${amount}`)

  // Send amount in USD, do NOT force a pay_currency — the payer selects
  // their coin/network on the NOWPayments payment page. Low-minimum coins
  // (USDT-TRC20, LTC, TRX, XLM) become available automatically.
  // is_fee_paid_by_user: true — the customer covers the network fee,
  // so the invoice amount itself can be as low as ~$1.
  const nowPayment = (await $fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      order_id: String(invoiceId),
      order_description: `Invoice #${invoiceNum}`,
      ipn_callback_url: 'https://bilinix.com/api/payments/webhook/nowpayments',
      success_url: 'https://bilinix.com/dashboard/billing/invoices?payment=success',
      cancel_url: 'https://bilinix.com/dashboard/billing/invoices?payment=cancelled',
      is_fixed_rate: false,
      is_fee_paid_by_user: true,
    }),
  })) as { id: string; invoice_url: string }

  return {
    payment_url: nowPayment.invoice_url,
    payment_id: String(nowPayment.id),
    order_id: String(invoiceId),
    fake: isFake,
  }
})
