#!/usr/bin/env node
/**
 * HestiaCP provisioning E2E test
 *
 * Calls the HestiaCP API directly (mirrors server/utils/hestia.ts logic)
 * to verify the full provision → verify → cleanup cycle works.
 *
 * Usage:
 *   NUXT_HESTIA_API_URL=... NUXT_HESTIA_API_KEY=... node scripts/test-hestia-provision.mjs
 *
 * All env vars are read from the environment; source your .env before running:
 *   node -e "$(node -p "Object.entries(require('fs').readFileSync('.env','utf8').split('\n').filter(l=>l&&!l.startsWith('#')).reduce((acc,l)=>{const[k,...v]=l.split('=');acc[k]=v.join('=');return acc},{})).map(([k,v])=>\`process.env['${k}']='${v.replace(/'/g,\"'\\\\''\")}'\`).join(';')")"
 * Or simply:
 *   set -a && source .env && set +a && node scripts/test-hestia-provision.mjs
 */

import { readFileSync } from 'node:fs'

// Load .env manually (simple KEY=VALUE parser)
try {
  const env = readFileSync('.env', 'utf8')
  for (const line of env.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const k = trimmed.slice(0, eq).trim()
    const v = trimmed.slice(eq + 1).trim()
    if (!(k in process.env)) process.env[k] = v
  }
} catch { /* .env missing — use environment as-is */ }

const API_URL    = process.env.NUXT_HESTIA_API_URL   || ''
const API_KEY    = process.env.NUXT_HESTIA_API_KEY   || ''
const ADMIN_USER = process.env.NUXT_HESTIA_ADMIN_USER || 'admin'

if (!API_URL || !API_KEY) {
  console.error('[ERROR] NUXT_HESTIA_API_URL and NUXT_HESTIA_API_KEY must be set')
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

// Mirror callHestiaApi from server/utils/hestia.ts
async function callHestiaApi(cmd, args = []) {
  const form = new URLSearchParams()
  form.set('hash', API_KEY)
  form.set('user', ADMIN_USER)
  form.set('cmd', cmd)
  args.forEach((arg, i) => form.set(`arg${i + 1}`, arg))

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    // Node 18+ fetch does not do TLS verification bypass natively;
    // the VPS uses a self-signed cert — use HTTP over port 8083 or accept the cert
  })
  return (await res.text()).trim()
}

function toHestiaUsername(email) {
  const base = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16)
  return base.length >= 2 ? base : base.padEnd(2, 'x')
}

const TEST_EMAIL    = 'e2etest@bilinix.test'
const TEST_PASSWORD = 'Pr0vis!onTest99'
const TEST_PACKAGE  = 'STARTER'
const TEST_USERNAME = `${toHestiaUsername(TEST_EMAIL)}${Date.now().toString().slice(-4)}`

console.log('\n\x1b[1m══ HestiaCP Provisioning E2E ══\x1b[0m')
console.log(`${INFO} API URL:   ${API_URL}`)
console.log(`${INFO} Admin:     ${ADMIN_USER}`)
console.log(`${INFO} Test user: ${TEST_USERNAME}  pkg=${TEST_PACKAGE}`)
console.log()

// ── Step 1: API connectivity ────────────────────────────────────────────────
console.log('\x1b[1m── Step 1: API connectivity (v-list-user admin)\x1b[0m')
let adminJson
try {
  adminJson = await callHestiaApi('v-list-user', [ADMIN_USER, 'json'])
  console.log(`${INFO} Raw response (first 120 chars): ${adminJson.slice(0, 120)}`)
} catch (err) {
  console.log(`${FAIL} API call threw — ${err.message}`)
  console.log('       Is the VPS reachable? Does Node trust the self-signed cert?')
  console.log('       Try: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/test-hestia-provision.mjs')
  process.exit(1)
}
let adminData
try { adminData = JSON.parse(adminJson) } catch { adminData = null }
assert('API returns valid JSON for admin user', !!adminData?.[ADMIN_USER],
  adminData ? 'key missing' : 'non-JSON: ' + adminJson.slice(0, 80))

// ── Step 2: Provision test user ─────────────────────────────────────────────
console.log('\n\x1b[1m── Step 2: Create hosting account\x1b[0m')
console.log(`${INFO} v-add-user ${TEST_USERNAME} *** ${TEST_EMAIL} ${TEST_PACKAGE}`)
let createResult
try {
  createResult = await callHestiaApi('v-add-user', [
    TEST_USERNAME, TEST_PASSWORD, TEST_EMAIL, TEST_PACKAGE
  ])
} catch (err) {
  console.log(`${FAIL} v-add-user threw — ${err.message}`)
  process.exit(1)
}
console.log(`${INFO} v-add-user result: "${createResult}"`)
assert('v-add-user returns OK/empty/0 (success)',
  createResult === 'OK' || createResult === '' || createResult === '0',
  `code: ${createResult}`)

// ── Step 3: Verify user exists ──────────────────────────────────────────────
console.log('\n\x1b[1m── Step 3: Verify account exists\x1b[0m')
const listRaw = await callHestiaApi('v-list-user', [TEST_USERNAME, 'json'])
console.log(`${INFO} v-list-user result (first 200 chars): ${listRaw.slice(0, 200)}`)
let listData
try { listData = JSON.parse(listRaw) } catch { listData = null }
assert('User exists in v-list-user JSON',       !!listData?.[TEST_USERNAME])
assert('Package matches',
  listData?.[TEST_USERNAME]?.PACKAGE === TEST_PACKAGE,
  `got: ${listData?.[TEST_USERNAME]?.PACKAGE}`)
assert('Email matches',
  listData?.[TEST_USERNAME]?.CONTACT === TEST_EMAIL,
  `got: ${listData?.[TEST_USERNAME]?.CONTACT}`)

// ── Step 4: Cleanup (delete test user) ─────────────────────────────────────
console.log('\n\x1b[1m── Step 4: Cleanup — delete test user\x1b[0m')
const deleteResult = await callHestiaApi('v-delete-user', [TEST_USERNAME, 'yes'])
console.log(`${INFO} v-delete-user result: "${deleteResult}"`)
assert('v-delete-user returns OK/empty/0', deleteResult === 'OK' || deleteResult === '' || deleteResult === '0',
  `code: ${deleteResult}`)

// Confirm gone
const goneRaw = await callHestiaApi('v-list-user', [TEST_USERNAME, 'json'])
let goneData
try { goneData = JSON.parse(goneRaw) } catch { goneData = null }
assert('User no longer exists after deletion', !goneData?.[TEST_USERNAME],
  goneData?.[TEST_USERNAME] ? 'still present' : '')

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\n\x1b[1m══ RESULT ══\x1b[0m')
console.log(`\x1b[32mPASS: ${passed}\x1b[0m   \x1b[31mFAIL: ${failed}\x1b[0m   Total: ${passed + failed}`)
if (failed === 0) {
  console.log('\x1b[32m\x1b[1m✓ HestiaCP provisioning E2E verified — create/verify/delete all pass.\x1b[0m')
} else {
  console.log('\x1b[31m\x1b[1m✗ Some checks failed — see output above.\x1b[0m')
  process.exit(1)
}
