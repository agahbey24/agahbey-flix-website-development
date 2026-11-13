import { MessageCircleIcon } from 'lucide-react'
import { getSettings } from '@/lib/queries'
import { whatsappLink } from '@/lib/constants'

export async function WhatsAppButton() {
  const settings = await getSettings()
  if (!settings.whatsapp) return null
  const href = whatsappLink(
    settings.whatsapp,
    'Hello AGAHBEY FLIX, I need help with my payment / account.',
  )

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lg shadow-black/40 transition-all hover:scale-105 md:right-6 md:bottom-6"
      aria-label="Contact AGAHBEY FLIX support on WhatsApp"
    >
      <MessageCircleIcon className="size-6" aria-hidden="true" />
      <span className="hidden pr-1 text-sm font-semibold md:inline">Support</span>
    </a>
  )
}
