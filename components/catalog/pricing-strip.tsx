import { FilmIcon, LayersIcon, ShieldCheckIcon, SmartphoneIcon } from 'lucide-react'
import { MOVIE_PRICE, SEASON_PRICE, PAYMENT_METHODS, formatTsh } from '@/lib/constants'

export function PricingStrip() {
  return (
    <section aria-labelledby="pricing-heading" className="mx-auto w-full max-w-7xl px-4 md:px-8">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-brand/25 via-card to-card p-6 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 id="pricing-heading" className="font-display text-4xl tracking-wide md:text-5xl">
              Pay once. Watch anytime.
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-foreground/80">
              No subscriptions. Buy exactly what you want to watch with Tanzanian
              mobile money. Every payment is verified by our team before access is unlocked.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m.id}
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-sm"
                >
                  <SmartphoneIcon className="size-3.5" style={{ color: m.color }} aria-hidden="true" />
                  {m.name}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/50 p-5">
              <FilmIcon className="size-6 text-brand" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">One movie</p>
              <p className="font-display text-4xl tracking-wide">{formatTsh(MOVIE_PRICE)}</p>
            </div>
            <div className="rounded-lg border border-brand/40 bg-black/50 p-5">
              <LayersIcon className="size-6 text-brand" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">Complete season</p>
              <p className="font-display text-4xl tracking-wide">{formatTsh(SEASON_PRICE)}</p>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
              <ShieldCheckIcon className="size-4 text-success" aria-hidden="true" />
              Secure streaming. Your library is available on phone, tablet and computer.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
