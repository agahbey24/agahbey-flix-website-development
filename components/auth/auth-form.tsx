'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

function safeNext(next?: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export function AuthForm({ mode, next }: { mode: 'sign-in' | 'sign-up'; next?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    if (isSignUp && password !== String(form.get('confirm') ?? '')) {
      setError('Passwords do not match.')
      return
    }

    setPending(true)
    const result = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setPending(false)

    if (result.error) {
      setError(
        isSignUp
          ? 'We could not create your account. Check your details or try signing in.'
          : 'Invalid email or password.',
      )
      return
    }
    router.push(safeNext(next))
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {isSignUp && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required autoComplete="name" className="h-11" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {!isSignUp && (
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className="h-11"
        />
      </div>
      {isSignUp && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="h-11" />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 text-base">
        {pending ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : 'New to AGAHBEY FLIX? '}
        <Link
          href={`${isSignUp ? '/sign-in' : '/sign-up'}${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-medium text-foreground hover:text-brand"
        >
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  )
}
