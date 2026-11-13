'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { payments, seasons, titles } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { MOVIE_PRICE, PAYMENT_METHODS, SEASON_PRICE } from '@/lib/constants'
import { hasMovieAccess, hasSeasonAccess } from '@/lib/queries'

const schema = z.object({
  titleId: z.coerce.number().int().positive(),
  seasonId: z.coerce.number().int().min(0),
  method: z.enum(PAYMENT_METHODS.map((m) => m.id) as [string, ...string[]]),
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9.\-]{6,30}$/, 'Enter the transaction ID exactly as shown in your SMS (6-30 letters/numbers).'),
  senderPhone: z
    .string()
    .trim()
    .regex(/^(\+?255|0)[67]\d{8}$/, 'Enter a valid Tanzanian phone number, e.g. 0712345678.'),
  senderName: z.string().trim().min(2, 'Enter the name registered on the paying number.').max(80),
  note: z.string().trim().max(300).optional(),
})

export type PaymentState = { error?: string; success?: boolean }

export async function submitPayment(_prev: PaymentState, formData: FormData): Promise<PaymentState> {
  const session = await getSession()
  if (!session) return { error: 'Please sign in to continue.' }

  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid details.' }
  const data = parsed.data
  const userId = session.user.id

  const [title] = await db.select().from(titles).where(eq(titles.id, data.titleId)).limit(1)
  if (!title || !title.published) return { error: 'This title is no longer available.' }

  let amount: number
  if (title.type === 'series') {
    if (data.seasonId === 0) return { error: 'Please choose a season to purchase.' }
    const [season] = await db
      .select()
      .from(seasons)
      .where(and(eq(seasons.id, data.seasonId), eq(seasons.titleId, title.id)))
      .limit(1)
    if (!season) return { error: 'Season not found.' }
    if (await hasSeasonAccess(userId, title.id, season.id)) return { error: 'You already own this season.' }
    amount = SEASON_PRICE
  } else {
    if (data.seasonId !== 0) return { error: 'Invalid purchase.' }
    if (await hasMovieAccess(userId, title.id)) return { error: 'You already own this movie.' }
    amount = MOVIE_PRICE
  }

  const [existingPending] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(
      and(
        eq(payments.userId, userId),
        eq(payments.titleId, title.id),
        eq(payments.seasonId, data.seasonId),
        eq(payments.status, 'pending'),
      ),
    )
    .limit(1)
  if (existingPending) return { error: 'You already have a payment awaiting verification for this item.' }

  try {
    await db.insert(payments).values({
      userId,
      titleId: title.id,
      seasonId: data.seasonId,
      amount,
      method: data.method,
      reference: data.reference,
      senderPhone: data.senderPhone,
      senderName: data.senderName,
      note: data.note || null,
    })
  } catch (error) {
    if (String((error as { code?: string })?.code) === '23505') {
      return { error: 'This transaction reference has already been submitted.' }
    }
    console.error('Payment submit failed:', error)
    return { error: 'Could not submit your payment. Please try again.' }
  }

  revalidatePath(`/title/${title.slug}`)
  revalidatePath('/account')
  revalidatePath('/admin')
  return { success: true }
}
