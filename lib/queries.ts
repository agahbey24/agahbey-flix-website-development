import 'server-only'
import { and, asc, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  accessGrants,
  episodes,
  seasons,
  settings,
  titles,
  type Title,
} from '@/lib/db/schema'

export type PublicTitle = Omit<Title, 'videoPathname'>

const publicColumns = {
  id: titles.id,
  slug: titles.slug,
  title: titles.title,
  description: titles.description,
  genre: titles.genre,
  releaseYear: titles.releaseYear,
  type: titles.type,
  posterUrl: titles.posterUrl,
  backdropUrl: titles.backdropUrl,
  trailerUrl: titles.trailerUrl,
  durationMinutes: titles.durationMinutes,
  rating: titles.rating,
  featured: titles.featured,
  trending: titles.trending,
  allowDownload: titles.allowDownload,
  published: titles.published,
  createdAt: titles.createdAt,
  updatedAt: titles.updatedAt,
}

export async function getCatalog(): Promise<PublicTitle[]> {
  return db
    .select(publicColumns)
    .from(titles)
    .where(eq(titles.published, true))
    .orderBy(desc(titles.releaseYear), desc(titles.createdAt))
}

export async function searchCatalog(q?: string, genre?: string) {
  const conditions = [eq(titles.published, true)]
  if (q) {
    const pattern = `%${q.replace(/[%_]/g, '')}%`
    conditions.push(
      or(ilike(titles.title, pattern), ilike(titles.description, pattern))!,
    )
  }
  if (genre) conditions.push(eq(titles.genre, genre))
  return db
    .select(publicColumns)
    .from(titles)
    .where(and(...conditions))
    .orderBy(desc(titles.releaseYear))
}

export async function getTitleBySlug(slug: string) {
  const [row] = await db
    .select(publicColumns)
    .from(titles)
    .where(and(eq(titles.slug, slug), eq(titles.published, true)))
    .limit(1)
  return row ?? null
}

export async function getSeasonsWithEpisodes(titleId: number) {
  const seasonRows = await db
    .select()
    .from(seasons)
    .where(eq(seasons.titleId, titleId))
    .orderBy(asc(seasons.seasonNumber))
  const episodeRows = await db
    .select({
      id: episodes.id,
      seasonId: episodes.seasonId,
      episodeNumber: episodes.episodeNumber,
      name: episodes.name,
      description: episodes.description,
      durationMinutes: episodes.durationMinutes,
    })
    .from(episodes)
    .where(eq(episodes.titleId, titleId))
    .orderBy(asc(episodes.episodeNumber))
  return seasonRows.map((s) => ({
    ...s,
    episodes: episodeRows.filter((e) => e.seasonId === s.id),
  }))
}

export async function getUserGrants(userId: string) {
  return db
    .select()
    .from(accessGrants)
    .where(eq(accessGrants.userId, userId))
}

export async function getLibrary(userId: string) {
  const grants = await getUserGrants(userId)
  if (grants.length === 0) return []
  const titleIds = [...new Set(grants.map((g) => g.titleId))]
  const rows = await db
    .select(publicColumns)
    .from(titles)
    .where(inArray(titles.id, titleIds))
  const seasonRows = await db
    .select()
    .from(seasons)
    .where(inArray(seasons.titleId, titleIds))
  return rows.map((t) => ({
    ...t,
    seasons: grants
      .filter((g) => g.titleId === t.id && g.seasonId !== 0)
      .map((g) => seasonRows.find((s) => s.id === g.seasonId))
      .filter(Boolean),
  }))
}

export async function hasMovieAccess(userId: string, titleId: number) {
  const [row] = await db
    .select({ id: accessGrants.id })
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.userId, userId),
        eq(accessGrants.titleId, titleId),
        eq(accessGrants.seasonId, 0),
      ),
    )
    .limit(1)
  return Boolean(row)
}

export async function hasSeasonAccess(
  userId: string,
  titleId: number,
  seasonId: number,
) {
  const [row] = await db
    .select({ id: accessGrants.id })
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.userId, userId),
        eq(accessGrants.titleId, titleId),
        eq(accessGrants.seasonId, seasonId),
      ),
    )
    .limit(1)
  return Boolean(row)
}

export async function getSettings() {
  const rows = await db.select().from(settings)
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
    string,
    string
  >
}
