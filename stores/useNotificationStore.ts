import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration: number  // ms, 0 = persistent
}

interface NotificationState {
  items: Notification[]
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({ items: [] }),

  actions: {
    push(payload: Omit<Notification, 'id'>): string {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      this.items.push({ ...payload, id })

      if (payload.duration > 0) {
        setTimeout(() => this.dismiss(id), payload.duration)
      }
      return id
    },

    dismiss(id: string) {
      this.items = this.items.filter((n) => n.id !== id)
    },

    clear() {
      this.items = []
    },
  },
})

// ---------------------------------------------------------------------------
// Composable — the public API used by feature code
// ---------------------------------------------------------------------------
export function useNotification() {
  const store = useNotificationStore()

  return {
    success: (title: string, message?: string, duration = 4000) =>
      store.push({ type: 'success', title, message, duration }),

    error: (title: string, message?: string, duration = 6000) =>
      store.push({ type: 'error', title, message, duration }),

    warning: (title: string, message?: string, duration = 5000) =>
      store.push({ type: 'warning', title, message, duration }),

    info: (title: string, message?: string, duration = 4000) =>
      store.push({ type: 'info', title, message, duration }),

    dismiss: (id: string) => store.dismiss(id),
  }
}
