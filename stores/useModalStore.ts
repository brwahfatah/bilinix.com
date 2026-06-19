import { defineStore } from 'pinia'

export type ModalVariant = 'danger' | 'warning' | 'info'

export interface ModalConfig {
  id: string
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ModalVariant
  resolve: (confirmed: boolean) => void
}

interface ModalState {
  queue: ModalConfig[]
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({ queue: [] }),

  getters: {
    current: (state): ModalConfig | null => state.queue[0] ?? null,
    isOpen: (state): boolean => state.queue.length > 0,
  },

  actions: {
    confirm(config: Omit<ModalConfig, 'id' | 'resolve'>): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        this.queue.push({
          ...config,
          id: `modal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          resolve,
        })
      })
    },

    _resolve(confirmed: boolean) {
      const modal = this.queue[0]
      if (!modal) return
      this.queue.splice(0, 1)
      modal.resolve(confirmed)
    },
  },
})

// Developer-facing composable — use this in use cases and composables
export function useModal() {
  const store = useModalStore()
  return {
    confirm: (
      title: string,
      body: string,
      opts?: { confirmLabel?: string; cancelLabel?: string; variant?: ModalVariant },
    ) =>
      store.confirm({
        title,
        body,
        confirmLabel: opts?.confirmLabel ?? 'Confirm',
        cancelLabel: opts?.cancelLabel ?? 'Cancel',
        variant: opts?.variant ?? 'info',
      }),

    danger: (title: string, body: string, confirmLabel = 'Delete') =>
      store.confirm({ title, body, confirmLabel, cancelLabel: 'Cancel', variant: 'danger' }),

    warning: (title: string, body: string, confirmLabel = 'Continue') =>
      store.confirm({ title, body, confirmLabel, cancelLabel: 'Cancel', variant: 'warning' }),
  }
}
