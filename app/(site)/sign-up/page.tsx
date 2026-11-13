import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Create account' }

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  if (await getSession()) redirect('/')
  return (
    <AuthShell title="Create your account" subtitle="Buy movies from TSh 500 and build your personal library.">
      <AuthForm mode="sign-up" next={next} />
    </AuthShell>
  )
}
