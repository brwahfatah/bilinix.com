// Configured $fetch instance used by all feature services.
// Auth token is read from localStorage (client-only); error callbacks and
// the API base URL are set by plugins/api.client.ts after Pinia is ready.

const TOKEN_KEY = 'auth_token'

type ErrorHandler = (status: number) => void

let _onError: ErrorHandler | null = null
let _baseUrl: string = ''

export function setApiErrorHandler(cb: ErrorHandler): void {
  _onError = cb
}

export function setApiBaseUrl(url: string): void {
  _baseUrl = url
}

const _apiFetch = $fetch.create({
  onRequest({ options }: { options: Record<string, any> }) {
    if (!import.meta.client) return

    // ofetch passes options.headers as a Headers instance; use the Headers API.
    const headers = new Headers(options.headers as Record<string, string> | undefined)
    headers.set('Accept', 'application/json')

    const token = localStorage.getItem(TOKEN_KEY)
    if (token) headers.set('Authorization', `Bearer ${token}`)

    options.headers = headers
  },
  onResponseError({ response }: { response: { status: number } }) {
    _onError?.(response.status)
  },
})

export function api<T = any>(url: string, opts?: Record<string, any>): Promise<T> {
  const options: Record<string, any> = opts ? { ...opts } : {}
  // Inject the base URL at call time so ofetch resolves it before the request fires.
  // Setting it inside onRequest is too late in some ofetch versions.
  if (import.meta.client && _baseUrl && !options.baseURL) {
    options.baseURL = _baseUrl
  }
  return _apiFetch(url, options as any) as Promise<T>
}
