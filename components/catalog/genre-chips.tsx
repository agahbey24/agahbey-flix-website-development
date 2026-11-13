import Link from 'next/link'
import { GENRES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function GenreChips({ active }: { active?: string }) {
  return (
    <nav aria-label="Genres" className="scrollbar-none flex gap-2 overflow-x-auto">
      <Link
        href="/browse"
        className={cn(
          'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors',
          !active
            ? 'border-brand bg-brand text-brand-foreground'
            : 'border-white/15 text-foreground/80 hover:border-white/40 hover:text-foreground',
        )}
      >
        All
      </Link>
      {GENRES.map((g) => (
        <Link
          key={g}
          href={`/browse?genre=${g}`}
          className={cn(
            'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors',
            active === g
              ? 'border-brand bg-brand text-brand-foreground'
              : 'border-white/15 text-foreground/80 hover:border-white/40 hover:text-foreground',
          )}
        >
          {g}
        </Link>
      ))}
    </nav>
  )
}
