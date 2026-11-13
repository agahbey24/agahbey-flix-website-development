import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { ResetPasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = { title: 'Set new password', robots: { index: false } }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams
  return (
    <AuthShell title="Set a new password">
      {token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-foreground/85">This reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  )
}
