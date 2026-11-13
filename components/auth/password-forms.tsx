'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { whatsappLink } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function ForgotPasswordForm({ whatsapp }: { whatsapp: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4">
        <p className="leading-relaxed text-foreground/85">
          If an account exists for <strong>{sentTo}</strong>, a secure reset link has been created.
          Message our support team on WhatsApp from your registered details and the administrator
          will send you the link. It expires in 24 hours.
        </p>
        {whatsapp && (
          <a
            href={whatsappLink(whatsapp, `Hello AGAHBEY FLIX, I requested a password reset for ${sentTo}. Please send me my secure reset link.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), 'h-11 gap-2 bg-[#25D366] text-base text-white hover:bg-[#25D366]/90')}
          >
            <MessageCircleIcon aria-hidden="true" /> Request link on WhatsApp
          </a>
        )}
        <Link href="/sign-in" className="text-center text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const email = String(new FormData(e.currentTarget).get('email') ?? '').trim()
        setPending(true)
        const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
        setPending(false)
        if (error) {
          toast.error('Could not start the reset. Please try again.')
          return
        }
        setSentTo(email)
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Account email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-11" />
      </div>
      <Button type="submit" disabled={pending} className="h-11 text-base">
        {pending ? 'Please wait...' : 'Request reset link'}
      </Button>
      <Link href="/sign-in" className="text-center text-sm text-muted-foreground hover:text-foreground">
        Back to sign in
      </Link>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setError(null)
        const form = new FormData(e.currentTarget)
        const newPassword = String(form.get('password') ?? '')
        if (newPassword !== String(form.get('confirm') ?? '')) {
          setError('Passwords do not match.')
          return
        }
        setPending(true)
        const { error } = await authClient.resetPassword({ newPassword, token })
        setPending(false)
        if (error) {
          setError('This link is invalid or has expired. Please request a new one.')
          return
        }
        toast.success('Password updated. Please sign in.')
        router.push('/sign-in')
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="h-11" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="h-11 text-base">
        {pending ? 'Saving...' : 'Set new password'}
      </Button>
    </form>
  )
}

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false)
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const formEl = e.currentTarget
        const form = new FormData(formEl)
        const newPassword = String(form.get('newPassword') ?? '')
        if (newPassword !== String(form.get('confirm') ?? '')) {
          toast.error('New passwords do not match.')
          return
        }
        setPending(true)
        const { error } = await authClient.changePassword({
          currentPassword: String(form.get('currentPassword') ?? ''),
          newPassword,
          revokeOtherSessions: true,
        })
        setPending(false)
        if (error) {
          toast.error('Could not change password. Check your current password.')
          return
        }
        formEl.reset()
        toast.success('Password changed.')
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmNew">Confirm</Label>
          <Input id="confirmNew" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
      </div>
      <Button type="submit" variant="secondary" disabled={pending} className="self-start">
        {pending ? 'Saving...' : 'Change password'}
      </Button>
    </form>
  )
}
