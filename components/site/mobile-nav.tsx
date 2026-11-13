'use client'

import Link from 'next/link'
import { MenuIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { SearchBar } from '@/components/site/search-bar'

export function MobileNav({
  genres,
  signedIn,
}: {
  genres: string[]
  signedIn: boolean
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-md text-foreground hover:bg-white/10"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <MenuIcon className="size-5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={close}
        >
          <nav
            aria-label="Mobile"
            className="flex h-full w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto border-r border-white/10 bg-card p-5 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-2xl tracking-wider">
                AGAHBEY<span className="text-brand"> FLIX</span>
              </span>
              <button
                type="button"
                onClick={close}
                className="flex size-9 items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Close menu"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <SearchBar className="mb-4 w-full [&_input]:w-full" onSearched={close} />
            {[
              { href: '/', label: 'Home' },
              { href: '/browse', label: 'Browse all' },
              { href: '/browse?type=series', label: 'Series' },
              ...(signedIn
                ? [
                    { href: '/library', label: 'My Library' },
                    { href: '/account', label: 'My Account' },
                  ]
                : [
                    { href: '/sign-in', label: 'Sign in' },
                    { href: '/sign-up', label: 'Create account' },
                  ]),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-5 mb-1 px-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Genres
            </p>
            {genres.map((g) => (
              <Link
                key={g}
                href={`/browse?genre=${g}`}
                onClick={close}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-white/10"
              >
                {g}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
