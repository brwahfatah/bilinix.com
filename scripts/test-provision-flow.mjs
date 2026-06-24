#!/usr/bin/env node
/**
 * Full provisioning flow E2E test
 *
 * Verifies the complete chain:
 *   POST /api/payments/create  (with hosting_package)
 *     → storage entry created
 *   POST /api/payments/webhook/nowpayments  (status=finished)
 *     → Hestia account provisioned
 *   POST /api/payments/webhook/nowpayments  (status=finished, RETRY)
 *     → idempotent: account already exists, no duplicate
 *   Cleanup: verify account deleted from HestiaCP
 *
 * Usage:
 *   IPN_SECRET=<secret> node scripts/test-provision-flow.mjs
 *   IPN_SECRET=<secret> TEST_BASE_URL=http://localhost:3000 node scripts/test-provision-flow.mjs
 *
 * Requires the Nuxt server to be running with Hestia configured.
 */

import { createHmac, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

// ── Load .env manually ────────────────────────────────────────────────────────
try {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim()
    if (!(k in process.env)) process.env[k] = v
  }
} catch { /* .env not found — use environment as-is */ }

const BASE   = process.env.TEST_BASE_URL   || 'https://bilinix.com'
const SECRET = process.env.IPN_SECRET

if (!SECRET) {
  console.error('[ERROR] IPN_SECRET env var is required')
  process.exit(1)
}

// Use a unique invoice ID per run to avoid storage collisions
const TEST_INVOICE  = Number(process.env.TEST_INVOICE_ID || (90000 + Math.floor(Math.random() * 9999)))
const TEST_AMOUNT   = 25.00
const TEST_EMAIL    = `provision.e2e.${Date.now()}@bilinix.test`
const TEST_PACKAGE  = 'STARTER'
const TEST_TOKEN    = process.env.TEST_TOKEN || 'fake-test-token-for-dev-mode'

// ── Helpers ───────────────────────────────────────────────────────────────────
const PASS = '\x1b[32m[PASS]\x1b[0m'
const FAIL = '\x1b[31m[FAIL]\x1b[0m'
const INFO = '\x1b[36m[INFO]\x1b[0m'
const WARN = '\x1b[33m[WARN]\x1b[0m'

let passed = 0; let failed = 0
const failures = []

function assert(label, ok, detail = '') {
  if (ok) {
    console.log(`${PASS} ${label}`)
    passed++
  } else {
    const msg = detail ? `${label} — ${detail}` : label
    console.log(`${FAIL} ${msg}`)
    failures.push(msg)
    failed++
  }
}

function sign(body) {
  const sorted = Object.fromEntries(Object.keys(body).sort().map(k => [k, body[k]]))
  return createHmac('sha512', SECRET).update(JSON.stringify(sorted)).digest('hex')
}

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  let json; try { json = await res.json() } catch { json = null }
  return { status: res.status, json }
}

// ── Test runner ───────────────────────────────────────────────────────────────
console.log('\n\x1b[1m══ Provisioning Flow E2E ══\x1b[0m')
console.log(`${INFO} Base:     ${BASE}`)
console.log(`${INFO} Invoice:  #${TEST_INVOICE}  amount=$${TEST_AMOUNT}`)
console.log(`${INFO} Email:    ${TEST_EMAIL}`)
console.log(`${INFO} Package:  ${TEST_PACKAGE}`)
console.log()

// ── Step 1: Create payment with hosting_package ───────────────────────────────
console.log('\x1b[1m── Step 1: POST /api/payments/create (hosting_package=STARTER)\x1b[0m')
const createRes = await post(
  '/api/payments/create',
  {
    invoice_id:      TEST_INVOICE,
    amount:          TEST_AMOUNT,
    email:           TEST_EMAIL,
    hosting_package: TEST_PACKAGE,
  },
  { Authorization: `Bearer ${TEST_TOKEN}` },
)
console.log(`${INFO} HTTP ${createRes.status}`)
console.log(`${INFO} ${JSON.stringify(createRes.json)}`)

assert('HTTP 200 on create',    createRes.status === 200, `got ${createRes.status}`)
assert('payment_url returned',  !!createRes.json?.payment_url)
assert('fake flag set',         createRes.json?.fake === true)

// ── Step 2: Simulate webhook — status=finished ────────────────────────────────
console.log('\n\x1b[1m── Step 2: Webhook — status=finished (triggers provisioning)\x1b[0m')
const webhookBody = {
  payment_status: 'finished',
  order_id:       String(TEST_INVOICE),
  payment_id:     `e2e-${randomBytes(4).toString('hex')}`,
  actually_paid:  TEST_AMOUNT,
  pay_currency:   'usdttrc20',
  price_amount:   TEST_AMOUNT,
  price_currency: 'usd',
}
const webhookSig = sign(webhookBody)
const webhookRes = await post(
  '/api/payments/webhook/nowpayments',
  webhookBody,
  { 'x-nowpayments-sig': webhookSig },
)
console.log(`${INFO} HTTP ${webhookRes.status}`)
console.log(`${INFO} ${JSON.stringify(webhookRes.json)}`)

