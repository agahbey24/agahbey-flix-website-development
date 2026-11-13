import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return Boolean(adminEmail && email && email.trim().toLowerCase() === adminEmail)
}

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  return { ...session, isAdmin: isAdminEmail(session.user.email) }
})

export async function requireUser(redirectTo = '/') {
  const session = await getSession()
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(redirectTo)}`)
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect('/sign-in?next=/admin')
  if (!session.isAdmin) redirect('/')
  return session
}

export async function assertAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) throw new Error('Forbidden')
  return session
}

export async function assertUser() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}
