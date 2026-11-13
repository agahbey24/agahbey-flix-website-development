import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { episodes, titles } from '@/lib/db/schema'
import { hasMovieAccess, hasSeasonAccess } from '@/lib/queries'

type Viewer = { userId: string; isAdmin: boolean }

/** Resolves the private video pathname for a viewer, or null when not authorized. */
export async function resolveStream(
  viewer: Viewer,
  target: { titleId?: number; episodeId?: number },
) {
  if (target.episodeId) {
    const [ep] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, target.episodeId))
      .limit(1)
    if (!ep?.videoPathname) return null
    const [title] = await db
      .select({ allowDownload: titles.allowDownload, slug: titles.slug })
      .from(titles)
      .where(eq(titles.id, ep.titleId))
      .limit(1)
    const allowed =
      viewer.isAdmin || (await hasSeasonAccess(viewer.userId, ep.titleId, ep.seasonId))
    if (!allowed || !title) return null
    return {
      pathname: ep.videoPathname,
      allowDownload: title.allowDownload,
      filename: `${title.slug}-e${ep.episodeNumber}.mp4`,
    }
  }

  if (target.titleId) {
    const [title] = await db
      .select()
      .from(titles)
      .where(eq(titles.id, target.titleId))
      .limit(1)
    if (!title?.videoPathname || title.type !== 'movie') return null
    const allowed = viewer.isAdmin || (await hasMovieAccess(viewer.userId, title.id))
    if (!allowed) return null
    return {
      pathname: title.videoPathname,
      allowDownload: title.allowDownload,
      filename: `${title.slug}.mp4`,
    }
  }

  return null
}
