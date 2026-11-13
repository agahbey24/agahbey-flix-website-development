import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { ClockIcon, LockIcon, PlayIcon, ShoppingCartIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Trailer } from '@/components/catalog/trailer'
import { TitleRow } from '@/components/catalog/title-row'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { getCatalog, getSeasonsWithEpisodes, getTitleBySlug, getUserGrants } from '@/lib/queries'
import { getSession } from '@/lib/session'
import { MOVIE_PRICE, SEASON_PRICE, formatTsh } from '@/lib/constants'
import { cn } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const title = await getTitleBySlug(slug)
  return title ? { title: title.title, description: title.description } : {}
}

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = await getTitleBySlug(slug)
  if (!title) notFound()

  const session = await getSession()
  const [seasonList, grants, pending, catalog] = await Promise.all([
    title.type === 'series' ? getSeasonsWithEpisodes(title.id) : Promise.resolve([]),
    session ? getUserGrants(session.user.id) : Promise.resolve([]),
    session
      ? db
          .select({ seasonId: payments.seasonId })
          .from(payments)
          .where(
            and(
              eq(payments.userId, session.user.id),
              eq(payments.titleId, title.id),
              eq(payments.status, 'pending'),
            ),
          )
      : Promise.resolve([]),
    getCatalog(),
  ])

  const isAdmin = Boolean(session?.isAdmin)
  const ownsMovie = isAdmin || grants.some((g) => g.titleId === title.id && g.seasonId === 0)
  const ownsSeason = (id: number) =>
    isAdmin || grants.some((g) => g.titleId === title.id && g.seasonId === id)
  const isPending = (seasonId: number) => pending.some((p) => p.seasonId === seasonId)
  const related = catalog.filter((t) => t.genre === title.genre && t.id !== title.id)

  return (
    <>
      <section className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={title.backdropUrl || title.posterUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pt-28 pb-10 md:grid-cols-[280px_1fr] md:px-8 md:pt-36">
          <div className="relative mx-auto aspect-[2/3] w-52 overflow-hidden rounded-lg shadow-2xl shadow-black ring-1 ring-white/10 md:w-full">
            <Image src={title.posterUrl} alt={`${title.title} poster`} fill sizes="280px" className="object-cover" />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold tracking-[0.3em] text-brand uppercase">
              {title.type === 'series' ? 'Series' : 'Movie'} {'\u00B7'} {title.genre}
            </p>
            <h1 className="mt-2 font-display text-5xl leading-none tracking-wide text-balance md:text-7xl">
              {title.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-foreground/80">
              <span>{title.releaseYear}</span>
              {title.rating && <span className="rounded border border-white/30 px-1.5 text-xs">{title.rating}</span>}
              {title.durationMinutes && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3.5" aria-hidden="true" />
                  {`${Math.floor(title.durationMinutes / 60)}h ${title.durationMinutes % 60}m`}
                </span>
              )}
              {title.type === 'series' && <span>{`${seasonList.length} season${seasonList.length === 1 ? '' : 's'}`}</span>}
            </div>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85 text-pretty md:text-lg">
              {title.description}
            </p>

            {title.type === 'movie' && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {ownsMovie ? (
                  <Link href={`/watch/${title.slug}`} className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-2 px-6 text-base')}>
                    <PlayIcon className="size-5 fill-current" aria-hidden="true" /> Watch now
                  </Link>
                ) : isPending(0) ? (
                  <span className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning">
                    Payment submitted {'\u2014'} awaiting admin verification
                  </span>
                ) : (
                  <Link
                    href={session ? `/checkout/${title.slug}` : `/sign-in?next=/checkout/${title.slug}`}
                    className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-2 px-6 text-base')}
                  >
                    <ShoppingCartIcon className="size-5" aria-hidden="true" /> Buy for {formatTsh(MOVIE_PRICE)}
                  </Link>
                )}
                <a href="#trailer" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-11 px-6 text-base')}>
                  Watch trailer
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 md:px-8">
        {title.type === 'series' && (
          <section aria-labelledby="seasons-heading">
            <h2 id="seasons-heading" className="font-display text-3xl tracking-wide">Seasons & episodes</h2>
            {seasonList.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">Seasons are coming soon.</p>
            )}
            <div className="mt-4 flex flex-col gap-5">
              {seasonList.map((s) => {
                const owned = ownsSeason(s.id)
                return (
                  <div key={s.id} className="overflow-hidden rounded-lg border border-white/10 bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                      <div>
                        <h3 className="font-semibold">{s.name || `Season ${s.seasonNumber}`}</h3>
                        <p className="text-xs text-muted-foreground">{`${s.episodes.length} episodes`}</p>
                      </div>
                      {owned ? (
                        <span className="rounded bg-success/15 px-2 py-1 text-xs font-medium text-success">Unlocked</span>
                      ) : isPending(s.id) ? (
                        <span className="rounded bg-warning/10 px-2 py-1 text-xs text-warning">Awaiting verification</span>
                      ) : (
                        <Link
                          href={session ? `/checkout/${title.slug}?season=${s.id}` : `/sign-in?next=/checkout/${title.slug}?season=${s.id}`}
                          className={cn(buttonVariants(), 'gap-1.5')}
                        >
                          <ShoppingCartIcon aria-hidden="true" /> Buy season {'\u2014'} {formatTsh(SEASON_PRICE)}
                        </Link>
                      )}
                    </div>
                    <ol className="divide-y divide-white/5">
                      {s.episodes.map((e) => (
                        <li key={e.id} className="flex items-center gap-4 p-4">
                          <span className="w-6 text-center font-display text-2xl text-muted-foreground">{e.episodeNumber}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{e.name}</p>
                            {e.durationMinutes && <p className="text-xs text-muted-foreground">{`${e.durationMinutes} min`}</p>}
                          </div>
                          {owned ? (
                            <Link
                              href={`/watch/${title.slug}?episode=${e.id}`}
                              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-1')}
                            >
                              <PlayIcon className="fill-current" aria-hidden="true" /> Play
                            </Link>
                          ) : (
                            <LockIcon className="size-4 text-muted-foreground" aria-label="Locked" />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {title.trailerUrl && (
          <section id="trailer" aria-labelledby="trailer-heading" className="scroll-mt-24">
            <h2 id="trailer-heading" className="font-display text-3xl tracking-wide">Official trailer</h2>
            <div className="mt-4 max-w-4xl">
              <Trailer url={title.trailerUrl} title={title.title} />
            </div>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <TitleRow heading={`More ${title.genre}`} titles={related} />
        </div>
      )}
    </>
  )
}
