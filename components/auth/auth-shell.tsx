import Image from 'next/image'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative -mt-16 flex min-h-dvh items-center justify-center overflow-hidden px-4 py-24">
      <Image
        src="/backdrops/red-harbour.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background" />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-black/75 p-6 shadow-2xl backdrop-blur-md md:p-10">
        <h1 className="font-display text-4xl tracking-wide">{title}</h1>
        {subtitle && <p className="mt-1 mb-6 text-sm text-muted-foreground">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  )
}
