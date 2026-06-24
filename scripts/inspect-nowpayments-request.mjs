#!/usr/bin/env node
/**
 * Diagnostic: inspect the exact payload sent to NOWPayments /v1/invoice
 * and print the full raw response, including minimum payment amount.
 *
 * Usage:
 *   node scripts/inspect-nowpayments-request.mjs
 *   AMOUNT=10 node scripts/inspect-nowpayments-request.mjs
 */

const API_KEY    = process.env.NOWPAYMENTS_API_KEY
if (!API_KEY) { console.error('NOWPAYMENTS_API_KEY env var is required'); process.exit(1) }
const AMOUNT     = Number(process.env.AMOUNT || 10)
const INVOICE_ID = process.env.INVOICE_ID || '9001'

const PASS = '\x1b[32m[PASS]\x1b[0m'
const FAIL = '\x1b[31m[FAIL]\x1b[0m'
const INFO = '\x1b[36m[INFO]\x1b[0m'
const HEAD = '\x1b[1m'
const RESET = '\x1b[0m'

console.log(`\n${HEAD}══ NOWPayments Request Inspector ══${RESET}`)
console.log(`${INFO} API Key (first 8):  ${API_KEY.slice(0, 8)}…`)
console.log(`${INFO} Test amount:        $${AMOUNT}`)
console.log(`${INFO} Invoice ID:         ${INVOICE_ID}\n`)

// ── 1. Build the exact payload create.post.ts sends ─────────────────────────
const payload = {
  price_amount:     AMOUNT,
  price_currency:   'usd',
  pay_currency:     'usdttrc20',
  order_id:         String(INVOICE_ID),
  order_description: `Invoice #FAKE-${INVOICE_ID}`,
  ipn_callback_url:  'https://bilinix.com/api/payments/webhook/nowpayments',
  success_url:       'https://bilinix.com/dashboard/billing/invoices?payment=success',
  cancel_url:        'https://bilinix.com/dashboard/billing/invoices?payment=cancelled',
  is_fixed_rate:     false,
  is_fee_paid_by_user: false,
}

console.log(`${HEAD}── 1. Outbound request payload ──${RESET}`)
console.log(`  POST https://api.nowpayments.io/v1/invoice`)
console.log(`  Headers:`)
console.log(`    x-api-key: ${API_KEY.slice(0, 8)}…`)
console.log(`    Content-Type: application/json`)
console.log(`  Body:`)
Object.entries(payload).forEach(([k, v]) => {
  console.log(`    ${k.padEnd(22)}: ${JSON.stringify(v)}`)
})

// ── 2. Verify key fields ─────────────────────────────────────────────────────
console.log(`\n${HEAD}── 2. Field verification ──${RESET}`)
const checks = [
  ['price_amount',    payload.price_amount,    `=== ${AMOUNT}`,       payload.price_amount === AMOUNT],
  ['price_currency',  payload.price_currency,  '=== "usd"',           payload.price_currency === 'usd'],
  ['pay_currency',    payload.pay_currency,    '=== usdttrc20|usdtbsc',
    ['usdttrc20', 'usdtbsc'].includes(payload.pay_currency)],
]
let pass = 0; let fail = 0
for (const [field, value, rule, ok] of checks) {
  const icon = ok ? PASS : FAIL
  console.log(`  ${icon} ${field.padEnd(16)} = ${JSON.stringify(value)}  (rule: ${rule})`)
  ok ? pass++ : fail++
}

// ── 3. Call NOWPayments and capture raw response ─────────────────────────────
console.log(`\n${HEAD}── 3. Raw NOWPayments API response ──${RESET}`)
let rawJson = null
let httpStatus = null
try {
  const res = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key':    API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  httpStatus = res.status
  rawJson = await res.json()
  console.log(`  HTTP status: ${res.status}`)
  console.log(`  Raw body:\n${JSON.stringify(rawJson, null, 4).split('\n').map(l => '  ' + l).join('\n')}`)
} catch (err) {
  console.log(`  ${FAIL} Fetch error: ${err.message}`)
}

// ── 4. Extract and confirm minimum payment ───────────────────────────────────
console.log(`\n${HEAD}── 4. Key fields from response ──${RESET}`)
if (rawJson && httpStatus === 200) {
  const fields = [
    'id', 'invoice_url', 'token_id', 'order_id', 'order_description',
    'price_amount', 'price_currency', 'pay_currency',
    'pay_address', 'pay_amount', 'pay_amount_usd',
  ]
  for (const f of fields) {
    if (rawJson[f] !== undefined) {
      console.log(`  ${f.padEnd(22)}: ${JSON.stringify(rawJson[f])}`)
    }
  }

  // Minimum payment amount
  const minAmount = rawJson.pay_amount ?? rawJson.min_transfer_amount ?? null
  if (minAmount !== null) {
    console.log(`\n  ${PASS} Minimum/expected pay_amount: ${minAmount} ${rawJson.pay_currency ?? ''}`)
  } else {
    console.log(`\n  ${INFO} pay_amount not present in invoice response (normal — set at payment time)`)
  }

  // Pull checkout URL
  console.log(`\n  ${PASS} Checkout URL: ${rawJson.invoice_url}`)
} else {
  console.log(`  ${FAIL} Non-200 response or no data — see raw body above`)
}

// ── 5. Get minimum payment amount from NOWPayments currencies endpoint ────────
console.log(`\n${HEAD}── 5. Minimum payment from /v1/min-amount ──${RESET}`)
try {
  const minRes = await fetch(
    'https://api.nowpayments.io/v1/min-amount?currency_from=usd&currency_to=usdttrc20',
    { headers: { 'x-api-key': API_KEY } }
  )
  const minData = await minRes.json()
  console.log(`  HTTP status: ${minRes.status}`)
  console.log(`  Raw: ${JSON.stringify(minData)}`)
  if (minData.min_amount !== undefined) {
    const ok = AMOUNT >= Number(minData.min_amount)
    console.log(`  ${ok ? PASS : FAIL} min_amount for USD→usdttrc20: ${minData.min_amount}`)
    console.log(`  ${ok ? PASS : FAIL} $${AMOUNT} invoice ${ok ? 'exceeds' : 'is BELOW'} minimum`)
  }
} catch (err) {
  console.log(`  ${FAIL} Could not fetch min-amount: ${err.message}`)
}

// ── Final ─────────────────────────────────────────────────────────────────────
console.log(`\n${HEAD}══ SUMMARY ══${RESET}`)
console.log(`  Field checks:  ${PASS.replace('[PASS]', `${pass} PASS`)}  ${fail > 0 ? FAIL.replace('[FAIL]', `${fail} FAIL`) : '0 FAIL'}`)
console.log(`  API response:  HTTP ${httpStatus ?? 'N/A'} ${httpStatus === 200 ? '✓' : '✗'}`)
