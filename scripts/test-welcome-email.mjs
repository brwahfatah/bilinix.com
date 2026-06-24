#!/usr/bin/env node
/**
 * Smoke-test for the welcome email service.
 * Reads SMTP settings from .env and sends a test welcome email.
 *
 * Usage:
 *   TEST_EMAIL=you@example.com node scripts/test-welcome-email.mjs
 *
 * If TEST_EMAIL is not set, the email is sent to NUXT_SMTP_USER (the SMTP login).
 */

import { createTransport } from 'nodemailer'
import { readFileSync }    from 'node:fs'

// ── Load .env ─────────────────────────────────────────────────────────────────
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
} catch { /* .env not present — rely on environment */ }

// ── Read SMTP config (mirrors server/utils/email.ts) ─────────────────────────
const host = process.env.NUXT_SMTP_HOST || ''
const port = Number(process.env.NUXT_SMTP_PORT || 587)
const user = process.env.NUXT_SMTP_USER || ''
const pass = process.env.NUXT_SMTP_PASS || ''
const from = process.env.NUXT_SMTP_FROM || ''
const to   = process.env.TEST_EMAIL      || user

// ── Pre-flight checks ─────────────────────────────────────────────────────────
const missing = ['NUXT_SMTP_HOST', 'NUXT_SMTP_USER', 'NUXT_SMTP_PASS', 'NUXT_SMTP_FROM']
  .filter(k => !process.env[k])

if (missing.length) {
  console.error(`[FAIL] Missing SMTP config: ${missing.join(', ')}`)
  process.exit(1)
}

if (!to) {
  console.error('[FAIL] No recipient: set TEST_EMAIL or NUXT_SMTP_USER')
  process.exit(1)
}

// ── Build test payload (matches sendWelcomeEmail body format) ─────────────────
const TEST_USERNAME    = 'testuser'
const TEST_PACKAGE     = 'STARTER'

const body = [
  'Hello,',
  '',
  'Your hosting account has been created successfully.',
  '',
  `Username: ${TEST_USERNAME}`,
  'Password: [test-run — not a real password]',
  '',
  'Control Panel:',
  'https://server1.bilinix.com:8083',
  '',
  'Package:',
  TEST_PACKAGE,
  '',
  'FTP Host:',
  'server1.bilinix.com',
  '',
  'Webmail:',
  'https://server1.bilinix.com/webmail',
  '',
  'Thank you for choosing Bilinix Hosting.',
].join('\n')

// ── Send ──────────────────────────────────────────────────────────────────────
console.log(`[INFO] SMTP host : ${host}:${port}`)
console.log(`[INFO] From      : ${from}`)
console.log(`[INFO] To        : ${to}`)

try {
  const transporter = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const info = await transporter.sendMail({
    from,
    to,
    subject: '[TEST] Welcome to Bilinix Hosting',
    text: body,
  })

  if (!info.messageId) {
    throw new Error('Transport returned no messageId — delivery unconfirmed')
  }

  console.log('[PASS] Welcome email sent successfully')
  console.log(`[INFO] messageId : ${info.messageId}`)
} catch (err) {
  console.error('[FAIL]', err.message ?? err)
  process.exit(1)
}
