#!/usr/bin/env node
/**
 * Invoice isolation audit — verifies per-client invoice isolation,
 * cross-user access denial, unique IDs, and real order creation.
 *
 * Usage:
 *   TOKEN_A=<userA-token> TOKEN_B=<userB-token> node scripts/audit-invoices.mjs
 */
const BASE = process.env.LARAVEL_BASE_URL || 'https://api.bilinix.com/api'
const TOKEN_A = process.env.TOKEN_A || ''
const TOKEN_B = process.env.TOKEN_B || ''

if (!TOKEN_A || !TOKEN_B) {
  console.error('\x1b[31m[ERROR]\x1b[0m Set TOKEN_A and TOKEN_B before running.')
  process.exit(1)
}

const PASS = '\x1b[32m[PASS]\x1b[0m'
const FAIL = '\x1b[31m[FAIL]\x1b[0m'
const INFO = '\x1b[36m[INFO]\x1b[0m'
const WARN = '\x1b[33m[WARN]\x1b[0m'
let pass = 0; let fail = 0

function assert(label, ok, detail = '') {
  if (ok) { console.log(`${PASS} ${label}`); pass++ }
  else     { console.log(`${FAIL} ${label}${detail ? ' — ' + detail : ''}`); fail++ }
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

async function post(path, payload, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

console.log('\n\x1b[1m══ Invoice Isolation & Generation Audit ══\x1b[0m')
console.log(`${INFO} API base: ${BASE}\n`)

// ── 0. Verify both tokens ──────────────────────────────────────────────────────
console.log('\x1b[1m── 0. Auth verification ──\x1b[0m')
const [meA, meB] = await Promise.all([get('/auth/me', TOKEN_A), get('/auth/me', TOKEN_B)])
assert('Token A is valid (200)', meA.status === 200, `HTTP ${meA.status}`)
assert('Token B is valid (200)', meB.status === 200, `HTTP ${meB.status}`)
const emailA = meA.body?.data?.email ?? meA.body?.user?.email ?? '?'
const emailB = meB.body?.data?.email ?? meB.body?.user?.email ?? '?'
console.log(`${INFO} User A: ${emailA}`)
console.log(`${INFO} User B: ${emailB}`)
assert('Users are different accounts', emailA !== emailB, `both are ${emailA}`)
console.log()

// ── 1. Fetch invoice lists for both users ─────────────────────────────────────
console.log('\x1b[1m── 1. Invoice lists (per-client isolation) ──\x1b[0m')
const [listA, listB] = await Promise.all([
  get('/billing/invoices', TOKEN_A),
  get('/billing/invoices', TOKEN_B),
])

console.log(`${INFO} User A: HTTP ${listA.status}`)
const invA = listA.body?.data ?? []
invA.forEach(i => console.log(`${INFO}   id=${i.id}  number=${i.number}  status=${i.status}  total=${i.total}`))

console.log(`${INFO} User B: HTTP ${listB.status}`)
const invB = listB.body?.data ?? []
invB.forEach(i => console.log(`${INFO}   id=${i.id}  number=${i.number}  status=${i.status}  total=${i.total}`))

assert('User A gets invoices (200)',       listA.status === 200)
assert('User B gets invoices (200)',       listB.status === 200)
assert('User A has at least 1 invoice',   invA.length > 0, `got ${invA.length}`)
assert('User B has at least 1 invoice',   invB.length > 0, `got ${invB.length}`)

const idsA = invA.map(i => String(i.id)).sort().join(',')
const idsB = invB.map(i => String(i.id)).sort().join(',')
const identical = idsA === idsB && idsA.length > 0
assert('Invoice lists are DIFFERENT per user', !identical, `both returned: [${idsA}]`)
console.log()

// ── 2. Cross-user access denied ───────────────────────────────────────────────
console.log('\x1b[1m── 2. Cross-user invoice access (ownership leak check) ──\x1b[0m')
if (invA.length > 0) {
  const firstIdA = invA[0].id
  const crossFetch = await get(`/billing/invoices/${firstIdA}`, TOKEN_B)
  console.log(`${INFO} User B fetching User A invoice #${firstIdA}: HTTP ${crossFetch.status}`)
  assert('Cross-user fetch is denied (403/404)', crossFetch.status === 403 || crossFetch.status === 404,
    `got HTTP ${crossFetch.status} — invoice is accessible to wrong user`)
  if (crossFetch.status === 200) {
    console.log(`${FAIL}   → OWNERSHIP LEAK: User B can read User A's invoice #${firstIdA}`)
  }
}
if (invB.length > 0) {
  const firstIdB = invB[0].id
  const crossFetchB = await get(`/billing/invoices/${firstIdB}`, TOKEN_A)
  console.log(`${INFO} User A fetching User B invoice #${firstIdB}: HTTP ${crossFetchB.status}`)
  assert('Reverse cross-user fetch denied (403/404)', crossFetchB.status === 403 || crossFetchB.status === 404,
    `got HTTP ${crossFetchB.status}`)
}
console.log()

// ── 3. No hardcoded IDs (2001/2002/2003) ─────────────────────────────────────
console.log('\x1b[1m── 3. Hardcoded ID detection ──\x1b[0m')
const hardcodedIds = ['2001', '2002', '2003']
const allInvIds = [...new Set([...invA.map(i => String(i.id)), ...invB.map(i => String(i.id))])]
const hasHardcoded = hardcodedIds.some(id => allInvIds.includes(id))
assert('No hardcoded IDs (2001/2002/2003) present', !hasHardcoded,
  `found: ${allInvIds.filter(id => hardcodedIds.includes(id)).join(', ')}`)
console.log()

// ── 4. createOrder generates unique IDs ──────────────────────────────────────
console.log('\x1b[1m── 4. Order creation — unique invoice IDs ──\x1b[0m')
const countBefore = invA.length

// Step 4a: Clear User A's cart, then add a product
await fetch(`${BASE}/cart`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN_A}`, Accept: 'application/json' } })
const addItemRes = await post('/cart/items', {
  product_id:    '3',
  name:          'VPS 2GB',
  type:          'server',
  billing_cycle: 'monthly',
  quantity:      1,
  unit_price:    9.99,
}, TOKEN_A)
console.log(`${INFO} POST /cart/items: HTTP ${addItemRes.status}`)
assert('Added product to cart (200)', addItemRes.status === 200, `HTTP ${addItemRes.status}: ${addItemRes.body?.message ?? ''}`)

// Step 4b: Checkout
const checkoutRes = await post('/orders/checkout', { payment_method: 'banktransfer' }, TOKEN_A)
console.log(`${INFO} POST /orders/checkout: HTTP ${checkoutRes.status}`)
if (checkoutRes.body?.data) {
  console.log(`${INFO} Response: invoice_id=${checkoutRes.body.data.invoice_id ?? '?'}  id=${checkoutRes.body.data.id ?? '?'}  total=${checkoutRes.body.data.total ?? '?'}`)
}
assert('Checkout returns 201', checkoutRes.status === 201, `HTTP ${checkoutRes.status}: ${checkoutRes.body?.message ?? ''}`)

const newInvoiceId = checkoutRes.body?.data?.invoice_id
const newOrderId   = checkoutRes.body?.data?.id
assert('New invoice ID returned',              !!newInvoiceId, 'no invoiceid in response')
assert('New order ID returned',                !!newOrderId,   'no orderid in response')
assert('Invoice ID is NOT hardcoded 2002',     String(newInvoiceId) !== '2002', `got ${newInvoiceId}`)
assert('Order ID is NOT hardcoded 4099',       String(newOrderId) !== '4099',   `got ${newOrderId}`)
assert('Invoice ID is unique (>= 10001)',      Number(newInvoiceId) >= 10001, `got ${newInvoiceId}`)
assert('Order ID is unique (>= 20001)',        Number(newOrderId)   >= 20001, `got ${newOrderId}`)

if (newInvoiceId) {
  // Verify new invoice appears in User A's list but NOT User B's
  const [listANew, listBNew] = await Promise.all([
    get('/billing/invoices', TOKEN_A),
    get('/billing/invoices', TOKEN_B),
  ])
  const idsANew = (listANew.body?.data ?? []).map(i => String(i.id))
  const idsBNew = (listBNew.body?.data ?? []).map(i => String(i.id))
  assert('New invoice visible to User A',     idsANew.includes(String(newInvoiceId)), `ids: [${idsANew.join(',')}]`)
  assert('New invoice NOT visible to User B', !idsBNew.includes(String(newInvoiceId)), `leaked to B: [${idsBNew.join(',')}]`)
  assert('User A invoice count stable or grew', idsANew.length >= countBefore, `was ${countBefore}, now ${idsANew.length}`)
}
console.log()

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\x1b[1m══ AUDIT RESULT ══\x1b[0m')
console.log(`\x1b[32mPASS: ${pass}\x1b[0m  \x1b[31mFAIL: ${fail}\x1b[0m  Total: ${pass + fail}`)
if (fail === 0) {
  console.log('\x1b[32m\x1b[1m✓ All isolation checks passed.\x1b[0m')
} else {
  console.log('\x1b[31m\x1b[1m✗ Some checks failed — see above.\x1b[0m')
  process.exit(1)
}