assert('Webhook HTTP 200',        webhookRes.status === 200, `got ${webhookRes.status}`)
assert('ok:true returned',        webhookRes.json?.ok === true)
assert('fake:true returned',      webhookRes.json?.fake === true)
assert('invoiceId echoed',        Number(webhookRes.json?.invoiceId) === TEST_INVOICE)

// ── Step 3: Give HestiaCP a moment, then verify via direct API ───────────────
// (Hestia provisioning is in-process — by the time the webhook 200 is sent, it's done)
console.log('\n\x1b[1m── Step 3: Verify Hestia account exists\x1b[0m')

// Derive the expected username the same way toHestiaUsername does
// (uses full email to avoid cross-domain collisions)
const expectedUsername = TEST_EMAIL
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '')
  .slice(0, 16)

const NUXT_HESTIA_API_URL = process.env.NUXT_HESTIA_API_URL || ''
const NUXT_HESTIA_API_KEY = process.env.NUXT_HESTIA_API_KEY || ''
const NUXT_HESTIA_ADMIN   = process.env.NUXT_HESTIA_ADMIN_USER || 'admin'

if (!NUXT_HESTIA_API_URL || !NUXT_HESTIA_API_KEY) {
  console.log(`${WARN} NUXT_HESTIA_API_URL / NUXT_HESTIA_API_KEY not set — skipping direct Hestia verification`)
  console.log(`${INFO} Expected username: ${expectedUsername}`)
} else {
  async function callHestia(cmd, args = []) {
    const form = new URLSearchParams()
    form.set('hash', NUXT_HESTIA_API_KEY)
    form.set('user', NUXT_HESTIA_ADMIN)
    form.set('cmd', cmd)
    args.forEach((a, i) => form.set(`arg${i+1}`, a))
    const res = await fetch(NUXT_HESTIA_API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    return (await res.text()).trim()
  }

  console.log(`${INFO} Checking v-list-user ${expectedUsername}`)
  const listRaw = await callHestia('v-list-user', [expectedUsername, 'json'])
  let userData; try { userData = JSON.parse(listRaw) } catch { userData = null }

  assert('Hestia user created',       !!userData?.[expectedUsername], `raw: ${listRaw.slice(0,80)}`)
  assert('Package = STARTER',
    userData?.[expectedUsername]?.PACKAGE === 'STARTER',
    `got: ${userData?.[expectedUsername]?.PACKAGE}`)
  assert('Email stored correctly',
    userData?.[expectedUsername]?.CONTACT === TEST_EMAIL,
    `got: ${userData?.[expectedUsername]?.CONTACT}`)

  // ── Step 4: Idempotency — fire webhook again ─────────────────────────────────
  console.log('\n\x1b[1m── Step 4: Webhook retry — idempotency check\x1b[0m')
  const retryBody = { ...webhookBody, payment_id: `e2e-retry-${randomBytes(4).toString('hex')}` }
  const retryRes = await post(
    '/api/payments/webhook/nowpayments',
    retryBody,
    { 'x-nowpayments-sig': sign(retryBody) },
  )
  console.log(`${INFO} HTTP ${retryRes.status}`)
  assert('Retry webhook HTTP 200',  retryRes.status === 200)
  assert('ok:true on retry',        retryRes.json?.ok === true)

  // Verify account still exists (not deleted by idempotency path)
  const listRaw2 = await callHestia('v-list-user', [expectedUsername, 'json'])
  let userData2; try { userData2 = JSON.parse(listRaw2) } catch { userData2 = null }
  assert('Account still exists after retry', !!userData2?.[expectedUsername])

  // ── Step 5: Cleanup ───────────────────────────────────────────────────────────
  console.log('\n\x1b[1m── Step 5: Cleanup — delete test Hestia user\x1b[0m')
  const deleteResult = await callHestia('v-delete-user', [expectedUsername, 'yes'])
  console.log(`${INFO} v-delete-user: "${deleteResult}"`)
  assert('Cleanup succeeded',
    deleteResult === 'OK' || deleteResult === '' || deleteResult === '0',
    `code: ${deleteResult}`)
}

// ── Step 6: Auth guard ────────────────────────────────────────────────────────
console.log('\n\x1b[1m── Step 6: Auth guard — bad signature → 401\x1b[0m')
const badSigRes = await post(
  '/api/payments/webhook/nowpayments',
  webhookBody,
  { 'x-nowpayments-sig': 'deadbeef' + 'a'.repeat(118) },
)
console.log(`${INFO} HTTP ${badSigRes.status}`)
assert('Bad sig → 401',             badSigRes.status === 401)
assert('Error message correct',
  badSigRes.json?.statusMessage === 'Invalid IPN signature' ||
  badSigRes.json?.message?.includes('Invalid IPN'))

// ── Final report ──────────────────────────────────────────────────────────────
console.log('\n\x1b[1m══ RESULT ══\x1b[0m')
console.log(`\x1b[32mPASS: ${passed}\x1b[0m   \x1b[31mFAIL: ${failed}\x1b[0m   Total: ${passed + failed}`)
if (failed === 0) {
  console.log('\x1b[32m\x1b[1m✓ All provisioning flow checks passed.\x1b[0m')
} else {
  console.log('\x1b[31m\x1b[1m✗ Failures:\x1b[0m')
  failures.forEach(f => console.log(`  \x1b[31m•\x1b[0m ${f}`))
  process.exit(1)
}
