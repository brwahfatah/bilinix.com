#!/usr/bin/env node
/**
 * Browser E2E simulation — mirrors the exact call sequence the browser makes
 * when a logged-in user visits an invoice page and clicks "Pay with Crypto".
 *
 * Usage:
 *   SANCTUM_TOKEN=<token> node scripts/test-browser-e2e.mjs
 */

const BASE_NUXT   = process.env.TEST_BASE_URL    || 'https://bilinix.com'
const BASE_LARAVEL = process.env.LARAVEL_BASE_URL || 'https://api.bilinix.com/api'
const TOKEN        = process.env.SANCTUM_TOKEN    || process.env.TEST_TOKEN || ''
const TARGET_INVOICE_ID = process.env.INVOICE_ID  || null   // override to test specific invoice

if (!TOKEN) {
  console.error('\x1b[31m[ERROR]\x1b[0m Set SANCTUM_TOKEN=<token> before running.')
  process.exit(1)
}

const PASS = '\x1b[32m[PASS]\x1b[0m'
const FAIL = '\x1b[31m[FAIL]\x1b[0m'
const INFO = '\x1b[36m[INFO]\x1b[0m'
let passed = 0; let failed = 0

function assert(label, ok, detail = '') {
  if (ok) { console.log(`${PASS} ${label}`); passed++ }
  else     { console.log(`${FAIL} ${label}${detail ? ' — ' + detail : ''}`); failed++ }
}

async function get(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

async function post(url, payload, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n\x1b[1m══ Browser E2E — NOWPayments Crypto Flow ══\x1b[0m')
console.log(`${INFO} Token: ${TOKEN.slice(0, 12)}…`)
console.log()

// ── Step 1: Verify auth (browser hydrates auth store via /auth/me) ────────────
console.log('\x1b[1m── Step 1: Auth — GET /auth/me\x1b[0m')
const me = await get(`${BASE_LARAVEL}/auth/me`, TOKEN)
console.log(`${INFO} HTTP ${me.status}`)
assert('Auth token is valid (200)',       me.status === 200,   `HTTP ${me.status}`)
assert('User data returned',             !!me.body?.data?.id || !!me.body?.user?.id)
const userId = me.body?.data?.id ?? me.body?.user?.id
const email  = me.body?.data?.email ?? me.body?.user?.email
console.log(`${INFO} Logged in as: ${email} (id=${userId})`)
console.log()

// ── Step 2: Fetch invoice list (billing page load) ────────────────────────────
console.log('\x1b[1m── Step 2: Invoice list — GET /billing/invoices\x1b[0m')
const listRes = await get(`${BASE_LARAVEL}/billing/invoices`, TOKEN)
console.log(`${INFO} HTTP ${listRes.status}`)
const rawList = listRes.body?.data ?? []
assert('Invoice list returns 200',       listRes.status === 200, `HTTP ${listRes.status}`)
assert('At least one invoice returned',  rawList.length > 0,     `got ${rawList.length}`)
console.log(`${INFO} Invoices returned: ${rawList.length}`)
rawList.forEach(inv => {
  const total = inv.total ?? inv.amount ?? '?'
  console.log(`${INFO}   #${inv.id} status=${inv.status} total=${total}`)
})
console.log()

// ── Step 3: Pick the best unpaid invoice ─────────────────────────────────────
console.log('\x1b[1m── Step 3: Select invoice to pay\x1b[0m')
let targetId = TARGET_INVOICE_ID
let invoiceAmount = null
if (!targetId) {
  const unpaid = rawList.find(inv => inv.status?.toLowerCase() !== 'paid')
  targetId = unpaid?.id ?? rawList[0]?.id
  const totalRaw = unpaid?.total ?? unpaid?.amount ?? rawList[0]?.total ?? rawList[0]?.amount
  invoiceAmount = parseFloat(totalRaw) || null
}
assert('Found a payable invoice',        !!targetId, 'no invoices available')
console.log(`${INFO} Using invoice ID: ${targetId}  amount: $${invoiceAmount ?? '?'}`)
console.log()

// ── Step 4: Fetch invoice detail (invoice page load) ─────────────────────────
console.log('\x1b[1m── Step 4: Invoice detail — GET /billing/invoices/{id}\x1b[0m')
const detailRes = await get(`${BASE_LARAVEL}/billing/invoices/${targetId}`, TOKEN)
console.log(`${INFO} HTTP ${detailRes.status}`)
assert('Invoice detail returns 200', detailRes.status === 200, `HTTP ${detailRes.status}`)
const inv = detailRes.body?.data ?? detailRes.body?.invoice ?? {}
const detailAmount = parseFloat(inv?.total ?? inv?.amount ?? invoiceAmount ?? '0')
invoiceAmount = detailAmount || invoiceAmount
console.log(`${INFO} Invoice detail: id=${inv.id ?? targetId} total=${inv.total ?? inv.amount} status=${inv.status}`)
console.log()

// ── Step 5: Click "Pay with Crypto" (POST /api/payments/create) ──────────────
console.log('\x1b[1m── Step 5: Pay with Crypto — POST /api/payments/create\x1b[0m')
console.log(`${INFO} Payload: invoice_id=${targetId}  amount=${invoiceAmount}`)
const payRes = await post(
  `${BASE_NUXT}/api/payments/create`,
  { invoice_id: targetId, amount: invoiceAmount },
  TOKEN,
)
console.log(`${INFO} HTTP ${payRes.status}`)
console.log(`${INFO} Response: ${JSON.stringify(payRes.body, null, 2).split('\n').join('\n  ')}`)
assert('Payment creation returns 200',   payRes.status === 200,          `HTTP ${payRes.status}: ${payRes.body?.statusMessage ?? ''}`)
assert('payment_url returned',           !!payRes.body?.payment_url,     'no payment_url in response')
assert('payment_id returned',            !!payRes.body?.payment_id,      'no payment_id')
assert('order_id matches invoice',       String(payRes.body?.order_id) === String(targetId))
const paymentUrl = payRes.body?.payment_url
if (paymentUrl) console.log(`${INFO} NOWPayments checkout: ${paymentUrl}`)
console.log()

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\x1b[1m══ RESULT ══\x1b[0m')
console.log(`\x1b[32mPASS: ${passed}\x1b[0m  \x1b[31mFAIL: ${failed}\x1b[0m  Total: ${passed + failed}`)
if (failed === 0) {
  console.log('\x1b[32m\x1b[1m✓ Full browser E2E passed.\x1b[0m')
  console.log(`\n\x1b[1mCheckout URL for manual browser test:\x1b[0m`)
  console.log(`  ${paymentUrl}`)
} else {
  console.log('\x1b[31m\x1b[1m✗ Some steps failed — see above.\x1b[0m')
  process.exit(1)
}
