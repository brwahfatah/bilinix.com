import { createError, getRequestHeader, type H3Event } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

export type WhmcsRequestPayload = Record<
  string,
  string | number | boolean | Array<string | number | boolean> | null | undefined
>

type SessionPayload = {
  uid: number
  exp: number
}

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12

const toWhmcsEndpoint = (apiUrl: string) => {
  const clean = apiUrl.trim().replace(/\/+$/, '')
  if (clean.endsWith('/includes/api.php')) return clean
  if (clean.endsWith('/api.php')) return clean
  return `${clean}/includes/api.php`
}

const asNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const signValue = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('hex')

const parsePayload = (encoded: string): SessionPayload | null => {
  try {
    const raw = Buffer.from(encoded, 'base64url').toString('utf8')
    const parsed = JSON.parse(raw) as SessionPayload

    if (!parsed || typeof parsed.uid !== 'number' || typeof parsed.exp !== 'number') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const getAuthTokenFromHeader = (event: H3Event) => {
  const header = getRequestHeader(event, 'authorization') || ''
  const [scheme, token] = header.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null
  }

  return token
}

export const issueSessionToken = (
  userId: number,
  ttlSeconds = DEFAULT_SESSION_TTL_SECONDS
) => {
  const runtime = useRuntimeConfig()
  const secret = String(runtime.whmcsTokenSecret || '')

  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing whmcsTokenSecret runtime config'
    })
  }

  const payload: SessionPayload = {
    uid: userId,
    exp: Date.now() + ttlSeconds * 1000
  }

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = signValue(encoded, secret)

  return `${encoded}.${signature}`
}

export const readSessionUserId = (token?: string | null) => {
  if (!token) return null

  const runtime = useRuntimeConfig()
  const secret = String(runtime.whmcsTokenSecret || '')

  if (!secret) return null

  const [encoded, incomingSignature] = token.split('.')
  if (!encoded || !incomingSignature) return null

  const expectedSignature = signValue(encoded, secret)

  if (incomingSignature.length !== expectedSignature.length) {
    return null
  }

  const validSignature = timingSafeEqual(
    Buffer.from(incomingSignature),
    Buffer.from(expectedSignature)
  )

  if (!validSignature) return null

  const payload = parsePayload(encoded)
  if (!payload) return null

  if (payload.exp < Date.now()) {
    return null
  }

  return payload.uid
}

const appendPayloadValue = (form: URLSearchParams, key: string, value: unknown) => {
  if (value === undefined || value === null) return

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      if (entry === undefined || entry === null) return
      form.append(`${key}[${index}]`, String(entry))
    })
    return
  }

  form.append(key, String(value))
}

export const callWhmcsApi = async (
  action: string,
  payload: WhmcsRequestPayload = {}
) => {
  const runtime = useRuntimeConfig()

  const apiUrl = String(runtime.whmcsApiUrl || '')
  const identifier = String(runtime.whmcsApiIdentifier || '')
  const secret = String(runtime.whmcsApiSecret || '')
  const accessKey = String(runtime.whmcsAccessKey || '')

  if (!apiUrl || !identifier || !secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WHMCS API is not configured. Set whmcsApiUrl, whmcsApiIdentifier, and whmcsApiSecret.'
    })
  }

  const endpoint = toWhmcsEndpoint(apiUrl)

  const form = new URLSearchParams()
  form.set('action', action)
  form.set('identifier', identifier)
  form.set('secret', secret)
  form.set('responsetype', 'json')

  if (accessKey) {
    form.set('accesskey', accessKey)
  }

  Object.entries(payload).forEach(([key, value]) => {
    appendPayloadValue(form, key, value)
  })

  const response = await $fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json'
    },
    body: form.toString(),
    parseResponse: (txt: string) => {
      try {
        return JSON.parse(txt) as Record<string, unknown>
      } catch {
        return {
          result: 'error',
          message: 'WHMCS API returned a non-JSON response.',
          raw: txt
        }
      }
    }
  }) as Record<string, unknown>
  

  if (!response || response.result === 'error') {
    const message =
      typeof response?.message === 'string'
        ? response.message
        : `WHMCS action ${action} failed`

    throw createError({
      statusCode: 400,
      statusMessage: message,
      data: response
    })
  }

  return response
}

export const normalizeClient = (client: Record<string, any>) => {
  const firstName = String(client.firstname || '')
  const lastName = String(client.lastname || '')

  return {
    id: asNumber(client.id || client.userid),
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    email: String(client.email || ''),
    company: String(client.companyname || ''),
    status: String(client.status || 'Active'),
    currency: String(client.currency_code || client.currency || 'USD')
  }
}

export const toArray = <T = any>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []

  // WHMCS commonly returns objects like { product: [...] } or { invoice: [...] }
  const first = Object.values(value as Record<string, unknown>)[0]

  if (Array.isArray(first)) return first as T[]
  if (first && typeof first === 'object') return [first as T]

  return []
}