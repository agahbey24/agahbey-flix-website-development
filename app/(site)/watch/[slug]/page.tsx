import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { LockIcon, PlayIcon } from 'lucide-react'
import { VideoPlayer } from '@/components/watch/video-player'
import { buttonVariants } from '@/components/ui/button'
import { getSeasonsWithEpisodes, getTitleBySlug, getUserGrants } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Watch', robots: { index: false } }

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ episode?: string }>
}) {
  const { slug } = await params
  const { episode } = await searchParams
  const session = await requireUser(`/watch/${slug}${episode ? `?episode=${episode}` : ''}`)
  const title = await getTitleBySlug(slug)
  if (!title) notFound()

  const grants = await getUserGrants(session.user.id)
  const owns = (seasonId: number) =>
    session.isAdmin || grants.some((g) => g.titleId === title.id && g.seasonId === seasonId)

  if (title.type === 'movie') {
    if (!owns(0)) redirect(`/title/${slug}`)
    const src = `/api/stream?title=${title.id}`
    return (
      <div className="mx-auto max-w-6xl px-0 pt-4 md:px-8 md:pt-8">
        <VideoPlayer
          src={src}
          title={title.title}
          poster={title.backdropUrl || undefined}
          downloadUrl={title.allowDownload ? `${src}&download=1` : undefined}
        />
        <div className="px-4 pt-6 md:px-0">
          <h1 className="font-display text-4xl tracking-wide">{title.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {title.genre} {'\u00B7'} {title.releaseYear}
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed text-foreground/80">{title.description}</p>
        </div>
      </div>
    )
  }

  const seasonList = await getSeasonsWithEpisodes(title.id)
  const allEpisodes = seasonList.flatMap((s) => s.episodes.map((e) => ({ ...e, season: s })))
  const selected =
    allEpisodes.find((e) => e.id === Number(episode)) ??
    allEpisodes.find((e) => owns(e.seasonId))
  if (!selected || !owns(selected.seasonId)) redirect(`/title/${slug}`)

  const src = `/api/stream?episode=${selected.id}`
  const label = `${title.title} ${'\u2014'} S${selected.season.seasonNumber}:E${selected.episodeNumber} ${selected.name}`

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-0 pt-4 md:px-8 md:pt-8 lg:grid-cols-[1fr_340px]">
      <div>
        <VideoPlayer
          key={selected.id}
          src={src}
          title={label}
          downloadUrl={title.allowDownload ? `${src}&download=1` : undefined}
        />
        <div className="px-4 pt-6 md:px-0">
          <p className="text-xs font-semibold tracking-[0.3em] text-brand uppercase">
            {`Season ${selected.season.seasonNumber} \u00B7 Episode ${selected.episodeNumber}`}
          </p>
          <h1 className="mt-1 font-display text-4xl tracking-wide">{selected.name}</h1>
          <p className="text-sm text-muted-foreground">{title.title}</p>
          {selected.description && <p className="mt-3 max-w-3xl leading-relaxed text-foreground/80">{selected.description}</p>}
        </div>
      </div>
      <aside className="px-4 md:px-0" aria-label="Episodes">
        {seasonList.map((s) => (
          <div key={s.id} className="mb-5">
            <h2 className="mb-2 text-sm font-semibold">{s.name || `Season ${s.seasonNumber}`}</h2>
            <ul className="flex flex-col gap-1">
              {s.episodes.map((e) => {
                const unlocked = owns(s.id)
                const active = e.id === selected.id
                return (
                  <li key={e.id}>
                    {unlocked ? (
                      <Link
                        href={`/watch/${slug}?episode=${e.id}`}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                          active ? 'bg-brand/15 text-foreground ring-1 ring-brand/50' : 'hover:bg-white/5',
                        )}
                      >
                        <PlayIcon className={cn('size-4', active ? 'fill-brand text-brand' : 'text-muted-foreground')} aria-hidden="true" />
                        <span className="truncate">{`${e.episodeNumber}. ${e.name}`}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground">
                        <LockIcon className="size-4" aria-hidden="true" />
                        <span className="truncate">{`${e.episodeNumber}. ${e.name}`}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            {!owns(s.id) && (
              <Link href={`/checkout/${slug}?season=${s.id}`} className={cn(buttonVariants({ size: 'sm' }), 'mt-2')}>
                Unlock this season
              </Link>
            )}
          </div>
        ))}
      </aside>
    </div>
  )
}
