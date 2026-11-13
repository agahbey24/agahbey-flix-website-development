import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: {
    default: 'AGAHBEY FLIX — Premium Movie Streaming',
    template: '%s | AGAHBEY FLIX',
  },
  description:
    'Stream premium movies and series on AGAHBEY FLIX. Buy a movie for TSh 500 or a full season for TSh 1,000 with M-Pesa, Mixx by Yas, Airtel Money or HaloPesa.',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} bg-background`}>
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
