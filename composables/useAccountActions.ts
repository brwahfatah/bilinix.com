// Orchestration layer for account self-service mutations.
// Wraps useAuthStore actions with notifications so pages stay thin.

export function useAccountActions() {
  const auth = useAuthStore()
  const notify = useNotification()

  async function updateProfile(name: string): Promise<boolean> {
    try {
      await auth.updateProfile(name)
      notify.success('Profile updated', 'Your display name has been saved.')
      return true
    } catch (e: any) {
      notify.error('Update failed', e?.message ?? 'Could not update your profile.')
      return false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await auth.changePassword(currentPassword, newPassword)
      notify.success('Password changed', 'Your new password is now active.')
      return true
    } catch (e: any) {
      notify.error('Password change failed', e?.message ?? 'Could not change password. Check your current password.')
      return false
    }
  }

  async function logoutEverywhere(): Promise<void> {
    await auth.logout({ everywhere: true })
  }

  return {
    updateProfile,
    changePassword,
    logoutEverywhere,
    isLoading: computed(() => auth.loading),
  }
}
