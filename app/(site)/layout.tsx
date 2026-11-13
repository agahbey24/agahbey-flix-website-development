import { Suspense } from 'react'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { WhatsAppButton } from '@/components/site/whatsapp-button'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-white/5 bg-black" />}>
        <SiteHeader />
      </Suspense>
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
      <Suspense fallback={null}>
        <WhatsAppButton />
      </Suspense>
    </>
  )
}
