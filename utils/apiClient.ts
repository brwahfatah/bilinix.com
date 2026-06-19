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

    // Point all relative paths to the Laravel API base URL
    if (_baseUrl && !options.baseURL) {
      options.baseURL = _baseUrl
    }

    // Always request JSON so Laravel returns structured error bodies
    const h = ((options.headers as Record<string, string>) ?? {})
    h['Accept'] = 'application/json'

    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      h['Authorization'] = `Bearer ${token}`
    }

    options.headers = h
  },
  onResponseError({ response }: { response: { status: number } }) {
    _onError?.(response.status)
  },
})

export function api<T = any>(url: string, opts?: Record<string, any>): Promise<T> {
  return _apiFetch(url, opts as any) as Promise<T>
}
