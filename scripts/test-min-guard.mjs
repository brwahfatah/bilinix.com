#!/usr/bin/env node
const BASE  = process.env.TEST_BASE_URL || 'https://bilinix.com'
const TOKEN = process.env.TEST_TOKEN    || 'fake-test-token-for-dev-mode'

const PASS = '\x1b[32m[PASS]\x1b[0m'
const FAIL = '\x1b[31m[FAIL]\x1b[0m'
const INFO = '\x1b[36m[INFO]\x1b[0m'

async function test(amount) {
  const res = await fetch(`${BASE}/api/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ invoice_id: 9001, amount }),
  })
  const body = await res.json().catch(() => null)
  return { amount, status: res.status, statusMessage: body?.statusMessage ?? null, payment_url: body?.payment_url ?? null }
}

console.log('\n\x1b[1m══ Minimum Payment Guard Tests ══\x1b[0m')
console.log(`${INFO} Base: ${BASE}\n`)

const r10 = await test(10)
const r20 = await test(20)
const r50 = await test(50)

const cases = [
  { label: '$10 invoice → BLOCKED (400, no URL)', r: r10, expectStatus: 400, wantUrl: false },
  { label: '$20 invoice → payment URL generated', r: r20, expectStatus: 200, wantUrl: true  },
  { label: '$50 invoice → payment URL generated', r: r50, expectStatus: 200, wantUrl: true  },
]

let pass = 0; let fail = 0
for (const { label, r, expectStatus, wantUrl } of cases) {
  const ok = r.status === expectStatus && (wantUrl ? !!r.payment_url : !r.payment_url)
  const icon = ok ? PASS : FAIL
  ok ? pass++ : fail++
  console.log(`${icon} ${label}`)
  const detail = r.statusMessage ? `HTTP ${r.status} — ${r.statusMessage}` : `HTTP ${r.status}`
  console.log(`${INFO}   ${detail}`)
  if (r.payment_url) console.log(`${INFO}   URL: ${r.payment_url}`)
  console.log()
}

console.log('\x1b[1m══ RESULT ══\x1b[0m')
console.log(`\x1b[32mPASS: ${pass}\x1b[0m  \x1b[31mFAIL: ${fail}\x1b[0m  Total: ${pass + fail}`)
if (fail === 0) {
  console.log('\x1b[32m\x1b[1m✓ All guard tests passed.\x1b[0m')
} else {
  console.log('\x1b[31m\x1b[1m✗ Some tests failed.\x1b[0m')
  process.exit(1)
}
