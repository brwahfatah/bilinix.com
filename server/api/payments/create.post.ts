import { createError, readBody } from 'h3'
import { callWhmcsApi, getAuthTokenFromHeader, readSessionUserId } from '~/server/utils/whmcs'

const asNumber = (v: unknown, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const asString = (v: unknown, fallback = '') => {
  if (v === undefined || v === null) return fallback
  return String(v)
}

export default defineEventHandler(async (event) => {
  const token = getAuthTokenFromHeader(event)
  const clientId = readSessionUserId(token)
  if (!clientId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }

  const body = await readBody<{ invoice_id?: string | number }>(event)
  const invoiceId = asNumber(body?.invoice_id)
  if (!invoiceId) {
    throw createError({ statusCode: 422, statusMessage: 'invoice_id is required' })
  }

  const runtime = useRuntimeConfig()
  const apiKey = asString(runtime.nowpaymentsApiKey)
  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Crypto payments are not configured' })
  }

  const invoiceData = await callWhmcsApi('GetInvoice', { invoiceid: invoiceId })
  const inv = invoiceData as Record<string, any>

  const invoiceNum = asString(inv.invoicenum || inv.number || String(invoiceId))
  const amount = parseFloat(asString(inv.total || '0')) || 0
  if (amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invoice has no payable amount' })
  }

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
      ipn_callback_url: 'https://api.bilinix.com/api/payments/webhook/nowpayments',
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
  }
})
