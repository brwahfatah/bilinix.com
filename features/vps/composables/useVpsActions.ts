import { VpsEntity } from '~/domain/vps/VpsEntity'
import type { VpsPowerAction } from '../types/vps'
import type { ActionResult } from '~/types/api'

const POWER_CONFIRM: Partial<Record<VpsPowerAction, { title: string; body: string; label: string }>> = {
  stop: {
    title: 'Shut down server?',
    body: 'The server will stop immediately. Running processes will be terminated.',
    label: 'Shut down',
  },
  destroy: {
    title: 'Destroy server?',
    body: 'All data will be permanently deleted. This cannot be undone.',
    label: 'Destroy',
  },
}

export function useVpsActions() {
  const store = useVpsStore()
  const notify = useNotification()
  const modal = useModal()
  const events = useAppEvents()
  const { canDelete, canEdit } = usePermissions()

  function getEntity(id: string): VpsEntity | null {
    const raw = store.items.find((v) => v.id === id) ?? (store.current?.id === id ? store.current : null)
    return raw ? VpsEntity.from(raw) : null
  }

  // ---------------------------------------------------------------------------
  // Power action — start / stop / reboot / destroy
  // ---------------------------------------------------------------------------
  async function triggerPowerAction(id: string, action: VpsPowerAction): Promise<ActionResult> {
    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Server not found.' }

    // Permission guard
    const needsDelete = action === 'destroy'
    if (needsDelete && !canDelete('vps')) {
      notify.warning('Permission denied', 'You do not have permission to destroy servers.')
      return { ok: false, error: 'Permission denied.' }
    }
    if (!needsDelete && !canEdit('vps')) {
      notify.warning('Permission denied', 'You do not have permission to perform this action.')
      return { ok: false, error: 'Permission denied.' }
    }

    // Domain guard — entity owns the business rule
    const allowed: Record<VpsPowerAction, boolean> = {
      start: entity.canStart,
      stop: entity.canStop,
      reboot: entity.canReboot,
      destroy: entity.canDestroy,
    }
    if (!allowed[action]) {
      const msg = `Cannot ${action} a server with status "${entity.status}".`
      notify.warning('Action not allowed', msg)
      return { ok: false, error: msg }
    }

    // Confirmation for destructive/disruptive actions
    const confirmDef = POWER_CONFIRM[action]
    if (confirmDef) {
      const ok = await modal.danger(confirmDef.title, confirmDef.body, confirmDef.label)
      if (!ok) return { ok: false }
    }

    try {
      if (action === 'destroy') {
        await store.powerAction(id, action)
        await store.destroy(id)
        events.emit('vps:destroyed', { id, name: entity.name })
        notify.success(`${entity.name} has been destroyed`)
        await navigateTo('/dashboard/services/vps')
        return { ok: true }
      }

      await store.powerAction(id, action)
      events.emit('vps:power-action', { id, name: entity.name, action })

      const messages: Record<VpsPowerAction, string> = {
        start: `${entity.name} is starting`,
        stop: `${entity.name} is shutting down`,
        reboot: `${entity.name} is rebooting`,
        destroy: '',
      }
      notify.success(messages[action])
      return { ok: true }
    } catch {
      const msg = store.error?.message ?? 'Action failed. Please try again.'
      notify.error('Action failed', msg)
      return { ok: false, error: msg }
    }
  }

  // ---------------------------------------------------------------------------
  // Rename
  // ---------------------------------------------------------------------------
  async function rename(id: string, newName: string): Promise<ActionResult> {
    if (!canEdit('vps')) {
      notify.warning('Permission denied', 'You do not have permission to rename servers.')
      return { ok: false, error: 'Permission denied.' }
    }

    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Server not found.' }

    const trimmed = newName.trim()
    if (!trimmed || trimmed.length < 2) return { ok: false, error: 'Name must be at least 2 characters.' }
    if (trimmed === entity.name) return { ok: false, error: 'Name unchanged.' }

    try {
      await store.rename(id, trimmed)
      events.emit('vps:renamed', { id, oldName: entity.name, newName: trimmed })
      notify.success('Server renamed', `New name: ${trimmed}`)
      return { ok: true }
    } catch {
      const msg = store.error?.message ?? 'Rename failed.'
      notify.error('Rename failed', msg)
      return { ok: false, error: msg }
    }
  }

  // ---------------------------------------------------------------------------
  // Reactive helpers for components
  // ---------------------------------------------------------------------------
  function isActioning(id: string) {
    return computed(() => store.isActioning(id))
  }

  function getEntityForId(id: string) {
    return computed(() => {
      const raw = store.items.find((v) => v.id === id) ?? (store.current?.id === id ? store.current : null)
      return raw ? VpsEntity.from(raw) : null
    })
  }

  return { triggerPowerAction, rename, isActioning, getEntityForId }
}
