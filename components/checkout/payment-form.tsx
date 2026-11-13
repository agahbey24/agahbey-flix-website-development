'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { CheckCircle2Icon, CopyIcon, MessageCircleIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitPayment, type PaymentState } from '@/app/actions/payments'
import { whatsappLink } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Method = { id: string; name: string; color: string; number: string }

export function PaymentForm({
  titleId,
  seasonId,
  price,
  itemLabel,
  accountName,
  methods,
  whatsapp,
  customerName,
}: {
  titleId: number
  seasonId: number
  price: string
  itemLabel: string
  accountName: string
  methods: Method[]
  whatsapp: string
  customerName: string
}) {
  const [methodId, setMethodId] = useState(methods[0]?.id ?? '')
  const [state, action, pending] = useActionState<PaymentState, FormData>(submitPayment, {})
  const method = methods.find((m) => m.id === methodId)

  if (state.success) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-success/30 bg-success/5 p-6">
        <CheckCircle2Icon className="size-10 text-success" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Payment submitted for verification</h2>
        <p className="leading-relaxed text-foreground/80">
          Thank you, {customerName}. Our team will verify your transaction and unlock{' '}
          <strong>{itemLabel}</strong> in your library. You can track the status in your account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/account" className={buttonVariants()}>View payment status</Link>
          {whatsapp && (
            <a
              href={whatsappLink(whatsapp, `Hello AGAHBEY FLIX, I have paid ${price} for "${itemLabel}". Please verify my payment.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'secondary' }), 'gap-1.5')}
            >
              <MessageCircleIcon aria-hidden="true" /> Notify admin on WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="titleId" value={titleId} />
      <input type="hidden" name="seasonId" value={seasonId} />
      <input type="hidden" name="method" value={methodId} />

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">1. Choose your mobile money provider</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethodId(m.id)}
              aria-pressed={m.id === methodId}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm font-medium transition-all',
                m.id === methodId
                  ? 'border-brand bg-brand/10 ring-1 ring-brand'
                  : 'border-white/10 bg-card hover:border-white/30',
              )}
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
              {m.name}
            </button>
          ))}
        </div>
      </fieldset>

      {method && (
        <div className="rounded-lg border border-white/10 bg-card p-5">
          <h2 className="text-sm font-semibold">2. Send {price} with {method.name}</h2>
          <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
            <li>Open your {method.name} menu and choose <strong>Send Money</strong>.</li>
            <li className="flex flex-wrap items-center gap-2">
              <span>Send to number</span>
              <span className="rounded bg-black/50 px-2 py-0.5 font-mono font-semibold text-foreground">{method.number}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(method.number.replace(/\s/g, ''))
                  toast.success('Number copied')
                }}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                <CopyIcon className="size-3" aria-hidden="true" /> Copy
              </button>
            </li>
            <li>Confirm the recipient name is <strong>{accountName}</strong>.</li>
            <li>Enter the exact amount <strong>{price}</strong> and confirm with your PIN.</li>
            <li>Copy the <strong>transaction ID</strong> from your confirmation SMS.</li>
          </ol>
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-sm font-semibold">3. Submit your payment details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Transaction ID / reference</Label>
            <Input id="reference" name="reference" required placeholder="e.g. QK72HD91LP" autoComplete="off" className="h-10 uppercase" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="senderPhone">Phone number you paid from</Label>
            <Input id="senderPhone" name="senderPhone" required inputMode="tel" placeholder="0712345678" className="h-10" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="senderName">Name registered on that number</Label>
          <Input id="senderName" name="senderName" required defaultValue={customerName} className="h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea id="note" name="note" maxLength={300} placeholder="Anything the admin should know" />
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={pending || !method} className="h-11 text-base">
          {pending ? 'Submitting...' : `Submit payment of ${price}`}
        </Button>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          Access is unlocked only after an administrator verifies your transaction with the mobile
          money provider. Screenshots alone are never accepted as proof of payment.
        </p>
      </div>
    </form>
  )
}
