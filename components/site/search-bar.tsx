'use client'

import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function SearchBar({
  className,
  autoFocus,
  onSearched,
}: {
  className?: string
  autoFocus?: boolean
  onSearched?: () => void
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault()
        const q = query.trim()
        router.push(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse')
        onSearched?.()
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Search movies
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="site-search"
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles..."
        className="h-9 w-full rounded-full border border-white/10 bg-white/5 pr-4 pl-9 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-brand/60 focus:bg-black/60 md:w-56 md:focus:w-72"
      />
    </form>
  )
}
