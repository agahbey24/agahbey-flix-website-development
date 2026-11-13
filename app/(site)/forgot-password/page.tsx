import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/auth/password-forms'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = { title: 'Reset password' }

export default async function ForgotPasswordPage() {
  const settings = await getSettings()
  return (
    <AuthShell title="Reset password" subtitle="Enter your account email to create a secure reset link.">
      <ForgotPasswordForm whatsapp={settings.whatsapp ?? ''} />
    </AuthShell>
  )
}
