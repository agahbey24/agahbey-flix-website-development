'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/actions/account'

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, {})

  useEffect(() => {
    if (state.ok) toast.success('Profile updated')
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input id="profile-name" name="name" defaultValue={name} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-phone">Phone (for WhatsApp support)</Label>
          <Input id="profile-phone" name="phone" defaultValue={phone} inputMode="tel" placeholder="0712345678" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={email} disabled readOnly />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  )
}
