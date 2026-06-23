#!/usr/bin/env node
/**
 * NOWPayments end-to-end test (fake WHMCS driver)
 *
 * Steps:
 *  1. Build auth token (real Sanctum token via TEST_TOKEN env var, or a fixed
 *     placeholder accepted by fake mode — fake mode accepts any Bearer token)
 *  2. Create a NOWPayments invoice (fake mode: $5 test amount)
 *  3. Simulate a 'waiting'  IPN  → expect 200 {ok:true, status:'waiting'}
 *  4. Simulate a 'finished' IPN  → expect 200 {ok:true, fake:true}
 *  5. Simulate a bad signature   → expect 401
 *  6. Print final pass/fail report
 */

import { createHmac } from 'node:crypto'

// ── Config ──────────────────────────────────────────────────────────────────
const BASE_URL     = process.env.TEST_BASE_URL   || 'https://bilinix.com'
const IPN_SECRET   = process.env.IPN_SECRET      || 'do7UdHM2Rr9rgJeE520QPtHP9rAxxTwS'
const TEST_INVOICE = Number(process.env.TEST_INVOICE_ID || 9001)
const TEST_AMOUNT  = Number(process.env.TEST_AMOUNT     || 5.00)
// In fake mode any non-empty Bearer token is accepted.
// Pass a real Sanctum token via TEST_TOKEN to test against production auth.
const TEST_TOKEN   = process.env.TEST_TOKEN || 'fake-test-token-for-dev-mode'

const PASS = '\x1b[32m[PASS]\x1b[0m'
const FAIL = '\x1b[31m[FAIL]\x1b[0m'
const INFO = '\x1b[36m[INFO]\x1b[0m'

