import type { CreateTicketPayload, ReplyTicketPayload } from '../types/ticket'

export function useTicketActions() {
  const store = useTicketStore()
  const notify = useNotification()
  const modal = useModal()
  const events = useAppEvents()
  const { canCreate, canEdit } = usePermissions()

  async function triggerCreateTicket(payload: CreateTicketPayload): Promise<string | null> {
    if (!canCreate('ticket')) {
      notify.error('Permission denied', 'You do not have permission to open tickets.')
      return null
    }
    try {
      const ticket = await store.createTicket(payload)
      events.emit('ticket:created', { id: ticket.id, subject: ticket.subject, priority: ticket.priority })
      notify.success('Ticket submitted', `Ticket #${ticket.id} is open. Our team will respond shortly.`)
      return ticket.id
    } catch {
      notify.error('Submission failed', 'Could not submit your ticket. Please try again.')
      return null
    }
  }

  async function triggerReply(payload: ReplyTicketPayload, subject: string): Promise<boolean> {
    if (!canCreate('ticket')) {
      notify.error('Permission denied', 'You do not have permission to reply to tickets.')
      return false
    }
    try {
      await store.addReply(payload)
      events.emit('ticket:replied', { id: payload.ticketId, subject })
      notify.success('Reply sent', 'Your message has been added to the ticket.')
      return true
    } catch {
      notify.error('Reply failed', 'Could not send your reply. Please try again.')
      return false
    }
  }

  async function triggerClose(id: string, subject: string): Promise<boolean> {
    if (!canEdit('ticket')) {
      notify.error('Permission denied', 'You do not have permission to close tickets.')
      return false
    }
    const confirmed = await modal.confirm(
      'Close ticket?',
      `This will close "${subject}". You can still reply to reopen it at any time.`,
      { confirmLabel: 'Close ticket' },
    )
    if (!confirmed) return false
    try {
      await store.closeTicket(id)
      events.emit('ticket:closed', { id, subject })
      notify.success('Ticket closed', 'Your ticket has been marked as resolved.')
      return true
    } catch {
      notify.error('Error', 'Could not close the ticket. Please try again.')
      return false
    }
  }

  return {
    triggerCreateTicket,
    triggerReply,
    triggerClose,
    isSubmitting: computed(() => store.submitting),
  }
}
