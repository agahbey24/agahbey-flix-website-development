import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('size-8', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="agahbey-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff2a36" />
          <stop offset="1" stopColor="#b20710" />
        </linearGradient>
      </defs>
      <path d="M32 6 54 58H43.5L32 30 20.5 58H10Z" fill="url(#agahbey-red)" />
      <path d="M27 40.5v12.5l10.5-6.25Z" fill="#fff" />
    </svg>
  )
}

export function Logo({
  className,
  href = '/',
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn('group flex items-center gap-2', className)}
      aria-label="AGAHBEY FLIX home"
    >
      <LogoMark className="transition-transform group-hover:scale-110" />
      <span className="font-display text-2xl leading-none tracking-wider text-foreground md:text-3xl">
        AGAHBEY<span className="text-brand"> FLIX</span>
      </span>
    </Link>
  )
}
