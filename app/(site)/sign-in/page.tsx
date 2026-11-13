import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Sign in' }

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  if (await getSession()) redirect('/')
  return (
    <AuthShell title="Sign in" subtitle="Welcome back to AGAHBEY FLIX.">
      <AuthForm mode="sign-in" next={next} />
    </AuthShell>
  )
}
