'use client'

import Image from 'next/image'
import Link from 'next/link'
import { InfoIcon, PlayIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { priceLabel } from '@/components/catalog/title-card'
import type { PublicTitle } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function Hero({ titles }: { titles: PublicTitle[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (titles.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % titles.length), 8000)
    return () => clearInterval(id)
  }, [titles.length])

  if (titles.length === 0) return null
  const current = titles[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured titles"
      className="relative -mt-16 h-[78vh] min-h-[520px] w-full overflow-hidden md:h-[88vh]"
    >
      {titles.map((t, i) => (
        <div
          key={t.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={t.backdropUrl || t.posterUrl}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn('object-cover', i === index && 'animate-hero-zoom')}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 md:px-8 md:pb-32">
        <div key={current.id} className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-brand uppercase">
            <span className="h-px w-8 bg-brand" aria-hidden="true" />
            Featured {current.type === 'series' ? 'Series' : 'Movie'}
          </p>
          <h1 className="font-display text-6xl leading-[0.9] tracking-wide text-balance text-foreground md:text-8xl">
            {current.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-foreground/80">
            <span>{current.releaseYear}</span>
            <span aria-hidden="true">{'\u00B7'}</span>
            <span>{current.genre}</span>
            {current.rating && (
              <span className="rounded border border-white/30 px-1.5 text-xs">{current.rating}</span>
            )}
            {current.durationMinutes && (
              <>
                <span aria-hidden="true">{'\u00B7'}</span>
                <span>{`${Math.floor(current.durationMinutes / 60)}h ${current.durationMinutes % 60}m`}</span>
              </>
            )}
          </div>
          <p className="mt-4 line-clamp-3 text-base leading-relaxed text-foreground/85 text-pretty md:text-lg">
            {current.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/title/${current.slug}`}
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-2 px-6 text-base')}
            >
              <PlayIcon className="size-5 fill-current" aria-hidden="true" />
              Watch now
            </Link>
            <Link
              href={`/title/${current.slug}#trailer`}
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'lg' }),
                'h-11 gap-2 bg-white/15 px-6 text-base backdrop-blur hover:bg-white/25',
              )}
            >
              <InfoIcon className="size-5" aria-hidden="true" />
              Trailer & info
            </Link>
            <span className="text-sm font-semibold text-foreground">{priceLabel(current.type)}</span>
          </div>
        </div>

        {titles.length > 1 && (
          <div className="mt-10 flex gap-2" role="tablist" aria-label="Choose featured title">
            {titles.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${t.title}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1 rounded-full transition-all',
                  i === index ? 'w-10 bg-brand' : 'w-5 bg-white/40 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
