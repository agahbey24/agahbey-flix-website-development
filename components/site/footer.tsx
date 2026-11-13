import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { GENRES, PAYMENT_METHODS } from '@/lib/constants'

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-black/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="flex flex-col gap-3 md:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Premium cinematic entertainment. Buy any movie for TSh 500 or a full
            season for TSh 1,000 and stream it instantly on any device.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m.id}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground/80"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Genres</h2>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {GENRES.map((g) => (
              <li key={g}>
                <Link href={`/browse?genre=${g}`} className="hover:text-foreground">
                  {g}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Account</h2>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/account" className="hover:text-foreground">My Account</Link></li>
            <li><Link href="/library" className="hover:text-foreground">My Library</Link></li>
            <li><Link href="/forgot-password" className="hover:text-foreground">Reset password</Link></li>
            <li><Link href="/browse" className="hover:text-foreground">Browse all</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-muted-foreground">
        {`\u00A9 ${new Date().getFullYear()} AGAHBEY FLIX. All rights reserved.`}
      </div>
    </footer>
  )
}
