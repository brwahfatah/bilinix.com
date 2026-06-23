// Generic API response shapes — mirrors what the Laravel backend will return.
// When real integration happens, only the service layer changes, not these types.

// Result envelope returned by all composable actions — never throw, always return this.
export interface ActionResult<T = void> {
  ok: boolean
  data?: T
  error?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Normalised error shape every service throws on failure
export interface ApiError {
  type: 'validation' | 'auth' | 'not_found' | 'server' | 'network'
  message: string
  fields?: Record<string, string[]>
  status?: number
}

export function buildApiError(raw: unknown): ApiError {
  if (raw instanceof Error) {
    // ofetch FetchError carries the parsed response body in `.data`
    const fetchErr = raw as {
      data?: { statusMessage?: string; message?: string }
      status?: number
      statusCode?: number
    }
    const status = fetchErr.status ?? fetchErr.statusCode
    const serverMsg = fetchErr.data?.statusMessage || fetchErr.data?.message

    if (status === 400 && serverMsg) {
      return { type: 'validation', message: serverMsg, status }
    }

    const msg = raw.message.toLowerCase()
    if (msg.includes('401') || msg.includes('unauthorized')) {
      return { type: 'auth', message: 'Session expired. Please log in again.' }
    }
    if (msg.includes('404') || msg.includes('not found')) {
      return { type: 'not_found', message: 'Resource not found.' }
    }
    return { type: 'server', message: raw.message, status }
  }
  return { type: 'network', message: 'Connection failed. Check your network.' }
}
