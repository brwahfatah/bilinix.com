// Typed event payload map — every event name and its payload shape lives here.
// Add entries here as new features emit events.

export interface AppEventPayloads {
  // VPS events
  'vps:created':      { id: string; name: string }
  'vps:destroyed':    { id: string; name: string }
  'vps:renamed':      { id: string; oldName: string; newName: string }
  'vps:power-action': { id: string; name: string; action: string }

  // Billing events
  'invoice:paid':     { id: string; number: string; amount: number }

  // Support events
  'ticket:created':   { id: string; subject: string; priority: string }
  'ticket:replied':   { id: string; subject: string }
  'ticket:closed':    { id: string; subject: string }

  // Auth events
  'auth:login':       { userId: string }
  'auth:logout':      undefined
}

export type AppEventName = keyof AppEventPayloads
