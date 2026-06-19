import { DomainEntity } from '~/domain/domain/DomainEntity'
import type { UpdateDomainPayload } from '../types/domain'
import type { ActionResult } from '~/types/api'

export function useDomainActions() {
  const store = useDomainStore()
  const notify = useNotification()
  const modal = useModal()
  const { canEdit } = usePermissions()

  function getEntity(id: string): DomainEntity | null {
    const raw = store.items.find((d) => d.id === id) ?? (store.current?.id === id ? store.current : null)
    return DomainEntity.from(raw ?? null)
  }

  async function triggerRenew(id: string): Promise<ActionResult> {
    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Domain not found.' }
    if (!entity.canRenew) return { ok: false, error: 'This domain cannot be renewed at this time.' }

    const ok = await modal.confirm(
      `Renew ${entity.fullName}?`,
      `Your account will be charged $${entity.annualPrice.toFixed(2)} for a 1-year renewal. An invoice will be generated.`,
      { confirmLabel: 'Renew domain' },
    )
    if (!ok) return { ok: false }

    try {
      await store.renew(id)
      notify.success('Domain renewed', `${entity.fullName} has been renewed for 1 year.`)
      return { ok: true }
    } catch {
      const msg = store.error?.message ?? 'Renewal failed. Please try again.'
      notify.error('Renewal failed', msg)
      return { ok: false, error: msg }
    }
  }

  async function triggerToggleAutoRenew(id: string): Promise<ActionResult> {
    if (!canEdit('domain')) {
      notify.warning('Permission denied', 'You do not have permission to change domain settings.')
      return { ok: false, error: 'Permission denied.' }
    }

    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Domain not found.' }

    const next = entity.isAutoRenewEnabled ? 'disabled' : 'enabled'
    const label = next === 'enabled' ? 'Auto-renew enabled' : 'Auto-renew disabled'

    try {
      await store.update(id, { autoRenew: next })
      notify.success(label, `${entity.fullName} auto-renew is now ${next}.`)
      return { ok: true }
    } catch {
      const msg = store.error?.message ?? 'Update failed.'
      notify.error('Update failed', msg)
      return { ok: false, error: msg }
    }
  }

  async function triggerToggleLock(id: string): Promise<ActionResult> {
    if (!canEdit('domain')) {
      notify.warning('Permission denied', 'You do not have permission to change domain settings.')
      return { ok: false, error: 'Permission denied.' }
    }

    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Domain not found.' }
    if (!entity.canToggleLock) return { ok: false, error: 'Cannot change lock on a non-active domain.' }

    const next = !entity.locked
    const label = next ? 'Domain locked' : 'Domain unlocked'

    try {
      await store.update(id, { locked: next })
      notify.success(label, next
        ? `${entity.fullName} is now protected against unauthorized transfers.`
        : `${entity.fullName} transfer lock has been removed.`)
      return { ok: true }
    } catch {
      const msg = store.error?.message ?? 'Update failed.'
      notify.error('Update failed', msg)
      return { ok: false, error: msg }
    }
  }

  async function triggerUpdateNameservers(id: string, nameservers: string[]): Promise<ActionResult> {
    if (!canEdit('domain')) {
      notify.warning('Permission denied', 'You do not have permission to change nameservers.')
      return { ok: false, error: 'Permission denied.' }
    }

    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Domain not found.' }
    if (!entity.canEditNameservers) return { ok: false, error: 'Cannot edit nameservers on a non-active domain.' }

    const filtered = nameservers.map((ns) => ns.trim()).filter(Boolean)
    if (filtered.length < 2) return { ok: false, error: 'At least 2 nameservers are required.' }

    try {
      await store.update(id, { nameservers: filtered })
      notify.success('Nameservers updated', 'DNS changes may take up to 48 hours to propagate.')
      return { ok: true }
    } catch {
      const msg = store.error?.message ?? 'Nameserver update failed.'
      notify.error('Update failed', msg)
      return { ok: false, error: msg }
    }
  }

  function isActioning(id: string) {
    return computed(() => store.isActioning(id))
  }

  return {
    triggerRenew,
    triggerToggleAutoRenew,
    triggerToggleLock,
    triggerUpdateNameservers,
    isActioning,
  }
}