let passed = 0
let failed = 0

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`${PASS} ${label}`)
    passed++
  } else {
    console.log(`${FAIL} ${label}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function signWebhookPayload(body) {
  const sorted = Object.fromEntries(Object.keys(body).sort().map(k => [k, body[k]]))
  return createHmac('sha512', IPN_SECRET).update(JSON.stringify(sorted)).digest('hex')
}

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  let json
  try { json = await res.json() } catch { json = null }
  return { status: res.status, json }
}

// ── Test runner ───────────────────────────────────────────────────────────────
console.log('\n\x1b[1m══ NOWPayments E2E Test (fake WHMCS driver) ══\x1b[0m')
console.log(`${INFO} Base URL:  ${BASE_URL}`)
console.log(`${INFO} Invoice:   #${TEST_INVOICE}  Amount: $${TEST_AMOUNT}`)
console.log()

// ── Step 1: auth token ───────────────────────────────────────────────────────
console.log('\x1b[1m── Step 1: Auth Token\x1b[0m')
const token = TEST_TOKEN
console.log(`${INFO} Token (first 40 chars): ${token.slice(0, 40)}${token.length > 40 ? '…' : ''}`)
assert('Token available (non-empty)', token.length > 0)

// ── Step 2: create NOWPayments invoice ───────────────────────────────────────
console.log('\n\x1b[1m── Step 2: Create Payment\x1b[0m')
const createRes = await post(
  '/api/payments/create',
  { invoice_id: TEST_INVOICE, amount: TEST_AMOUNT },
  { Authorization: `Bearer ${token}` },
)
console.log(`${INFO} HTTP ${createRes.status}`)
console.log(`${INFO} Response:`, JSON.stringify(createRes.json, null, 2))

assert('HTTP 200 on create',     createRes.status === 200,   `got ${createRes.status}`)
assert('payment_url returned',   !!createRes.json?.payment_url)
assert('payment_id returned',    !!createRes.json?.payment_id)
assert('order_id matches',       String(createRes.json?.order_id) === String(TEST_INVOICE))
assert('fake flag present',      createRes.json?.fake === true)

const paymentId  = createRes.json?.payment_id  ?? 'test-payment-id'
const paymentUrl = createRes.json?.payment_url  ?? ''

if (paymentUrl) {
  console.log(`${INFO} NOWPayments checkout URL:\n  ${paymentUrl}`)
}

// ── Step 3: webhook — status 'waiting' (should ack but not finalize) ─────────
console.log('\n\x1b[1m── Step 3: Webhook — status=waiting\x1b[0m')
const waitingBody = {
  payment_status: 'waiting',
  order_id:       String(TEST_INVOICE),
  payment_id:     paymentId,
  actually_paid:  0,
  pay_currency:   'usdttrc20',
}
const waitingSig = signWebhookPayload(waitingBody)
const waitingRes = await post(
  '/api/payments/webhook/nowpayments',
  waitingBody,
  { 'x-nowpayments-sig': waitingSig },
)
console.log(`${INFO} HTTP ${waitingRes.status}`)
console.log(`${INFO} Response:`, JSON.stringify(waitingRes.json))

assert('HTTP 200 on waiting webhook', waitingRes.status === 200, `got ${waitingRes.status}`)
assert('ok:true returned',            waitingRes.json?.ok === true)
assert('status=waiting echoed',       waitingRes.json?.status === 'waiting')

// ── Step 4: webhook — status 'finished' (should finalize) ────────────────────
console.log('\n\x1b[1m── Step 4: Webhook — status=finished\x1b[0m')
const finishedBody = {
  payment_status: 'finished',
  order_id:       String(TEST_INVOICE),
  payment_id:     paymentId,
  actually_paid:  TEST_AMOUNT,
  pay_currency:   'usdttrc20',
  price_amount:   TEST_AMOUNT,
  price_currency: 'usd',
}
const finishedSig = signWebhookPayload(finishedBody)
const finishedRes = await post(
  '/api/payments/webhook/nowpayments',
  finishedBody,
  { 'x-nowpayments-sig': finishedSig },
)
console.log(`${INFO} HTTP ${finishedRes.status}`)
console.log(`${INFO} Response:`, JSON.stringify(finishedRes.json))

assert('HTTP 200 on finished webhook',  finishedRes.status === 200,                `got ${finishedRes.status}`)
assert('ok:true on finished',           finishedRes.json?.ok === true)
assert('fake:true (WHMCS skipped)',     finishedRes.json?.fake === true)
assert('invoiceId echoed',              Number(finishedRes.json?.invoiceId) === TEST_INVOICE)
assert('payment_id echoed',             finishedRes.json?.payment_id === paymentId)
assert('actually_paid echoed',          Number(finishedRes.json?.actually_paid) === TEST_AMOUNT)

// ── Step 5: webhook — bad signature (must be rejected) ───────────────────────
console.log('\n\x1b[1m── Step 5: Webhook — bad signature\x1b[0m')
const badSigRes = await post(
  '/api/payments/webhook/nowpayments',
  finishedBody,
  { 'x-nowpayments-sig': 'deadbeef' + 'a'.repeat(118) },
)
console.log(`${INFO} HTTP ${badSigRes.status}`)
console.log(`${INFO} Response:`, JSON.stringify(badSigRes.json))

assert('HTTP 401 on bad signature', badSigRes.status === 401, `got ${badSigRes.status}`)
assert('Error message correct',
  badSigRes.json?.statusMessage === 'Invalid IPN signature' ||
  badSigRes.json?.message?.includes('Invalid IPN'),
)

// ── Step 6: create without auth (must be rejected) ───────────────────────────
console.log('\n\x1b[1m── Step 6: Create without auth\x1b[0m')
const noAuthRes = await post('/api/payments/create', { invoice_id: TEST_INVOICE, amount: TEST_AMOUNT })
console.log(`${INFO} HTTP ${noAuthRes.status}`)
assert('HTTP 401 without auth', noAuthRes.status === 401, `got ${noAuthRes.status}`)

// ── Final report ──────────────────────────────────────────────────────────────
console.log('\n\x1b[1m══ RESULT ══\x1b[0m')
console.log(`\x1b[32mPASS: ${passed}\x1b[0m   \x1b[31mFAIL: ${failed}\x1b[0m   Total: ${passed + failed}`)
if (failed === 0) {
  console.log('\x1b[32m\x1b[1m✓ All tests passed — NOWPayments E2E verified.\x1b[0m')
} else {
  console.log('\x1b[31m\x1b[1m✗ Some tests failed — review output above.\x1b[0m')
  process.exit(1)
}
