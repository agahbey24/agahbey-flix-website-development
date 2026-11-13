import Image from 'next/image'
import Link from 'next/link'
import { CheckIcon } from 'lucide-react'
import { MOVIE_PRICE, SEASON_PRICE, formatTsh } from '@/lib/constants'
import type { PublicTitle } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function priceLabel(type: string) {
  return type === 'series'
    ? `${formatTsh(SEASON_PRICE)} / season`
    : formatTsh(MOVIE_PRICE)
}

export function TitleCard({
  title,
  owned,
  className,
  priority,
}: {
  title: PublicTitle
  owned?: boolean
  className?: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/title/${title.slug}`}
      className={cn(
        'group relative block w-full shrink-0 overflow-hidden rounded-md bg-card ring-1 ring-white/5 transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:ring-brand/60 hover:shadow-2xl hover:shadow-black/60 focus-visible:ring-2 focus-visible:ring-brand',
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={title.posterUrl || '/placeholder.svg'}
          alt={`${title.title} poster`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />
        {title.type === 'series' && (
          <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-foreground uppercase">
            Series
          </span>
        )}
        {owned && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded bg-success px-1.5 py-0.5 text-[10px] font-semibold text-black uppercase">
            <CheckIcon className="size-3" aria-hidden="true" /> Owned
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
          <h3 className="line-clamp-1 font-semibold text-foreground text-pretty">
            {title.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {title.genre} {'\u00B7'} {title.releaseYear}
          </p>
          <p className="line-clamp-2 max-h-0 text-xs leading-relaxed text-foreground/80 opacity-0 transition-all duration-300 group-hover:max-h-10 group-hover:opacity-100">
            {title.description}
          </p>
          <p className="text-xs font-semibold text-brand">{priceLabel(title.type)}</p>
        </div>
      </div>
    </Link>
  )
}
