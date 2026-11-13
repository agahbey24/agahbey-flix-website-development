import { get } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/session'
import { resolveStream } from '@/lib/access'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = request.nextUrl.searchParams
  const titleId = Number(params.get('title')) || undefined
  const episodeId = Number(params.get('episode')) || undefined
  const wantsDownload = params.get('download') === '1'

  const stream = await resolveStream(
    { userId: session.user.id, isAdmin: isAdminEmail(session.user.email) },
    { titleId, episodeId },
  )
  if (!stream) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (wantsDownload && !stream.allowDownload) {
    return NextResponse.json({ error: 'Downloads are disabled for this title' }, { status: 403 })
  }

  try {
    const range = request.headers.get('range')
    const result = await get(stream.pathname, {
      access: 'private',
      headers: range ? { Range: range } : undefined,
    })
    if (!result || result.statusCode !== 200) {
      return new NextResponse('Not found', { status: 404 })
    }

    const upstream = result.headers
    const headers = new Headers({
      'Content-Type': result.blob.contentType || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': wantsDownload
        ? `attachment; filename="${stream.filename}"`
        : 'inline',
    })
    const contentRange = upstream.get('content-range')
    const contentLength = upstream.get('content-length')
    if (contentRange) headers.set('Content-Range', contentRange)
    if (contentLength) headers.set('Content-Length', contentLength)

    return new NextResponse(result.stream, {
      status: contentRange ? 206 : 200,
      headers,
    })
  } catch (error) {
    console.error('Stream error:', error)
    return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 })
  }
}
