import { createError, getRequestHeader, readBody } from 'h3'
import {
  hestiaProvisionUser,
  hestiaUserExists,
  toHestiaUsername,
  type HestiaPackage
} from '~/server/utils/hestia'
import { readSessionUserId, getAuthTokenFromHeader } from '~/server/utils/whmcs'

const VALID_PACKAGES: HestiaPackage[] = ['STARTER', 'BUSINESS', 'AGENCY']

const asString = (v: unknown, fallback = '') =>
  v === undefined || v === null ? fallback : String(v)

/**
 * POST /api/hestia/provision
 *
 * Called by the ordering system after a hosting payment is confirmed.
 * Creates a HestiaCP user account with the purchased package.
 *
 * Body:
 *   email        string   Customer email (used as login + to derive username)
 *   password     string   Desired control-panel/mail/FTP password (min 8 chars)
 *   package      string   STARTER | BUSINESS | AGENCY
 *   domain?      string   Primary domain to add to the account (optional)
 *   username?    string   Override the auto-derived username (optional)
 */
export default defineEventHandler(async (event) => {
  const token = getAuthTokenFromHeader(event)
  const userId = readSessionUserId(token)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  }

  const body = await readBody<{
    email?: string
    password?: string
    package?: string
    domain?: string
    username?: string
  }>(event)

  const email = asString(body?.email).trim().toLowerCase()
  const password = asString(body?.password)
  const pkg = asString(body?.package).toUpperCase() as HestiaPackage
  const domainRaw = asString(body?.domain).trim().toLowerCase() || undefined

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 422, statusMessage: 'Valid email is required' })
  }

  if (!password || password.length < 8) {
    throw createError({ statusCode: 422, statusMessage: 'Password must be at least 8 characters' })
  }

  if (!VALID_PACKAGES.includes(pkg)) {
    throw createError({
      statusCode: 422,
      statusMessage: `package must be one of: ${VALID_PACKAGES.join(', ')}`
    })
  }

  // Derive or accept a username
  let username = asString(body?.username)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16)

  if (username.length < 2) {
    username = toHestiaUsername(email)
  }

  // If the username is taken, append a numeric suffix
  if (await hestiaUserExists(username)) {
    const suffix = Date.now().toString().slice(-4)
    username = `${username.slice(0, 12)}${suffix}`
  }

  const result = await hestiaProvisionUser({
    username,
    password,
    email,
    package: pkg,
    domain: domainRaw
  })

  return {
    success: true,
    account: result
  }
})
