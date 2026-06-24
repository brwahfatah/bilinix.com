#!/usr/bin/env node
/**
 * Full browser-level E2E audit against live VPS deployment.
 *
 * Covers:
 *  A. User isolation          — invoice lists differ between accounts
 *  B. Order flow (User A)     — Dedicated Server $79.99, new unique invoice
 *  C. Second order (User B)   — VPS 4GB $19.99, different invoice + order IDs
 *  D. Crypto payment          — NOWPayments invoice created from $79.99 invoice
 *  E. Final report            — PASS/FAIL table
 *
 * Usage:
 *   TOKEN_A=<sanctum-token-A> TOKEN_B=<sanctum-token-B> node scripts/e2e-full-audit.mjs
 */

const LARAVEL = process.env.LARAVEL_BASE_URL || 'https://api.bilinix.com/api'
const NUXT    = process.env.NUXT_BASE_URL    || 'https://bilinix.com'
const TOKEN_A = process.env.TOKEN_A || ''
const TOKEN_B = process.env.TOKEN_B || ''

if (!TOKEN_A || !TOKEN_B) {
  console.error('\x1b[31m[ERROR]\x1b[0m Set TOKEN_A and TOKEN_B before running.')
  process.exit(1)
}

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  grey:   '\x1b[90m',
}
const PASS = `${C.green}[PASS]${C.reset}`
const FAIL = `${C.red}[FAIL]${C.reset}`
const INFO = `${C.cyan}[INFO]${C.reset}`
const WARN = `${C.yellow}[WARN]${C.reset}`
const SEP  = `${C.blue}${'─'.repeat(60)}${C.reset}`

// ── State ─────────────────────────────────────────────────────────────────────
const results = []
let emailA = '?', emailB = '?'

function assert(label, ok, detail = '') {
  results.push({ label, ok, detail })
  const icon = ok ? PASS : FAIL
  const note = detail ? ` ${C.grey}— ${detail}${C.reset}` : ''
  console.log(`  ${icon} ${label}${note}`)
}

