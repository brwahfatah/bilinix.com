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

const fakeWhmcsApi = (
  action: string,
  payload: WhmcsRequestPayload = {}
): Record<string, unknown> => {
  const clientId = asNumber(payload.clientid || payload.userid || payload.client_id, 1001)
  const email = String(payload.email || 'demo@bilinix.com')
  const now = new Date().toISOString().split('T')[0]!

  switch (action) {
    case 'ValidateLogin':
      return { result: 'success', userid: 1001 }
    case 'AddClient':
      return { result: 'success', clientid: 1001 + Math.floor(Math.random() * 1000) }
    case 'GetClientsDetails':
      return {
        result: 'success',
        id: clientId, userid: clientId,
        firstname: 'Demo', lastname: 'User',
        email: 'demo@bilinix.com', companyname: '',
        status: 'Active', currency_code: 'USD'
      }
    case 'GetClientsProducts':
      return { result: 'success', products: { product: [
        { id: 501, name: 'Starter VPS', domain: 'demo.bilinix.com', status: 'Active',
          dedicatedip: '10.0.0.1', productname: 'Starter VPS', billingcycle: 'monthly',
          nextduedate: '2026-07-25' }
      ] } }
    case 'GetClientsDomains':
      if (payload.domainid) {
        return { result: 'success', domains: { domain: [
          { id: payload.domainid, domain: 'demo-site.com', status: 'Active',
            nextduedate: '2027-06-25', registrationdate: '2026-06-25',
            autorenew: 1, locked: 0, idprotection: 0, recurringamount: '12.99',
            nameserver1: 'ns1.bilinix.com', nameserver2: 'ns2.bilinix.com' }
        ] } }
      }
      return { result: 'success', domains: { domain: [
        { id: 301, domain: 'demo-site.com', status: 'Active',
          nextduedate: '2027-06-25', registrationdate: '2026-06-25',
          autorenew: 1, locked: 0, idprotection: 0, recurringamount: '12.99',
          nameserver1: 'ns1.bilinix.com', nameserver2: 'ns2.bilinix.com' }
      ] } }
    case 'GetInvoices':
      return { result: 'success', invoices: { invoice: [
        { id: 10001, status: 'Paid', total: '29.99', date: now, duedate: now, datepaid: now, currencycode: 'USD' },
        { id: 10002, status: 'Unpaid', total: '12.99', date: now, duedate: '2026-07-25', datepaid: '', currencycode: 'USD' }
      ] } }
    case 'GetInvoice':
      return { result: 'success', invoiceid: payload.invoiceid, invoicenum: String(payload.invoiceid),
        status: 'Unpaid', total: '29.99', subtotal: '29.99', tax: '0.00',
        date: now, duedate: now, datepaid: '', currencycode: 'USD', notes: '',
        items: { item: [{ id: 1, type: 'Hosting', description: 'Starter Hosting - Monthly', amount: '29.99' }] } }
    case 'GetProducts':
      return { result: 'success', products: { product: [
        { pid: 1, name: 'Starter VPS', pricing: [{ monthly: 6 }] },
        { pid: 2, name: 'Business VPS', pricing: [{ monthly: 14 }] },
        { pid: 3, name: 'Pro VPS', pricing: [{ monthly: 29 }] }
      ] } }
    case 'DomainWhois':
      return { result: 'success', status: 'available' }
    case 'AddOrder':
      return { result: 'success', orderid: 2001, invoiceid: 10003 + Math.floor(Math.random() * 100) }
    case 'AddInvoicePayment':
      return { result: 'success' }
    case 'GetTickets':
      return { result: 'success', tickets: { ticket: [
        { id: 401, tid: '401', title: 'Setup help', status: 'Open',
          priority: 'Medium', deptname: 'Technical', date: now, lastreply: now }
      ] } }
    case 'GetTicket':
      return { result: 'success', id: payload.ticketid, tid: String(payload.ticketid),
        title: 'Setup help', status: 'Open', priority: 'Medium', deptname: 'Technical',
        date: now, lastreply: now, name: 'Demo User',
        message: 'I need help setting up my hosting account.',
        replies: { reply: [] } }
    case 'OpenTicket':
      return { result: 'success', id: 402 + Math.floor(Math.random() * 100), tid: '402' }
    case 'AddTicketReply':
      return { result: 'success' }
    case 'CloseTicket':
      return { result: 'success' }
    case 'ResetPassword':
      return { result: 'success' }
    case 'UpdateClientDetails':
    case 'UpdateClientPassword':
    case 'UpdateClientProduct':
    case 'UpdateClientDomain':
    case 'RenewDomain':
    case 'CreateSsoToken':
      return { result: 'success', redirect_url: '#' }
    default:
      return { result: 'success' }
  }
}

export const callWhmcsApi = async (
  action: string,
  payload: WhmcsRequestPayload = {}
) => {
  const runtime = useRuntimeConfig()
  const isFake = String(runtime.whmcsDriver) === 'fake'

  if (isFake) {
    return fakeWhmcsApi(action, payload)
  }

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