'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { getSession } from '@/lib/session'

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^((\+?255|0)[67]\d{8})?$/, 'Enter a valid Tanzanian phone number.'),
})

export async function updateProfile(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Please sign in.' }
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid details.' }
  await db
    .update(user)
    .set({ name: parsed.data.name, phone: parsed.data.phone || null, updatedAt: new Date() })
    .where(eq(user.id, session.user.id))
  revalidatePath('/account')
  return { ok: true }
}
