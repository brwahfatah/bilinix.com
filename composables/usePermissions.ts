// RBAC readiness layer — reads from auth store, exposes declarative guards.
// Components and composables use this instead of checking role strings directly.
// Swap the rule map below when a real backend permission system is introduced.

type Action = 'view' | 'create' | 'edit' | 'delete'
type Resource = 'vps' | 'invoice' | 'domain' | 'ticket' | 'user' | 'admin'

// Per-role permission matrix
const ROLE_PERMISSIONS: Record<string, Record<Resource, Action[]>> = {
  admin: {
    vps:     ['view', 'create', 'edit', 'delete'],
    invoice: ['view', 'create', 'edit', 'delete'],
    domain:  ['view', 'create', 'edit', 'delete'],
    ticket:  ['view', 'create', 'edit', 'delete'],
    user:    ['view', 'create', 'edit', 'delete'],
    admin:   ['view', 'create', 'edit', 'delete'],
  },
  client: {
    vps:     ['view', 'create', 'edit', 'delete'],
    invoice: ['view'],
    domain:  ['view', 'create', 'edit'],
    ticket:  ['view', 'create', 'edit'],
    user:    ['view', 'edit'],
    admin:   [],
  },
  // future: reseller role
}

export function usePermissions() {
  const auth = useAuthStore()

  function can(action: Action, resource: Resource): boolean {
    if (!auth.isAuthenticated) return false
    const role = auth.user?.role ?? 'client'
    const matrix = ROLE_PERMISSIONS[role]
    if (!matrix) return false
    return matrix[resource]?.includes(action) ?? false
  }

  return {
    // Declarative boolean flags — use in v-if and composable guards
    canView:   (resource: Resource) => can('view', resource),
    canCreate: (resource: Resource) => can('create', resource),
    canEdit:   (resource: Resource) => can('edit', resource),
    canDelete: (resource: Resource) => can('delete', resource),

    // Role shortcuts
    isAdmin:  auth.isAdmin,
    isClient: auth.isClient,

    // Raw checker for complex conditions
    can,
  }
}
