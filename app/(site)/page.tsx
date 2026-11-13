import { Hero } from '@/components/catalog/hero'
import { TitleRow } from '@/components/catalog/title-row'
import { GenreChips } from '@/components/catalog/genre-chips'
import { PricingStrip } from '@/components/catalog/pricing-strip'
import { getCatalog, getUserGrants } from '@/lib/queries'
import { getSession } from '@/lib/session'
import { GENRES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [catalog, session] = await Promise.all([getCatalog(), getSession()])
  const grants = session ? await getUserGrants(session.user.id) : []
  const ownedIds = new Set(grants.map((g) => g.titleId))

  const featured = catalog.filter((t) => t.featured)
  const trending = catalog.filter((t) => t.trending)
  const latest = [...catalog]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.releaseYear - a.releaseYear)
    .slice(0, 12)

  return (
    <>
      <Hero titles={featured.length ? featured : catalog.slice(0, 3)} />
      <div className="relative z-10 -mt-12 flex flex-col gap-10 md:-mt-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <GenreChips />
        </div>
        <TitleRow heading="Featured" titles={featured} ownedIds={ownedIds} href="/browse" />
        <TitleRow heading="Trending Now" titles={trending} ownedIds={ownedIds} href="/browse" />
        <TitleRow heading="Latest Releases" titles={latest} ownedIds={ownedIds} href="/browse" />
        <PricingStrip />
        {GENRES.map((genre) => (
          <TitleRow
            key={genre}
            id={genre.toLowerCase()}
            heading={genre}
            titles={catalog.filter((t) => t.genre === genre)}
            ownedIds={ownedIds}
            href={`/browse?genre=${genre}`}
          />
        ))}
      </div>
    </>
  )
}
