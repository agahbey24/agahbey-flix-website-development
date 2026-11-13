'use client'

import { useRouter } from 'next/navigation'
import {
  FilmIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'

export function UserMenu({
  name,
  email,
  isAdmin,
}: {
  name: string
  email: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-md bg-brand text-sm font-semibold text-brand-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Account menu"
      >
        {initials || 'U'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate font-medium text-foreground">{name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/account')}>
          <UserIcon /> My Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/library')}>
          <FilmIcon /> My Library
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <LayoutDashboardIcon /> Admin Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut()
            router.push('/')
            router.refresh()
          }}
        >
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
