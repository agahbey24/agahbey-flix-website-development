import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { TitleCard } from '@/components/catalog/title-card'
import type { PublicTitle } from '@/lib/queries'

export function TitleRow({
  heading,
  titles,
  href,
  ownedIds,
  id,
}: {
  heading: string
  titles: PublicTitle[]
  href?: string
  ownedIds?: Set<number>
  id?: string
}) {
  if (titles.length === 0) return null
  return (
    <section id={id} aria-labelledby={`${heading}-heading`} className="scroll-mt-20">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-4 md:px-8">
        <h2
          id={`${heading}-heading`}
          className="font-display text-2xl tracking-wide text-foreground md:text-3xl"
        >
          {heading}
        </h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            See all <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="scrollbar-none mx-auto mt-3 flex max-w-7xl snap-x gap-3 overflow-x-auto px-4 py-3 md:gap-4 md:px-8">
        {titles.map((t) => (
          <div key={t.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-48">
            <TitleCard title={t} owned={ownedIds?.has(t.id)} />
          </div>
        ))}
      </div>
    </section>
  )
}
