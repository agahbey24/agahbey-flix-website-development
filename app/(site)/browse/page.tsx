import type { Metadata } from 'next'
import { TitleCard } from '@/components/catalog/title-card'
import { GenreChips } from '@/components/catalog/genre-chips'
import { getUserGrants, searchCatalog } from '@/lib/queries'
import { getSession } from '@/lib/session'
import { GENRES } from '@/lib/constants'

export const metadata: Metadata = { title: 'Browse' }

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; type?: string }>
}) {
  const { q, genre: rawGenre, type } = await searchParams
  const genre = GENRES.find((g) => g === rawGenre)
  const query = q?.trim().slice(0, 80)
  const [results, session] = await Promise.all([
    searchCatalog(query, genre),
    getSession(),
  ])
  const filtered = type === 'series' || type === 'movie' ? results.filter((t) => t.type === type) : results
  const grants = session ? await getUserGrants(session.user.id) : []
  const owned = new Set(grants.map((g) => g.titleId))

  const heading = query
    ? `Results for "${query}"`
    : genre
      ? `${genre} titles`
      : type === 'series'
        ? 'All series'
        : 'Browse all titles'

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
      <h1 className="font-display text-4xl tracking-wide md:text-5xl">{heading}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'title' : 'titles'}
      </p>
      <div className="mt-6">
        <GenreChips active={genre} />
      </div>
      {filtered.length === 0 ? (
        <div className="mt-16 rounded-lg border border-dashed border-white/15 p-12 text-center">
          <p className="text-lg font-medium">No titles found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or browse another genre.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((t) => (
            <TitleCard key={t.id} title={t} owned={owned.has(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
