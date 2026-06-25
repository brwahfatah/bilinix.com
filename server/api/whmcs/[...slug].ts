import { createError, getHeader, getMethod, getQuery, readBody, type H3Event } from 'h3'
import {
  callWhmcsApi,
  getAuthTokenFromHeader,
  issueSessionToken,
  normalizeClient,
  readSessionUserId,
  toArray,
  type WhmcsRequestPayload
} from '~/server/utils/whmcs'

type CartItem = {
  id: string
  type: 'domain' | 'server' | 'hosting' | 'dedicated'
  name: string
  price: number
  quantity?: number
  period?: number
  periodLabel?: string
  meta?: Record<string, any>
}

type CartSnapshot = {
  items: CartItem[]
  updatedAt: string
}

const CART_STORAGE_PREFIX = 'whmcs-cart:'

const FALLBACK_TLDS = [
  { tld: '.com', price: 9.99, popular: true },
  { tld: '.net', price: 10.99, popular: false },
  { tld: '.org', price: 8.99, popular: false },
  { tld: '.io', price: 34.99, popular: true }
]

const FALLBACK_VPS_PLANS = [
  {
    id: 1,
    name: 'Starter VPS',
    cpu: '1 vCPU',
    ram: '2 GB RAM',
    storage: '40 GB NVMe',
    price: 6,
    billingcycle: 'monthly'
  },
  {
    id: 2,
    name: 'Business VPS',
    cpu: '2 vCPU',
    ram: '4 GB RAM',
    storage: '80 GB NVMe',
    price: 14,
    billingcycle: 'monthly',
    popular: true
  },
  {
    id: 3,
    name: 'Pro VPS',
    cpu: '4 vCPU',
    ram: '8 GB RAM',
    storage: '160 GB NVMe',
    price: 29,
    billingcycle: 'monthly'
  }
]

const asNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const asString = (value: unknown, fallback = '') => {
  if (value === undefined || value === null) return fallback
  return String(value)
}

const asArray = <T = any>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []
  return Object.values(value as Record<string, T>)
}

const getStorageKey = (cartToken: string) => `${CART_STORAGE_PREFIX}${cartToken}`
const getCartStorage = () => useStorage('data')

const saveCart = async (cartToken: string, items: CartItem[]) => {
  const storage = getCartStorage()
  await storage.setItem<CartSnapshot>(getStorageKey(cartToken), {
    items,
    updatedAt: new Date().toISOString()
  })
}

const readCart = async (cartToken: string) => {
  const storage = getCartStorage()
  return (await storage.getItem<CartSnapshot>(getStorageKey(cartToken))) || null
}

const extractClientId = (event: H3Event) => {
  const token = getAuthTokenFromHeader(event)
  const clientId = readSessionUserId(token)

  if (!clientId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated request' })
  }

  return clientId
}

const normalizeServiceStatus = (status: string) => {
  const value = status.toLowerCase()

  if (value.includes('active')) return 'running'
  if (value.includes('suspended')) return 'stopped'
  if (value.includes('pending')) return 'provisioning'
  if (value.includes('terminated')) return 'terminated'

  return value || 'unknown'
}

const normalizeService = (service: Record<string, any>) => {
  const dedicatedIp = asString(service.dedicatedip || service.assignedips || '')

  return {
    id: asNumber(service.id),
    name: asString(service.name || service.productname || service.domain || `Service #${service.id}`),
    status: normalizeServiceStatus(asString(service.status)),
    raw_status: asString(service.status),
    ip_address: dedicatedIp || null,
    os: asString(service.configoption1 || service.configoption2 || service.server || 'Managed VPS'),
    plan: asString(service.productname || service.groupname || 'VPS Plan'),
    domain: asString(service.domain || ''),
    billingcycle: asString(service.billingcycle || ''),
    nextduedate: asString(service.nextduedate || ''),
    raw: service
  }
}

const normalizeInvoice = (invoice: Record<string, any>) => ({
  id: asNumber(invoice.id),
  status: asString(invoice.status).toLowerCase(),
  amount: asNumber(invoice.total || invoice.amountoutstanding || invoice.amount),
  created_at: asString(invoice.date || invoice.datecreated),
  due_date: asString(invoice.duedate || ''),
  paid_at: asString(invoice.datepaid || ''),
  currency: asString(invoice.currency || invoice.currencycode || 'USD')
})

