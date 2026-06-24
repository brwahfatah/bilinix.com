import { createError } from 'h3'

export type HestiaPackage = 'STARTER' | 'BUSINESS' | 'AGENCY'

export type HestiaProvisionResult = {
  username: string
  email: string
  package: HestiaPackage
  panel_url: string
  webmail_url: string
  ftp_host: string
}

const asString = (v: unknown, fallback = '') =>
  v === undefined || v === null ? fallback : String(v)

/**
 * Call the HestiaCP legacy REST API.
 * POST https://<host>:8083/api/  with hash + user + cmd + arg1..argN
 */
export const callHestiaApi = async (cmd: string, args: string[] = []): Promise<string> => {
  const runtime = useRuntimeConfig()

  const apiUrl = asString(runtime.hestiaApiUrl)
  const hash = asString(runtime.hestiaApiKey)
  const adminUser = asString(runtime.hestiaAdminUser) || 'admin'

  if (!apiUrl || !hash) {
    throw createError({
      statusCode: 500,
      statusMessage: 'HestiaCP API is not configured. Set hestiaApiUrl and hestiaApiKey.'
    })
  }

  const form = new URLSearchParams()
  form.set('hash', hash)
  form.set('user', adminUser)
  form.set('cmd', cmd)
  args.forEach((arg, i) => form.set(`arg${i + 1}`, arg))

  const raw = await $fetch<string>(apiUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    // HestiaCP uses a self-signed cert on fresh installs
    ignoreResponseError: true,
    parseResponse: (txt) => txt
  })

  return asString(raw).trim()
}

/**
 * Derive a valid HestiaCP username from an email address.
 * Rules: lowercase, alphanumeric only, 2–16 chars.
 */
export const toHestiaUsername = (email: string): string => {
  const base = email.split('@')[0]!
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16)

  return base.length >= 2 ? base : base.padEnd(2, 'x')
}

/**
 * Check whether a HestiaCP username already exists.
 */
export const hestiaUserExists = async (username: string): Promise<boolean> => {
  const result = await callHestiaApi('v-list-user', [username, 'json'])
  try {
    const parsed = JSON.parse(result)
    return !!parsed?.[username]
  } catch {
    return false
  }
}

/**
 * Create a HestiaCP user account and assign the given hosting package.
 * Returns the provisioned account details.
 */
export const hestiaProvisionUser = async (opts: {
  username: string
  password: string
  email: string
  package: HestiaPackage
  domain?: string
}): Promise<HestiaProvisionResult> => {
  const runtime = useRuntimeConfig()
  const apiUrl = asString(runtime.hestiaApiUrl)
  // Derive base URL: strip /api/ suffix to get the panel host
  const panelHost = apiUrl.replace(/\/api\/?$/, '')

  // Create the user; arg order: username password email package first_name last_name
  const createResult = await callHestiaApi('v-add-user', [
    opts.username,
    opts.password,
    opts.email,
    opts.package
  ])

  // HestiaCP 1.9.6 returns "OK" on success; older versions return "" or "0"
  if (createResult && !createResult.match(/^(OK|0)$|^$/)) {
    throw createError({
      statusCode: 400,
      statusMessage: `HestiaCP provisioning failed: ${createResult}`
    })
  }

  // Optionally add the customer's domain
  if (opts.domain) {
    await callHestiaApi('v-add-web-domain', [opts.username, opts.domain])
    await callHestiaApi('v-add-mail-domain', [opts.username, opts.domain])
  }

  return {
    username: opts.username,
    email: opts.email,
    package: opts.package,
    panel_url: `${panelHost}`,
    webmail_url: `${panelHost}/webmail`,
    ftp_host: new URL(panelHost).hostname
  }
}
