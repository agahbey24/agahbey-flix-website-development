import { get } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Serves public artwork (posters, backdrops, trailers) uploaded to the private
// store. Full-length videos live under videos/ and are never served here.
const PUBLIC_PREFIXES = ['posters/', 'backdrops/', 'trailers/']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const pathname = path.join('/')
  if (!PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const range = request.headers.get('range')
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
      headers: range ? { Range: range } : undefined,
    })
    if (!result) return new NextResponse('Not found', { status: 404 })
    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: result.blob.etag, 'Cache-Control': 'public, max-age=3600' },
      })
    }
    const headers = new Headers({
      'Content-Type': result.blob.contentType,
      ETag: result.blob.etag,
      'Cache-Control': 'public, max-age=3600',
      'Accept-Ranges': 'bytes',
    })
    const contentRange = result.headers.get('content-range')
    const contentLength = result.headers.get('content-length')
    if (contentRange) headers.set('Content-Range', contentRange)
    if (contentLength) headers.set('Content-Length', contentLength)
    return new NextResponse(result.stream, { status: contentRange ? 206 : 200, headers })
  } catch (error) {
    console.error('Media error:', error)
    return new NextResponse('Failed to load media', { status: 500 })
  }
}
