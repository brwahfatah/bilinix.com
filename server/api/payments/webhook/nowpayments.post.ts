import { createError, getRequestHeader, readRawBody, setResponseStatus } from 'h3'
import { createHmac, randomBytes } from 'node:crypto'
import { callWhmcsApi } from '~/server/utils/whmcs'
import {
  hestiaProvisionUser,
  hestiaUserExists,
  toHestiaUsername,
  type HestiaPackage,
} from '~/server/utils/hestia'
import { sendWelcomeEmail } from '~/server/utils/email'

// ── Signature verification ────────────────────────────────────────────────────

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

// ── Password generator ────────────────────────────────────────────────────────
// Generates a 20-char password from a printable charset excluding ambiguous
// characters. The password is used once for HestiaCP account creation and
// must be communicated to the customer via welcome email (TODO).

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  const bytes = randomBytes(20)
  return Array.from(bytes)
    .map((b) => chars[b % chars.length]!)
    .join('')
}

// ── Hestia provisioning ───────────────────────────────────────────────────────
// Called after an invoice is confirmed paid. Looks up provisioning metadata
// stored by create.post.ts, checks idempotency, and creates the HestiaCP account.
// Errors are caught by the caller — the webhook always returns 200 to NOWPayments
// so it isn't retried for non-Hestia reasons. If Hestia is down, the storage
// entry is preserved so the next webhook retry can attempt provisioning again.

const VALID_PACKAGES: readonly string[] = ['STARTER', 'BUSINESS', 'AGENCY']


async function triggerHestiaProvisioning(invoiceId: number): Promise<void> {
  const runtime = useRuntimeConfig()

  if (!runtime.hestiaApiUrl || !runtime.hestiaApiKey) {
    return // Hestia not configured — provisioning is disabled
  }

  const storage = useStorage('data')
  const storageKey = `hestia:pending:${invoiceId}`

  const meta = await storage.getItem<{
    email: string
    package: string
    domain?: string
    createdAt: number
  }>(storageKey)

  if (!meta?.email || !meta?.package) {
    console.log(`[Hestia] No pending provisioning for invoice #${invoiceId} — skipping`)
    return
  }

  const pkg = (VALID_PACKAGES.includes(meta.package.toUpperCase())
    ? meta.package.toUpperCase()
    : 'STARTER') as HestiaPackage

  const username = toHestiaUsername(meta.email)

  // Idempotency: if the account already exists (e.g. webhook retry), skip creation
  if (await hestiaUserExists(username)) {
    console.log(
      `[Hestia] Account "${username}" already exists — idempotent skip for invoice #${invoiceId}`,
    )
    await storage.removeItem(storageKey)
    return
  }

  const password = generatePassword()

  await hestiaProvisionUser({
    username,
    password,
    email: meta.email,
    package: pkg,
    domain: meta.domain,
  })

  await storage.removeItem(storageKey)

  console.log(
    `[Hestia] Provisioned account "${username}" for ${meta.email} pkg=${pkg} invoice=#${invoiceId}`,
  )

  try {
    await sendWelcomeEmail({
      to:          meta.email,
      username,
      password,
      packageName: pkg,
    })
  } catch (err) {
    console.error('[WELCOME_EMAIL_FAILED]', err)
  }
}

// ── Webhook handler ───────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const rawBody = (await readRawBody(event)) ?? ''
  const signature = getRequestHeader(event, 'x-nowpayments-sig') ?? ''

  const runtime = useRuntimeConfig()
  const ipnSecret = String(runtime.nowpaymentsIpnSecret ?? '')
  const isFake = String(runtime.whmcsDriver) === 'fake'

  if (!ipnSecret) {
    throw createError({ statusCode: 500, statusMessage: 'IPN secret not configured' })
  }
  if (!signature || !verifySignature(rawBody, signature, ipnSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid IPN signature' })
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

  // ── Step 1: mark invoice paid ────────────────────────────────────────────────
  if (isFake) {
    console.log(
      `[NOWPayments][FAKE] Invoice #${invoiceId} marked paid — payment_id: ${payment_id}, amount: ${actually_paid}`,
    )
  } else {
    await callWhmcsApi('AddInvoicePayment', {
      invoiceid: invoiceId,
      transid: String(payment_id),
      gateway: 'nowpayments',
      date: new Date().toISOString().split('T')[0]!,
      amount: Number(actually_paid ?? 0),
      noemail: false,
    })
  }

  // ── Step 2: provision hosting account ────────────────────────────────────────
  // Non-blocking: provisioning errors are logged but never fail the webhook
  // response so NOWPayments doesn't mark it as a delivery failure.
  // If Hestia is unreachable, the pending storage entry is preserved and the
  // next webhook retry will attempt provisioning again (idempotent).
  try {
    await triggerHestiaProvisioning(invoiceId)
  } catch (err: any) {
    console.error(
      `[Hestia] Provisioning failed for invoice #${invoiceId}: ${err?.message ?? err}`,
    )
  }

  setResponseStatus(event, 200)

  if (isFake) {
    return { ok: true, fake: true, invoiceId, payment_id, actually_paid }
  }
  return { ok: true }
})