function info(msg) { console.log(`  ${INFO} ${msg}`) }
function warn(msg) { console.log(`  ${WARN} ${msg}`) }
function section(title) {
  console.log(`\n${C.bold}${SEP}${C.reset}`)
  console.log(`${C.bold}  ${title}${C.reset}`)
  console.log(`${C.bold}${SEP}${C.reset}`)
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
async function api(path, token, opts = {}) {
  const res = await fetch(`${LARAVEL}${path}`, {
    ...opts,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

async function nuxtPost(path, token, body) {
  const res = await fetch(`${NUXT}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json',
               Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const rb = await res.json().catch(() => null)
  return { status: res.status, body: rb }
}

const get  = (p, t)    => api(p, t)
const post = (p, t, b) => api(p, t, { method: 'POST', body: b })
const del  = (p, t)    => api(p, t, { method: 'DELETE' })

// =============================================================================
// A. USER ISOLATION
// =============================================================================
section('A · User Isolation')

const [meA, meB] = await Promise.all([get('/auth/me', TOKEN_A), get('/auth/me', TOKEN_B)])
assert('Token A valid (200)', meA.status === 200, `HTTP ${meA.status}`)
assert('Token B valid (200)', meB.status === 200, `HTTP ${meB.status}`)

emailA = meA.body?.data?.email ?? meA.body?.user?.email ?? '?'
emailB = meB.body?.data?.email ?? meB.body?.user?.email ?? '?'
info(`User A: ${emailA}`)
info(`User B: ${emailB}`)
assert('User A ≠ User B (distinct accounts)', emailA !== emailB)

const [listA0, listB0] = await Promise.all([
  get('/billing/invoices', TOKEN_A),
  get('/billing/invoices', TOKEN_B),
])
assert('User A invoice list 200', listA0.status === 200)
assert('User B invoice list 200', listB0.status === 200)

const invA0 = listA0.body?.data ?? []
const invB0 = listB0.body?.data ?? []
info(`User A pre-run invoices (${invA0.length}): ${invA0.map(i => `#${i.id}($${i.total})`).join(', ') || 'none'}`)
info(`User B pre-run invoices (${invB0.length}): ${invB0.map(i => `#${i.id}($${i.total})`).join(', ') || 'none'}`)

const idsA0  = new Set(invA0.map(i => String(i.id)))
const idsB0  = new Set(invB0.map(i => String(i.id)))
const overlap = [...idsA0].filter(id => idsB0.has(id))
assert('Invoice lists are disjoint (no shared IDs)',
  overlap.length === 0, overlap.length ? `shared: [${overlap.join(', ')}]` : '')
assert('No legacy hardcoded IDs (2001/2002/2003)',
  !['2001','2002','2003'].some(id => idsA0.has(id) || idsB0.has(id)))

// Cross-user detail access
if (invA0.length > 0) {
  const aidA = invA0[0].id
  const rBA  = await get(`/billing/invoices/${aidA}`, TOKEN_B)
  info(`User B → User A invoice #${aidA}: HTTP ${rBA.status}`)
  assert('User B blocked from User A invoice (404)', rBA.status === 404 || rBA.status === 403,
    `HTTP ${rBA.status}`)
}
if (invB0.length > 0) {
  const aidB = invB0[0].id
  const rAB  = await get(`/billing/invoices/${aidB}`, TOKEN_A)
  info(`User A → User B invoice #${aidB}: HTTP ${rAB.status}`)
  assert('User A blocked from User B invoice (404)', rAB.status === 404 || rAB.status === 403,
    `HTTP ${rAB.status}`)
}

// =============================================================================
// B. ORDER FLOW — User A buys Dedicated Server ($79.99) — above $20 minimum
// =============================================================================
section('B · Order Flow — User A: Dedicated Server (pid=5, $79.99/mo)')

// Clear cart and add Dedicated Server
await del('/cart', TOKEN_A)
const cartB = await post('/cart/items', TOKEN_A, {
  product_id: '5', name: 'Dedicated Server', type: 'server',
  billing_cycle: 'monthly', quantity: 1, unit_price: 79.99,
})
info(`POST /cart/items: HTTP ${cartB.status}  ${cartB.body?.message ?? ''}`)
assert('Dedicated Server added to cart', cartB.status === 200, cartB.body?.message ?? `HTTP ${cartB.status}`)

const coB = await post('/orders/checkout', TOKEN_A, { payment_method: 'banktransfer' })
info(`POST /orders/checkout: HTTP ${coB.status}`)
const orderB = coB.body?.data ?? {}
info(`Result: invoice_id=${orderB.invoice_id}  order_id=${orderB.id}  total=${orderB.total}`)
assert('Checkout 201', coB.status === 201, coB.body?.message ?? `HTTP ${coB.status}`)
assert('invoice_id returned',          !!orderB.invoice_id)
assert('order_id returned',            !!orderB.id)
assert('invoice_id ≠ 2002',           String(orderB.invoice_id) !== '2002')
assert('order_id ≠ 4099',             String(orderB.id)         !== '4099')
assert('invoice_id ≥ 10001',          Number(orderB.invoice_id) >= 10001, `got ${orderB.invoice_id}`)
assert('order_id ≥ 20001',            Number(orderB.id) >= 20001,         `got ${orderB.id}`)

const invoiceB = String(orderB.invoice_id ?? '')
const orderBid = String(orderB.id ?? '')

// Verify invoice detail
if (invoiceB) {
  const det = await get(`/billing/invoices/${invoiceB}`, TOKEN_A)
  assert('Invoice detail 200', det.status === 200, `HTTP ${det.status}`)
  const d = det.body?.data ?? {}
  info(`Invoice detail: #${d.id}  status=${d.status}  total=${d.total}`)
  assert('Invoice status Unpaid',       d.status?.toLowerCase() === 'unpaid', `got ${d.status}`)
  assert('Invoice total = $79.99',      parseFloat(d.total) === 79.99, `got ${d.total}`)

  // Invoice must appear in User A list
  const listA1 = await get('/billing/invoices', TOKEN_A)
  const idsA1  = (listA1.body?.data ?? []).map(i => String(i.id))
  assert('New invoice in User A list',  idsA1.includes(invoiceB), `ids: [${idsA1.join(', ')}]`)

  // Must NOT appear in User B list
  const listB1 = await get('/billing/invoices', TOKEN_B)
  const idsB1  = (listB1.body?.data ?? []).map(i => String(i.id))
  assert('New invoice NOT in User B list', !idsB1.includes(invoiceB),
    idsB1.includes(invoiceB) ? 'LEAKED' : '')

  // User B direct detail must be denied
  const crossB = await get(`/billing/invoices/${invoiceB}`, TOKEN_B)
  info(`User B → User A invoice #${invoiceB}: HTTP ${crossB.status}`)
  assert('User B blocked from new invoice (404)', crossB.status === 404 || crossB.status === 403,
    `HTTP ${crossB.status}`)
}

// =============================================================================
// C. SECOND ORDER — User B buys VPS 4GB ($19.99) — fresh cart, no idempotency
// =============================================================================
section('C · Second Order — User B: VPS 4GB (pid=4, $19.99/mo)')

await del('/cart', TOKEN_B)
const cartC = await post('/cart/items', TOKEN_B, {
  product_id: '4', name: 'VPS 4GB', type: 'server',
  billing_cycle: 'monthly', quantity: 1, unit_price: 19.99,
})
info(`POST /cart/items: HTTP ${cartC.status}  ${cartC.body?.message ?? ''}`)
assert('VPS 4GB added to cart', cartC.status === 200, cartC.body?.message ?? `HTTP ${cartC.status}`)

const coC = await post('/orders/checkout', TOKEN_B, { payment_method: 'banktransfer' })
info(`POST /orders/checkout: HTTP ${coC.status}`)
const orderC = coC.body?.data ?? {}
info(`Result: invoice_id=${orderC.invoice_id}  order_id=${orderC.id}  total=${orderC.total}`)
assert('Checkout 201', coC.status === 201, coC.body?.message ?? `HTTP ${coC.status}`)
assert('invoice_id returned',          !!orderC.invoice_id)
assert('order_id returned',            !!orderC.id)

const invoiceC = String(orderC.invoice_id ?? '')
const orderCid = String(orderC.id ?? '')

assert('invoice_id ≠ 2002',           invoiceC !== '2002')
assert('order_id ≠ 4099',             orderCid !== '4099')
assert('invoice_id ≥ 10001',          Number(invoiceC) >= 10001, `got ${invoiceC}`)
assert('invoice_id differs from B',   invoiceC !== invoiceB,
  invoiceC === invoiceB ? `both are ${invoiceB} — ID reused` : '')
assert('order_id differs from B',     orderCid !== orderBid,
  orderCid === orderBid ? `both are ${orderBid} — ID reused` : '')

// User B sees their invoice; User A does not
const [listA2, listB2] = await Promise.all([
  get('/billing/invoices', TOKEN_A),
  get('/billing/invoices', TOKEN_B),
])
const idsA2 = (listA2.body?.data ?? []).map(i => String(i.id))
const idsB2 = (listB2.body?.data ?? []).map(i => String(i.id))

info(`User A invoices after C (${idsA2.length}): ${idsA2.join(', ')}`)
info(`User B invoices after C (${idsB2.length}): ${idsB2.join(', ')}`)

assert('User B invoice visible to B',   idsB2.includes(invoiceC), `missing ${invoiceC}`)
assert('User B invoice NOT in A list',  !idsA2.includes(invoiceC),
  idsA2.includes(invoiceC) ? 'LEAKED to A' : '')
assert('User A invoice still in A list', idsA2.includes(invoiceB), `missing ${invoiceB}`)
assert('User A invoice NOT in B list',  !idsB2.includes(invoiceB),
  idsB2.includes(invoiceB) ? 'LEAKED to B' : '')
assert('User B total = $19.99', parseFloat(orderC.total) === 19.99, `got ${orderC.total}`)

// =============================================================================
// D. CRYPTO PAYMENT — pick the $79.99 invoice from section B
// =============================================================================
section('D · Crypto Payment — NOWPayments (invoice $79.99)')

// Pick the highest-value unpaid invoice from User A (should be section B's $79.99)
const unpaidA = (listA2.body?.data ?? [])
  .filter(i => i.status?.toLowerCase() === 'unpaid')
  .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))

const targetInv = unpaidA[0]
info(`Highest unpaid invoice: #${targetInv?.id ?? 'none'}  $${targetInv?.total ?? '?'}`)
assert('Unpaid invoice available', !!targetInv)
assert('Invoice ≥ $20 (clears NOWPayments guard)',
  parseFloat(targetInv?.total ?? '0') >= 20,
  `$${targetInv?.total} < $20 minimum`)

let paymentUrl = null
let paymentId  = null

if (targetInv && parseFloat(targetInv.total) >= 20) {
  // D1: Invoice detail
  const det = await get(`/billing/invoices/${targetInv.id}`, TOKEN_A)
  assert('Invoice detail 200', det.status === 200)
  const d      = det.body?.data ?? {}
  const amount = parseFloat(d.total ?? targetInv.total ?? '0')
  info(`Invoice detail: #${d.id}  total=${d.total}  status=${d.status}`)

  // D2: POST to Nuxt /api/payments/create (the browser-facing route)
  const payR = await nuxtPost('/api/payments/create', TOKEN_A,
    { invoice_id: targetInv.id, amount })
  info(`POST /api/payments/create: HTTP ${payR.status}`)
  if (payR.body) {
    info(`payment_id=${payR.body.payment_id}  fake=${payR.body.fake}`)
    info(`payment_url=${payR.body.payment_url?.slice(0, 80) ?? 'N/A'}`)
  }

  assert('payments/create 200', payR.status === 200,
    payR.body?.statusMessage ?? `HTTP ${payR.status}`)
  assert('payment_url returned',        !!payR.body?.payment_url)
  assert('payment_id returned',         !!payR.body?.payment_id)
  assert('order_id in response',        !!payR.body?.order_id)
  assert('order_id matches invoice',
    String(payR.body?.order_id) === String(targetInv.id),
    `expected ${targetInv.id}, got ${payR.body?.order_id}`)

  paymentUrl = payR.body?.payment_url ?? null
  paymentId  = payR.body?.payment_id  ?? null

  if (paymentUrl) {
    const isNP = paymentUrl.includes('nowpayments.io') || paymentUrl.includes('invoice')
    const isFake = paymentUrl.includes('whmcs.example.com') || paymentUrl.includes('fake')
    assert('payment_url is real NOWPayments URL', isNP && !isFake, paymentUrl.slice(0, 80))
  }

  // D3: Below-minimum guard still active
  info('Guard check — $10 invoice (should be blocked) …')
  const guardR = await nuxtPost('/api/payments/create', TOKEN_A,
    { invoice_id: 99999, amount: 10 })
  info(`Guard: HTTP ${guardR.status}  msg=${guardR.body?.statusMessage ?? ''}`)
  assert('$10 invoice blocked (400)',      guardR.status === 400, `HTTP ${guardR.status}`)
  assert('Block message mentions minimum',
    (guardR.body?.statusMessage ?? '').toLowerCase().includes('minimum'),
    guardR.body?.statusMessage ?? '')
}

// =============================================================================
// E. FINAL REPORT
// =============================================================================
section('E · Final Report')

const passed = results.filter(r => r.ok).length
const failed = results.filter(r => !r.ok).length

info(`User A: ${emailA}`)
info(`User B: ${emailB}`)
console.log()

// Invoice summary
console.log(`${C.bold}  Invoices created this run:${C.reset}`)
if (invoiceB) info(`  B: invoice_id=${invoiceB}  order_id=${orderBid}  $79.99  Dedicated Server  (User A)`)
if (invoiceC) info(`  C: invoice_id=${invoiceC}  order_id=${orderCid}  $19.99  VPS 4GB            (User B)`)
console.log()

// Visibility matrix
console.log(`${C.bold}  Visibility matrix:${C.reset}`)
console.log(`  ${'Invoice'.padEnd(10)} ${'User A sees'.padEnd(14)} ${'User B sees'.padEnd(14)} Owner`)
const matrixData = [
  { id: invoiceB, a: idsA2.includes(invoiceB), b: idsB2.includes(invoiceB), owner: 'A' },
  { id: invoiceC, a: idsA2.includes(invoiceC), b: idsB2.includes(invoiceC), owner: 'B' },
]
for (const row of matrixData) {
  if (!row.id) continue
  const aStr = row.a
    ? (row.owner === 'A' ? `${C.green}YES (owner)${C.reset}` : `${C.red}LEAK${C.reset}`)
    : `${C.green}NO${C.reset}`
  const bStr = row.b
    ? (row.owner === 'B' ? `${C.green}YES (owner)${C.reset}` : `${C.red}LEAK${C.reset}`)
    : `${C.green}NO${C.reset}`
  console.log(`  #${String(row.id).padEnd(9)} ${aStr.padEnd(22)} ${bStr.padEnd(22)} User ${row.owner}`)
}
console.log()

// Crypto result
console.log(`${C.bold}  Crypto payment:${C.reset}`)
if (paymentUrl) {
  info(`payment_id:   ${paymentId}`)
  info(`checkout URL: ${paymentUrl}`)
  console.log()
  console.log(`${C.bold}${C.green}  → Open this URL in the browser to complete payment:${C.reset}`)
  console.log(`    ${paymentUrl}`)
} else {
  warn('No NOWPayments URL generated')
}
console.log()

// Full check list
console.log(`${C.bold}  All checks:${C.reset}`)
for (const r of results) {
  const icon = r.ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`
  const note = (!r.ok && r.detail) ? ` ${C.grey}(${r.detail})${C.reset}` : ''
  console.log(`  ${icon}  ${r.label}${note}`)
}

// Totals
console.log(`\n${C.bold}${SEP}${C.reset}`)
console.log(`  ${C.bold}TOTAL  ${C.green}PASS: ${passed}${C.reset}  ${C.red}FAIL: ${failed}${C.reset}  of ${results.length}`)
if (failed === 0) {
  console.log(`  ${C.green}${C.bold}✓  All checks passed — deployment is fully verified.${C.reset}`)
} else {
  console.log(`  ${C.red}${C.bold}✗  ${failed} check(s) failed — see list above.${C.reset}`)
}
console.log(`${C.bold}${SEP}${C.reset}\n`)

if (failed > 0) process.exit(1)
