import { InvoiceEntity } from '~/domain/billing/InvoiceEntity'
import type { ActionResult } from '~/types/api'

export function useBillingActions() {
  const store = useBillingStore()
  const notify = useNotification()
  const modal = useModal()
  const events = useAppEvents()
  const { canEdit } = usePermissions()

  function getEntity(id: string): InvoiceEntity | null {
    const raw = store.items.find((inv) => inv.id === id) ?? (store.current?.id === id ? store.current : null)
    return raw ? InvoiceEntity.from(raw) : null
  }

  // ---------------------------------------------------------------------------
  // Pay invoice
  // ---------------------------------------------------------------------------
  async function triggerPayInvoice(id: string): Promise<ActionResult<{ paidInline: boolean }>> {
    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Invoice not found.' }

    if (!entity.canPay) {
      const msg = entity.isPaid ? 'This invoice has already been paid.' : `Cannot pay a ${entity.status} invoice.`
      notify.warning('Payment not available', msg)
      return { ok: false, error: msg }
    }

    const confirmed = await modal.confirm(
      `Pay ${entity.displayAmount}?`,
      `Invoice ${entity.number} will be processed immediately using your default payment method.`,
      { confirmLabel: 'Pay now', variant: 'info' },
    )
    if (!confirmed) return { ok: false }

    try {
      const result = await store.payInvoice(id)
      if (result.paymentUrl) {
        // Store redirects browser to WHMCS SSO payment page — no further UI needed
        return { ok: true, data: result }
      }
      events.emit('invoice:paid', {
        id: entity.id,
        number: entity.number,
        amount: entity.amount,
      })
      notify.success('Payment successful', `Invoice ${entity.number} has been paid.`)
      return { ok: true, data: result }
    } catch {
      const msg = store.error?.message ?? 'Payment failed. Please try again.'
      notify.error('Payment failed', msg)
      return { ok: false, error: msg }
    }
  }

  // ---------------------------------------------------------------------------
  // Pay with crypto (NOWPayments)
  // ---------------------------------------------------------------------------
  async function triggerCryptoPay(id: string): Promise<ActionResult<{ paymentUrl?: string }>> {
    const entity = getEntity(id)
    if (!entity) return { ok: false, error: 'Invoice not found.' }

    if (!entity.canPay) {
      const msg = entity.isPaid ? 'This invoice has already been paid.' : `Cannot pay a ${entity.status} invoice.`
      notify.warning('Payment not available', msg)
      return { ok: false, error: msg }
    }

    const confirmed = await modal.confirm(
      `Pay ${entity.displayAmount} with Crypto?`,
      `You will be redirected to NOWPayments to complete payment via USDT (TRC20 or BEP20).`,
      { confirmLabel: 'Continue to payment', variant: 'info' },
    )
    if (!confirmed) return { ok: false }

    try {
      const result = await store.payWithCrypto(id)
      return { ok: true, data: result }
    } catch {
      const msg = store.error?.message ?? 'Failed to create crypto payment. Please try again.'
      notify.error('Payment failed', msg)
      return { ok: false, error: msg }
    }
  }

  // ---------------------------------------------------------------------------
  // Reactive helpers
  // ---------------------------------------------------------------------------
  function isPaying(id: string) {
    return computed(() => store.isPaying(id))
  }

  function isCryptoPaying(id: string) {
    return computed(() => store.isCryptoPaying(id))
  }

  function getEntityForId(id: string) {
    return computed(() => {
      const raw = store.items.find((inv) => inv.id === id) ?? (store.current?.id === id ? store.current : null)
      return raw ? InvoiceEntity.from(raw) : null
    })
  }

  return { triggerPayInvoice, triggerCryptoPay, isPaying, isCryptoPaying, getEntityForId }
}
