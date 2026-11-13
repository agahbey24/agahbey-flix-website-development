import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { PaymentForm } from '@/components/checkout/payment-form'
import { db } from '@/lib/db'
import { seasons } from '@/lib/db/schema'
import { getSettings, getTitleBySlug, hasMovieAccess, hasSeasonAccess } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { MOVIE_PRICE, PAYMENT_METHODS, SEASON_PRICE, formatTsh } from '@/lib/constants'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ season?: string }>
}) {
  const { slug } = await params
  const { season: seasonParam } = await searchParams
  const session = await requireUser(`/checkout/${slug}${seasonParam ? `?season=${seasonParam}` : ''}`)
  const title = await getTitleBySlug(slug)
  if (!title) notFound()

  let seasonId = 0
  let itemLabel = title.title
  let price = MOVIE_PRICE
  if (title.type === 'series') {
    const [season] = await db
      .select()
      .from(seasons)
      .where(and(eq(seasons.id, Number(seasonParam) || 0), eq(seasons.titleId, title.id)))
      .limit(1)
    if (!season) redirect(`/title/${slug}`)
    seasonId = season.id
    itemLabel = `${title.title} ${'\u2014'} ${season.name || `Season ${season.seasonNumber}`}`
    price = SEASON_PRICE
    if (await hasSeasonAccess(session.user.id, title.id, season.id)) redirect(`/title/${slug}`)
  } else if (await hasMovieAccess(session.user.id, title.id)) {
    redirect(`/watch/${slug}`)
  }

  const settings = await getSettings()
  const methods = PAYMENT_METHODS.map((m) => ({
    id: m.id,
    name: m.name,
    color: m.color,
    number: settings[m.settingKey] ?? '',
  })).filter((m) => m.number)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 md:px-8">
      <Link href={`/title/${slug}`} className="text-sm text-muted-foreground hover:text-foreground">
        {'\u2190'} Back to {title.title}
      </Link>
      <h1 className="mt-3 font-display text-4xl tracking-wide md:text-5xl">Complete your purchase</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="relative aspect-[2/3] w-40 overflow-hidden rounded-lg ring-1 ring-white/10 md:w-full">
            <Image src={title.posterUrl} alt={`${title.title} poster`} fill sizes="260px" className="object-cover" />
          </div>
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <p className="text-sm text-muted-foreground">You are buying</p>
            <p className="mt-1 font-semibold text-pretty">{itemLabel}</p>
            <p className="mt-3 text-sm text-muted-foreground">Amount to pay</p>
            <p className="font-display text-4xl tracking-wide text-brand">{formatTsh(price)}</p>
          </div>
        </aside>

        <PaymentForm
          titleId={title.id}
          seasonId={seasonId}
          price={formatTsh(price)}
          itemLabel={itemLabel}
          accountName={settings.pay_account_name || 'AGAHBEY FLIX'}
          methods={methods}
          whatsapp={settings.whatsapp ?? ''}
          customerName={session.user.name}
        />
      </div>
    </div>
  )
}