const getClientProfile = async (clientId: number) => {
  const client = await callWhmcsApi('GetClientsDetails', {
    clientid: clientId,
    stats: true
  })

  return normalizeClient(client as Record<string, any>)
}

const getClientServices = async (clientId: number) => {
  const result = await callWhmcsApi('GetClientsProducts', {
    clientid: clientId,
    limitnum: 500,
    stats: true
  })

  const products = toArray<Record<string, any>>((result as any).products)
  return products.map(normalizeService)
}

const normalizeDomain = (domain: Record<string, any>) => {
  const ns = [
    domain.nameserver1, domain.nameserver2, domain.nameserver3,
    domain.nameserver4, domain.nameserver5
  ].filter(Boolean)

  return {
    id: asNumber(domain.id),
    domain: asString(domain.domain),
    status: asString(domain.status),
    next_due_date: asString(domain.nextduedate || ''),
    expiry_date: asString(domain.expirydate || domain.nextduedate || ''),
    registration_date: asString(domain.registrationdate || domain.regdate || ''),
    type: asString(domain.type || 'register'),
    auto_renew: asNumber(domain.autorenew) === 1,
    locked: asNumber(domain.locked) === 1,
    id_protection: asNumber(domain.idprotection) === 1,
    recurring_amount: parseFloat(String(domain.recurringamount || '0')) || 0,
    nameserver1: asString(ns[0] || ''),
    nameserver2: asString(ns[1] || ''),
    nameserver3: asString(ns[2] || ''),
    nameserver4: asString(ns[3] || ''),
    nameserver5: asString(ns[4] || ''),
    registrant: {
      name: asString(domain.registrant || domain.name || ''),
      email: asString(domain.email || ''),
      phone: asString(domain.phonenumber || domain.phone || ''),
      address1: asString(domain.address1 || ''),
      city: asString(domain.city || ''),
      country: asString(domain.country || ''),
    },
    raw: domain
  }
}

const getClientDomains = async (clientId: number) => {
  const result = await callWhmcsApi('GetClientsDomains', {
    clientid: clientId,
    limitnum: 500
  })

  const domains = toArray<Record<string, any>>((result as any).domains)
  return domains.map(normalizeDomain)
}

const getSingleDomain = async (clientId: number, domainId: number) => {
  const result = await callWhmcsApi('GetClientsDomains', {
    clientid: clientId,
    domainid: domainId
  })
  const domains = toArray<Record<string, any>>((result as any).domains)
  if (!domains.length) return null
  return normalizeDomain(domains[0]!)
}

const getClientInvoices = async (clientId: number) => {
  const result = await callWhmcsApi('GetInvoices', {
    userid: clientId,
    limitnum: 100,
    orderby: 'date',
    order: 'DESC'
  })

  const invoices = toArray<Record<string, any>>((result as any).invoices)
  return invoices.map(normalizeInvoice)
}

