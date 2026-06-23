import { createError, getRequestHeader, readRawBody, setResponseStatus } from 'h3'
import { createHmac } from 'node:crypto'
import { callWhmcsApi } from '~/server/utils/whmcs'

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    Object.keys(parsed)
      .sort()
      .forEach((k) => { sorted[k] = parsed[k] })
    const expected = createHmac('sha512', secret).update(JSON.stringify(sorted)).digest('hex')
    return expected === signature
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const rawBody = (await readRawBody(event)) ?? ''
  const signature = getRequestHeader(event, 'x-nowpayments-sig') ?? ''

  const runtime = useRuntimeConfig()
  const ipnSecret = String(runtime.nowpaymentsIpnSecret ?? '')
  const isFake = String(runtime.whmcsDriver) === 'fake'

  if (ipnSecret) {
    if (!signature || !verifySignature(rawBody, signature, ipnSecret)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid IPN signature' })
    }
  }

  let payload: Record<string, any>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
  }

  const { payment_status, order_id, payment_id, actually_paid } = payload

  // Only finalize on confirmed/finished — all other statuses are acknowledged but ignored
  if (payment_status !== 'finished' && payment_status !== 'confirmed') {
    setResponseStatus(event, 200)
    return { ok: true, status: payment_status }
  }

  const invoiceId = Number(order_id)
  if (!invoiceId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order_id in payload' })
  }

  if (isFake) {
    console.log(`[NOWPayments][FAKE] Invoice #${invoiceId} marked paid — payment_id: ${payment_id}, amount: ${actually_paid}`)
    setResponseStatus(event, 200)
    return { ok: true, fake: true, invoiceId, payment_id, actually_paid }
  }

  await callWhmcsApi('AddInvoicePayment', {
    invoiceid: invoiceId,
    transid: String(payment_id),
    gateway: 'nowpayments',
    date: new Date().toISOString().split('T')[0]!,
    amount: Number(actually_paid ?? 0),
    noemail: false,
  })

  setResponseStatus(event, 200)
  return { ok: true }
})
