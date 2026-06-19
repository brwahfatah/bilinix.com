import { defineStore } from 'pinia'
import { api } from '~/utils/apiClient'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'client' | 'admin'
  avatar?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
}

const TOKEN_KEY = 'auth_token'

// Laravel UserDTO shape: { id, name, email, role, created_at }
interface LaravelUser {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

// Laravel auth response wraps token + user inside "data"
interface LaravelAuthResponse {
  data: {
    token: string
    user: LaravelUser
  }
  message: string
  errors: null
}

// /auth/me returns the user DTO directly inside "data"
interface LaravelMeResponse {
  data: LaravelUser
  message: string
  errors: null
}

function normalizeUser(raw: LaravelUser): AuthUser {
  return {
    id: String(raw.id),
    email: raw.email,
    name: raw.name || raw.email,
    role: raw.role === 'admin' ? 'admin' : 'client',
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    isAdmin: (state): boolean => state.user?.role === 'admin',
    isClient: (state): boolean => state.user?.role === 'client',

    initials: (state): string => {
      if (!state.user) return 'U'
      return state.user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    displayName: (state): string =>
      state.user?.name ?? state.user?.email ?? 'Account',

    displayEmail: (state): string => state.user?.email ?? '',
  },

  actions: {
    // Restore session on app boot — client-only.
    // Reads token from localStorage, verifies it via GET /auth/me.
    async hydrate(): Promise<void> {
      if (!import.meta.client) return
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return
      this.token = token
      try {
        const res = await api<LaravelMeResponse>('/auth/me')
        this.user = normalizeUser(res.data)
      } catch {
        this.token = null
        this.user = null
        localStorage.removeItem(TOKEN_KEY)
      }
    },

    async login(email: string, password: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const res = await api<LaravelAuthResponse>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.token = res.data.token
        this.user = normalizeUser(res.data.user)
        localStorage.setItem(TOKEN_KEY, res.data.token)
      } catch (e: any) {
        this.error = e?.data?.message ?? e?.message ?? 'Login failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async register(name: string, email: string, password: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        // Laravel expects a single "name" field, not first_name/last_name
        const res = await api<LaravelAuthResponse>('/auth/register', {
          method: 'POST',
          body: {
            name,
            email,
            password,
            password_confirmation: password,
          },
        })
        this.token = res.data.token
        this.user = normalizeUser(res.data.user)
        localStorage.setItem(TOKEN_KEY, res.data.token)
      } catch (e: any) {
        this.error = e?.data?.message ?? e?.message ?? 'Registration failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateProfile(name: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        if (!name.trim()) throw new Error('Name cannot be empty.')
        const res = await api<{ data: LaravelUser }>('/auth/profile', {
          method: 'PATCH',
          body: { name: name.trim() },
        })
        if (this.user) this.user = normalizeUser(res.data)
      } catch (e: any) {
        this.error = e?.data?.message ?? e?.message ?? 'Profile update failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        if (!currentPassword || !newPassword) throw new Error('Both fields are required.')
        if (newPassword.length < 8) throw new Error('New password must be at least 8 characters.')
        // Laravel requires new_password_confirmation
        await api('/auth/change-password', {
          method: 'POST',
          body: {
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPassword,
          },
        })
      } catch (e: any) {
        this.error = e?.data?.message ?? e?.message ?? 'Password change failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async forgotPassword(email: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await api('/auth/forgot-password', {
          method: 'POST',
          body: { email },
        })
      } catch (e: any) {
        this.error = e?.data?.message ?? e?.message ?? 'Request failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async logout(opts: { everywhere?: boolean } = {}): Promise<void> {
      try {
        const endpoint = opts.everywhere ? '/auth/logout-all' : '/auth/logout'
        await api(endpoint, { method: 'POST' })
      } catch {
        // Proceed with local logout even if server call fails
      } finally {
        this.token = null
        this.user = null
        this.error = null
        if (import.meta.client) localStorage.removeItem(TOKEN_KEY)
        await navigateTo('/auth/login')
      }
    },
  },
})
