import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { SearchBar } from '@/components/site/search-bar'
import { UserMenu } from '@/components/site/user-menu'
import { MobileNav } from '@/components/site/mobile-nav'
import { buttonVariants } from '@/components/ui/button'
import { getSession } from '@/lib/session'
import { GENRES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export async function SiteHeader() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-gradient-to-b from-black/95 to-black/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        <MobileNav genres={[...GENRES]} signedIn={Boolean(session)} />
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-5 text-sm lg:flex">
          <Link href="/" className="text-foreground/80 transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/browse" className="text-foreground/80 transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link href="/browse?type=series" className="text-foreground/80 transition-colors hover:text-foreground">
            Series
          </Link>
          {session && (
            <Link href="/library" className="text-foreground/80 transition-colors hover:text-foreground">
              My Library
            </Link>
          )}
          {session?.isAdmin && (
            <Link href="/admin" className="font-medium text-brand transition-colors hover:text-brand/80">
              Admin
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <SearchBar className="hidden md:block" />
          {session ? (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              isAdmin={session.isAdmin}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: 'ghost' }), 'hidden sm:inline-flex')}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonVariants()}>
                Join now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