const buildOrderPayloadFromCart = (clientId: number, items: CartItem[]) => {
  const pid: Array<number> = []
  const billingcycle: Array<string> = []
  const domain: Array<string> = []
  const domaintype: Array<string> = []
  const regperiod: Array<number> = []

  for (const item of items) {
    if (item.type === 'server' || item.type === 'hosting' || item.type === 'dedicated') {
      const productId =
        asNumber(item.meta?.whmcs_product_id) ||
        asNumber(item.meta?.whmcsProductId) ||
        asNumber(item.meta?.plan_id)

      if (!productId) {
        throw createError({
          statusCode: 400,
          statusMessage:
            `Missing WHMCS product mapping for cart item "${item.name}". ` +
            'Set meta.whmcs_product_id when adding VPS plans to cart.'
        })
      }

      pid.push(productId)
      billingcycle.push(item.period && item.period > 1 ? 'annually' : 'monthly')
      domain.push(asString(item.meta?.hostname || item.meta?.domain || ''))
    }

    if (item.type === 'domain') {
      const fullDomain = asString(item.meta?.domain || item.name)

      if (!fullDomain.includes('.')) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid domain item "${item.name}" in cart.`
        })
      }

      domain.push(fullDomain)
      domaintype.push('register')
      regperiod.push(asNumber(item.period, 1))
    }
  }

  if (!pid.length && !domain.length) {
    throw createError({ statusCode: 400, statusMessage: 'Cart is empty' })
  }

  const payload: WhmcsRequestPayload = {
    clientid: clientId,
    paymentmethod: 'mailin',
    noinvoice: false,
    noemail: true
  }

  if (pid.length) {
    payload.pid = pid
    payload.billingcycle = billingcycle
  }

  if (domain.length) {
    payload.domain = domain
  }

  if (domaintype.length) {
    payload.domaintype = domaintype
  }

  if (regperiod.length) {
    payload.regperiod = regperiod
  }

  return payload
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event).toUpperCase()
  const slugValue = event.context.params?.slug
  const slug = Array.isArray(slugValue)
    ? slugValue
    : slugValue
      ? [slugValue]
      : []

  const path = slug.join('/')

  if (method === 'POST' && path === 'auth/login') {
    const body = await readBody<{ email?: string; password?: string }>(event)

    const email = asString(body?.email).trim().toLowerCase()
    const password = asString(body?.password)

    if (!email || !password) {
      throw createError({ statusCode: 422, statusMessage: 'Email and password are required' })
    }

    const login = await callWhmcsApi('ValidateLogin', {
      email,
      password2: password
    })

    const userId = asNumber((login as any).userid)

    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    }

    const profile = await getClientProfile(userId)
    const token = issueSessionToken(userId)

    return {
      data: {
        token,
        user: { id: profile.id, name: profile.full_name, email: profile.email, role: 'client', created_at: '' }
      },
      message: 'Login successful',
      errors: null
    }
  }

  if (method === 'POST' && path === 'auth/register') {
    const body = await readBody<any>(event)

    const email = asString(body?.email).trim().toLowerCase()
    const password = asString(body?.password)
    const passwordConfirmation = asString(body?.password_confirmation)

    if (!email || !password) {
      throw createError({ statusCode: 422, statusMessage: 'Email and password are required' })
    }

    if (password !== passwordConfirmation) {
      throw createError({ statusCode: 422, statusMessage: 'Passwords do not match' })
    }

    const addClient = await callWhmcsApi('AddClient', {
      firstname: asString(body?.first_name || body?.firstname || 'New'),
      lastname: asString(body?.last_name || body?.lastname || 'Client'),
      email,
      password2: password,
      address1: asString(body?.address1 || 'Address not provided'),
      city: asString(body?.city || 'Baghdad'),
      state: asString(body?.state || 'Baghdad'),
      postcode: asString(body?.postcode || '10000'),
      country: asString(body?.country || 'IQ'),
      phonenumber: asString(body?.phonenumber || '+9640000000000'),
      noemail: true,
      skipvalidation: true
    })

    const userId = asNumber((addClient as any).clientid || (addClient as any).userid)

    if (!userId) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create WHMCS client account' })
    }

    const profile = await getClientProfile(userId)
    const token = issueSessionToken(userId)

    return {
      data: {
        token,
        user: { id: profile.id, name: profile.full_name, email: profile.email, role: 'client', created_at: '' }
      },
      message: 'Registration successful',
      errors: null
    }
  }

  if (method === 'GET' && path === 'auth/me') {
    const clientId = extractClientId(event)
    const profile = await getClientProfile(clientId)

    return {
      data: { id: profile.id, name: profile.full_name, email: profile.email, role: 'client', created_at: '' },
      message: 'OK',
      errors: null
    }
  }

  if (method === 'POST' && (path === 'auth/logout' || path === 'auth/logout-all')) {
    return { success: true }
  }

  if (method === 'POST' && path === 'cart/sync') {
    const body = await readBody<{ cart_token?: string; items?: CartItem[] }>(event)
    const cartToken = asString(body?.cart_token)

    if (!cartToken) {
      throw createError({ statusCode: 422, statusMessage: 'cart_token is required' })
    }

    await saveCart(cartToken, body?.items || [])

    return {
      success: true,
      cart_token: cartToken,
      items_count: (body?.items || []).length
    }
  }

  if (method === 'POST' && path === 'cart/merge') {
    const body = await readBody<{ cart_token?: string }>(event)

    return {
      success: true,
      cart_token: asString(body?.cart_token)
    }
  }

  if (method === 'POST' && path === 'cart/prepare') {
    const body = await readBody<{ cart_token?: string }>(event)
    const cartToken = asString(body?.cart_token)

    if (!cartToken) {
      throw createError({ statusCode: 422, statusMessage: 'cart_token is required' })
    }

    const snapshot = await readCart(cartToken)

    return {
      success: true,
      cart_token: cartToken,
      items: snapshot?.items || [],
      locked: true
    }
  }

  if (method === 'POST' && path === 'cart/checkout') {
    const clientId = extractClientId(event)
    const cartToken = asString(getHeader(event, 'x-cart-token'))

    if (!cartToken) {
      throw createError({ statusCode: 422, statusMessage: 'Missing X-Cart-Token header' })
    }

    const snapshot = await readCart(cartToken)

    if (!snapshot?.items?.length) {
      throw createError({ statusCode: 400, statusMessage: 'Cart is empty' })
    }

    const orderPayload = buildOrderPayloadFromCart(clientId, snapshot.items)
    const order = await callWhmcsApi('AddOrder', orderPayload)

    const invoiceId = asNumber((order as any).invoiceid)

    if (!invoiceId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'WHMCS order created but no invoice was returned',
        data: order
      })
    }

    return {
      success: true,
      invoice: {
        id: invoiceId
      },
      orderid: asNumber((order as any).orderid)
    }
  }

  if (method === 'POST' && path === 'domains/search') {
    const body = await readBody<{ sld?: string; tlds?: string[] }>(event)
    const sld = asString(body?.sld).trim().toLowerCase().replace(/\s+/g, '')

    if (!sld) {
      throw createError({ statusCode: 422, statusMessage: 'sld is required' })
    }

    const tlds =
      (body?.tlds || FALLBACK_TLDS.map((entry) => entry.tld))
        .map((tld) => (tld.startsWith('.') ? tld : `.${tld}`))

    const results = await Promise.all(
      tlds.map(async (tld) => {
        const fullDomain = `${sld}${tld}`

        try {
          const lookup = await callWhmcsApi('DomainWhois', { domain: fullDomain })
          const status = asString((lookup as any).status).toLowerCase()
          const available = status.includes('available')
          const known = FALLBACK_TLDS.find((entry) => entry.tld === tld)

          return {
            domain: fullDomain,
            tld,
            available,
            price: known?.price ?? 12.99
          }
        } catch {
          const known = FALLBACK_TLDS.find((entry) => entry.tld === tld)

          return {
            domain: fullDomain,
            tld,
            available: false,
            price: known?.price ?? 12.99
          }
        }
      })
    )

    return { results }
  }

  if (method === 'GET' && path === 'domains') {
    const clientId = extractClientId(event)
    const domains = await getClientDomains(clientId)

    return {
      domains,
      data: domains
    }
  }

  if (method === 'GET' && path === 'domains/pricing') {
    return { extensions: FALLBACK_TLDS }
  }

  if (method === 'GET' && (path === 'vps/plans' || path === 'products/vps')) {
    const query = getQuery(event)
    const groupId = asString(query.groupId || '')

    try {
      const payload: WhmcsRequestPayload = {}
      if (groupId) payload.gid = groupId

      const catalog = await callWhmcsApi('GetProducts', payload)
      const products = toArray<Record<string, any>>((catalog as any).products)

      const plans = products.map((product) => {
        const pricing = product.pricing || {}
        const currencies = asArray<Record<string, any>>(pricing)
        const firstPrice = currencies[0] || {}

        return {
          id: asNumber(product.pid || product.id),
          name: asString(product.name || product.productname || 'VPS Plan'),
          cpu: asString(product.configoption1 || '1 vCPU'),
          ram: asString(product.configoption2 || '2 GB RAM'),
          storage: asString(product.configoption3 || '40 GB NVMe'),
          price: asNumber(firstPrice.monthly || firstPrice.annually || 0),
          billingcycle: 'monthly',
          popular: false,
          whmcs_product_id: asNumber(product.pid || product.id)
        }
      })

      return { plans: plans.length ? plans : FALLBACK_VPS_PLANS }
    } catch {
      return { plans: FALLBACK_VPS_PLANS }
    }
  }

  if (method === 'GET' && path === 'dashboard/summary') {
    const clientId = extractClientId(event)

    const [services, domains, invoices] = await Promise.all([
      getClientServices(clientId),
      getClientDomains(clientId),
      getClientInvoices(clientId)
    ])

    const running = services.filter((service) => service.status === 'running').length
    const provisioning = services.filter((service) => service.status === 'provisioning').length
    const activeDomains = domains.filter((domain) => domain.status === 'active').length
    const expiredDomains = domains.filter((domain) => domain.status.includes('expired')).length
    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid').length
    const unpaidInvoices = invoices.filter((invoice) => invoice.status !== 'paid').length

    return {
      servers: {
        total: services.length,
        running,
        provisioning
      },
      domains: {
        total: domains.length,
        active: activeDomains,
        expired: expiredDomains
      },
      invoices: {
        total: invoices.length,
        paid: paidInvoices,
        unpaid: unpaidInvoices
      }
    }
  }

  if (method === 'GET' && path === 'servers') {
    const clientId = extractClientId(event)
    return await getClientServices(clientId)
  }

  if (method === 'GET' && slug[0] === 'servers' && slug.length === 2) {
    const clientId = extractClientId(event)
    const serviceId = asNumber(slug[1])

    if (!serviceId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid service id' })
    }

    const services = await getClientServices(clientId)
    const service = services.find((entry) => entry.id === serviceId)

    if (!service) {
      throw createError({ statusCode: 404, statusMessage: 'Service not found' })
    }

    return service
  }

  // ── SERVERS: rename (hostname update) ─────────────────────────────────────
  if (method === 'PATCH' && slug[0] === 'servers' && slug.length === 2) {
    const clientId = extractClientId(event)
    const serviceId = asNumber(slug[1])
    if (!serviceId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid service id' })
    }
    const body = await readBody<{ name?: string }>(event)
    const hostname = asString(body?.name).trim()
    if (!hostname) {
      throw createError({ statusCode: 422, statusMessage: 'name is required' })
    }
    await callWhmcsApi('UpdateClientProduct', {
      serviceid: serviceId,
      domain: hostname,
    })
    const services = await getClientServices(clientId)
    const service = services.find((s) => s.id === serviceId)
    if (!service) {
      throw createError({ statusCode: 404, statusMessage: 'Service not found after update' })
    }
    return service
  }

  if (method === 'POST' && slug[0] === 'servers' && slug.length === 3) {
    extractClientId(event)

    const serviceId = asNumber(slug[1])
    const action = asString(slug[2]).toLowerCase()

    if (!serviceId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid service id' })
    }

    const whmcsActionMap: Record<string, string> = {
      start: 'ModuleUnsuspend',
      stop: 'ModuleSuspend',
      reboot: 'ModuleCustom',
      destroy: 'ModuleTerminate',
      activate: 'ModuleUnsuspend',
      suspend: 'ModuleSuspend',
      terminate: 'ModuleTerminate'
    }

    const command = whmcsActionMap[action]

    if (!command) {
      throw createError({ statusCode: 400, statusMessage: `Unsupported action "${action}"` })
    }

    const payload: WhmcsRequestPayload = {
      serviceid: serviceId,
      accountid: serviceId
    }

    if (command === 'ModuleCustom') {
      payload.func_name = 'reboot'
    }

    await callWhmcsApi(command, payload)

    return {
      success: true,
      serviceid: serviceId,
      action
    }
  }

  if (method === 'GET' && path === 'invoices') {
    const clientId = extractClientId(event)
    const invoices = await getClientInvoices(clientId)

    return {
      invoices,
      data: invoices
    }
  }

  if (method === 'GET' && slug[0] === 'invoices' && slug.length === 2) {
    extractClientId(event)

    const invoiceId = asNumber(slug[1])

    if (!invoiceId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid invoice id' })
    }

    const invoiceDetails = await callWhmcsApi('GetInvoice', {
      invoiceid: invoiceId
    })

    const items = toArray<Record<string, any>>((invoiceDetails as any).items).map((item, index) => ({
      id: asNumber(item.id, index + 1),
      type: asString(item.type || 'lineitem'),
      description: asString(item.description || ''),
      amount: asNumber(item.amount)
    }))

    const inv = invoiceDetails as any
    const invoice = {
      id: invoiceId,
      number: asString(inv.invoicenum || inv.number || String(invoiceId)),
      status: asString(inv.status).toLowerCase(),
      amount: asNumber(inv.total),
      subtotal: asNumber(inv.subtotal || inv.total),
      tax: asNumber(inv.tax || 0),
      created_at: asString(inv.date || inv.datecreated),
      due_date: asString(inv.duedate || ''),
      paid_at: asString(inv.datepaid || ''),
      currency: asString(inv.currency || inv.currencycode || 'USD'),
      notes: asString(inv.notes || ''),
      items
    }

    return {
      invoice,
      cart: {
        items: items.map((line) => ({
          id: line.id,
          name: line.description,
          quantity: 1,
          period: 1,
          price: line.amount
        }))
      }
    }
  }

  if (method === 'POST' && slug[0] === 'invoices' && slug[2] === 'pay') {
    const clientId = extractClientId(event)
    const invoiceId = asNumber(slug[1])

    if (!invoiceId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid invoice id' })
    }

    const sso = await callWhmcsApi('CreateSsoToken', {
      client_id: clientId,
      destination: 'sso:custom_redirect',
      sso_redirect_path: `/viewinvoice.php?id=${invoiceId}`
    })

    return {
      success: true,
      invoiceid: invoiceId,
      payment_url: asString((sso as any).redirect_url)
    }
  }

  // ── AUTH: forgot-password ──────────────────────────────────────────────────
  if (method === 'POST' && path === 'auth/forgot-password') {
    const body = await readBody<{ email?: string }>(event)
    const email = asString(body?.email).trim().toLowerCase()
    if (!email) {
      throw createError({ statusCode: 422, statusMessage: 'Email is required' })
    }
    // WHMCS ResetPassword triggers a password reset email to the client
    await callWhmcsApi('ResetPassword', { email })
    return { success: true }
  }

  // ── AUTH: profile update ───────────────────────────────────────────────────
  if (method === 'PATCH' && path === 'auth/profile') {
    const clientId = extractClientId(event)
    const body = await readBody<{ name?: string }>(event)
    const name = asString(body?.name).trim()
    if (!name) {
      throw createError({ statusCode: 422, statusMessage: 'Name is required' })
    }
    const parts = name.split(' ')
    const firstname = parts[0]
    const lastname = parts.slice(1).join(' ') || '.'
    await callWhmcsApi('UpdateClientDetails', {
      clientid: clientId,
      firstname,
      lastname,
      skipvalidation: true
    })
    const profile = await getClientProfile(clientId)
    return {
      data: { id: profile.id, name: profile.full_name, email: profile.email, role: 'client', created_at: '' },
      success: true
    }
  }

  // ── AUTH: change-password ──────────────────────────────────────────────────
  if (method === 'POST' && path === 'auth/change-password') {
    const clientId = extractClientId(event)
    const body = await readBody<{ new_password?: string }>(event)
    const newPassword = asString(body?.new_password)
    if (!newPassword || newPassword.length < 8) {
      throw createError({ statusCode: 422, statusMessage: 'New password must be at least 8 characters' })
    }
    await callWhmcsApi('UpdateClientPassword', {
      clientid: clientId,
      newpassword: newPassword
    })
    return { success: true }
  }

  // ── DOMAINS: get single ────────────────────────────────────────────────────
  if (method === 'GET' && slug[0] === 'domains' && slug.length === 2) {
    const clientId = extractClientId(event)
    const domainId = asNumber(slug[1])
    if (!domainId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid domain id' })
    }
    const domain = await getSingleDomain(clientId, domainId)
    if (!domain) {
      throw createError({ statusCode: 404, statusMessage: 'Domain not found' })
    }
    return { domain }
  }

  // ── DOMAINS: update (autorenew, lock, idprotection, nameservers) ───────────
  if (method === 'PATCH' && slug[0] === 'domains' && slug.length === 2) {
    const clientId = extractClientId(event)
    const domainId = asNumber(slug[1])
    if (!domainId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid domain id' })
    }
    const body = await readBody<{
      auto_renew?: boolean
      locked?: boolean
      id_protection?: boolean
      nameservers?: string[]
    }>(event)

    const payload: Record<string, any> = { domainid: domainId }
    if (body?.auto_renew !== undefined) payload.autorenew = body.auto_renew ? 1 : 0
    if (body?.locked !== undefined) payload.lockstatus = body.locked ? 1 : 0
    if (body?.id_protection !== undefined) payload.idprotection = body.id_protection ? 1 : 0
    if (Array.isArray(body?.nameservers)) {
      body.nameservers.forEach((ns, i) => { payload[`nameserver${i + 1}`] = ns })
    }

    await callWhmcsApi('UpdateClientDomain', payload)
    const domain = await getSingleDomain(clientId, domainId)
    if (!domain) {
      throw createError({ statusCode: 404, statusMessage: 'Domain not found after update' })
    }
    return { domain, success: true }
  }

  // ── DOMAINS: renew ─────────────────────────────────────────────────────────
  if (method === 'POST' && slug[0] === 'domains' && slug.length === 3 && slug[2] === 'renew') {
    const clientId = extractClientId(event)
    const domainId = asNumber(slug[1])
    if (!domainId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid domain id' })
    }
    await callWhmcsApi('RenewDomain', { domainid: domainId, regperiod: 1 })
    const domain = await getSingleDomain(clientId, domainId)
    if (!domain) {
      throw createError({ statusCode: 404, statusMessage: 'Domain not found after renewal' })
    }
    return { domain, success: true }
  }

  // ── TICKETS: list ──────────────────────────────────────────────────────────
  if (method === 'GET' && path === 'tickets') {
    const clientId = extractClientId(event)
    const result = await callWhmcsApi('GetTickets', { clientid: clientId, limitnum: 100 })
    const raw = toArray<Record<string, any>>((result as any).tickets)

    const tickets = raw.map((t) => ({
      id: asNumber(t.id || t.tid),
      tid: asString(t.tid || t.id),
      subject: asString(t.title || t.subject || ''),
      status: asString(t.status || 'Open'),
      priority: asString(t.priority || 'Medium'),
      department: asString(t.deptname || t.dept || 'Support'),
      date: asString(t.date || t.lastreply || new Date().toISOString()),
      last_reply: asString(t.lastreply || t.date || new Date().toISOString()),
      messages: [],
      related_service_id: null,
      related_service_type: null,
    }))

    return { tickets }
  }

  // ── TICKETS: get single ────────────────────────────────────────────────────
  if (method === 'GET' && slug[0] === 'tickets' && slug.length === 2) {
    extractClientId(event)
    const ticketId = asNumber(slug[1])
    if (!ticketId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id' })
    }
    const result = await callWhmcsApi('GetTicket', { ticketid: ticketId })
    const t = result as any
    const replies = toArray<Record<string, any>>(t.replies)

    const messages = [
      {
        id: `msg-${ticketId}-0`,
        author_name: asString(t.name || 'Client'),
        author_role: 'client' as const,
        body: asString(t.message || ''),
        created_at: asString(t.date || new Date().toISOString()),
      },
      ...replies.map((r, i) => ({
        id: `msg-${ticketId}-${i + 1}`,
        author_name: asString(r.adminname || r.name || 'Support'),
        author_role: (r.adminid ? 'support' : 'client') as 'client' | 'support',
        body: asString(r.message || ''),
        created_at: asString(r.date || new Date().toISOString()),
      })),
    ]

    return {
      ticket: {
        id: asNumber(t.id || t.ticketid),
        tid: asString(t.tid || ''),
        subject: asString(t.title || t.subject || ''),
        status: asString(t.status || 'Open'),
        priority: asString(t.priority || 'Medium'),
        department: asString(t.deptname || t.dept || 'Support'),
        date: asString(t.date || new Date().toISOString()),
        last_reply: asString(t.lastreply || t.date || new Date().toISOString()),
        messages,
        related_service_id: null,
        related_service_type: null,
      }
    }
  }

  // ── TICKETS: create ────────────────────────────────────────────────────────
  if (method === 'POST' && path === 'tickets') {
    const clientId = extractClientId(event)
    const body = await readBody<{
      subject?: string
      department?: string
      priority?: string
      message?: string
      related_service_id?: string | null
      related_service_type?: string | null
    }>(event)

    if (!body?.subject || !body?.message) {
      throw createError({ statusCode: 422, statusMessage: 'subject and message are required' })
    }

    const runtime = useRuntimeConfig()
    const deptMap: Record<string, number> = {
      technical: asNumber(runtime.whmcsDeptTechnical, 1),
      billing: asNumber(runtime.whmcsDeptBilling, 2),
      sales: asNumber(runtime.whmcsDeptSales, 3),
      general: asNumber(runtime.whmcsDeptGeneral, 4),
    }
    const deptId = deptMap[asString(body.department || 'general').toLowerCase()] ?? 4

    const priorityMap: Record<string, string> = {
      low: 'Low', normal: 'Medium', high: 'High', urgent: 'Urgent'
    }
    const whmcsPriority = priorityMap[asString(body.priority || 'normal').toLowerCase()] ?? 'Medium'

    const result = await callWhmcsApi('OpenTicket', {
      clientid: clientId,
      deptid: deptId,
      subject: asString(body.subject),
      message: asString(body.message),
      priority: whmcsPriority,
      noemail: false,
    })

    const ticketId = asNumber((result as any).id || (result as any).tid)
    const dept = body.department || 'general'
    const now = new Date().toISOString()

    return {
      ticket: {
        id: ticketId,
        tid: String(ticketId),
        subject: asString(body.subject),
        status: 'Open',
        priority: whmcsPriority,
        department: dept,
        date: now,
        last_reply: now,
        messages: [{
          id: `msg-${ticketId}-0`,
          author_name: 'You',
          author_role: 'client',
          body: asString(body.message),
          created_at: now,
        }],
        related_service_id: body.related_service_id ?? null,
        related_service_type: body.related_service_type ?? null,
      }
    }
  }

  // ── TICKETS: reply ─────────────────────────────────────────────────────────
  if (method === 'POST' && slug[0] === 'tickets' && slug.length === 3 && slug[2] === 'reply') {
    const clientId = extractClientId(event)
    const ticketId = asNumber(slug[1])
    if (!ticketId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id' })
    }
    const body = await readBody<{ message?: string }>(event)
    if (!body?.message) {
      throw createError({ statusCode: 422, statusMessage: 'message is required' })
    }
    await callWhmcsApi('AddTicketReply', {
      ticketid: ticketId,
      clientid: clientId,
      message: asString(body.message),
      noemail: false,
    })
    // Return fresh ticket with updated messages
    const result = await callWhmcsApi('GetTicket', { ticketid: ticketId })
    const t = result as any
    const replies = toArray<Record<string, any>>(t.replies)
    const messages = [
      {
        id: `msg-${ticketId}-0`,
        author_name: asString(t.name || 'Client'),
        author_role: 'client' as const,
        body: asString(t.message || ''),
        created_at: asString(t.date || new Date().toISOString()),
      },
      ...replies.map((r, i) => ({
        id: `msg-${ticketId}-${i + 1}`,
        author_name: asString(r.adminname || r.name || 'Support'),
        author_role: (r.adminid ? 'support' : 'client') as 'client' | 'support',
        body: asString(r.message || ''),
        created_at: asString(r.date || new Date().toISOString()),
      })),
    ]
    return {
      ticket: {
        id: ticketId,
        tid: asString(t.tid || ''),
        subject: asString(t.title || t.subject || ''),
        status: asString(t.status || 'Open'),
        priority: asString(t.priority || 'Medium'),
        department: asString(t.deptname || 'Support'),
        date: asString(t.date || new Date().toISOString()),
        last_reply: new Date().toISOString(),
        messages,
        related_service_id: null,
        related_service_type: null,
      }
    }
  }

  // ── TICKETS: close ─────────────────────────────────────────────────────────
  if (method === 'POST' && slug[0] === 'tickets' && slug.length === 3 && slug[2] === 'close') {
    extractClientId(event)
    const ticketId = asNumber(slug[1])
    if (!ticketId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id' })
    }
    await callWhmcsApi('CloseTicket', { ticketid: ticketId })
    const result = await callWhmcsApi('GetTicket', { ticketid: ticketId })
    const t = result as any
    return {
      ticket: {
        id: ticketId,
        tid: asString(t.tid || ''),
        subject: asString(t.title || t.subject || ''),
        status: 'Closed',
        priority: asString(t.priority || 'Medium'),
        department: asString(t.deptname || 'Support'),
        date: asString(t.date || new Date().toISOString()),
        last_reply: new Date().toISOString(),
        messages: [],
        related_service_id: null,
        related_service_type: null,
      }
    }
  }

  throw createError({ statusCode: 404, statusMessage: `Unknown WHMCS bridge endpoint: ${path}` })
})
