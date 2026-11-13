import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PlayIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { getLibrary } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'My Library' }

export default async function LibraryPage() {
  const session = await requireUser('/library')
  const library = await getLibrary(session.user.id)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
      <h1 className="font-display text-4xl tracking-wide md:text-5xl">My Library</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything you have unlocked, ready to stream.</p>

      {library.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-white/15 p-12 text-center">
          <p className="text-lg font-medium">Your library is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Purchased titles appear here once an administrator verifies your payment.
          </p>
          <Link href="/browse" className={cn(buttonVariants(), 'mt-5')}>Browse movies</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {library.map((t) => (
            <div key={t.id} className="flex flex-col gap-2">
              <Link
                href={`/watch/${t.slug}`}
                className="group relative aspect-[2/3] overflow-hidden rounded-md ring-1 ring-white/10 transition-all hover:ring-brand"
              >
                <Image src={t.posterUrl} alt={`${t.title} poster`} fill sizes="220px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex size-14 items-center justify-center rounded-full bg-brand">
                    <PlayIcon className="ml-0.5 size-6 fill-white text-white" aria-hidden="true" />
                  </span>
                </span>
              </Link>
              <div>
                <p className="truncate font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.type === 'series'
                    ? t.seasons.map((s) => s?.name).filter(Boolean).join(', ') || 'Series'
                    : `${t.genre} \u00B7 ${t.releaseYear}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
