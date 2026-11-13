import type { Metadata } from 'next'
import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { ProfileForm } from '@/components/account/profile-form'
import { ChangePasswordForm } from '@/components/auth/password-forms'
import { PaymentStatus } from '@/components/payment-status'
import { db } from '@/lib/db'
import { payments, seasons, titles, user } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'
import { formatTsh, paymentMethodName } from '@/lib/constants'
import { getUserGrants } from '@/lib/queries'

export const metadata: Metadata = { title: 'My Account' }

export default async function AccountPage() {
  const session = await requireUser('/account')
  const [profile] = await db.select({ phone: user.phone, createdAt: user.createdAt }).from(user).where(eq(user.id, session.user.id))
  const history = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      method: payments.method,
      reference: payments.reference,
      status: payments.status,
      adminNote: payments.adminNote,
      createdAt: payments.createdAt,
      title: titles.title,
      slug: titles.slug,
      seasonName: seasons.name,
    })
    .from(payments)
    .innerJoin(titles, eq(titles.id, payments.titleId))
    .leftJoin(seasons, eq(seasons.id, payments.seasonId))
    .where(eq(payments.userId, session.user.id))
    .orderBy(desc(payments.createdAt))
  const grants = await getUserGrants(session.user.id)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 md:px-8">
      <h1 className="font-display text-4xl tracking-wide md:text-5xl">My Account</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Titles unlocked" value={String(grants.length)} />
        <Stat label="Pending payments" value={String(history.filter((p) => p.status === 'pending').length)} />
        <Stat label="Member since" value={(profile?.createdAt ?? new Date()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />
      </div>

      <section className="mt-10 rounded-lg border border-white/10 bg-card p-5 md:p-6" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="mb-4 text-lg font-semibold">Profile</h2>
        <ProfileForm name={session.user.name} email={session.user.email} phone={profile?.phone ?? ''} />
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-card p-5 md:p-6" aria-labelledby="password-heading">
        <h2 id="password-heading" className="mb-4 text-lg font-semibold">Password</h2>
        <ChangePasswordForm />
      </section>

      <section className="mt-6" aria-labelledby="payments-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="payments-heading" className="text-lg font-semibold">Purchases & payments</h2>
          <Link href="/library" className="text-sm text-brand hover:underline">Open My Library</Link>
        </div>
        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-muted-foreground">
            No purchases yet. <Link href="/browse" className="text-brand hover:underline">Browse movies</Link>
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/5 overflow-hidden rounded-lg border border-white/10 bg-card">
            {history.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/title/${p.slug}`} className="font-medium hover:text-brand">
                    {p.title}{p.seasonName ? ` \u2014 ${p.seasonName}` : ''}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {`${paymentMethodName(p.method)} \u00B7 Ref ${p.reference} \u00B7 ${p.createdAt.toLocaleDateString('en-GB')}`}
                  </p>
                  {p.status === 'rejected' && p.adminNote && (
                    <p className="mt-1 text-xs text-destructive">{`Reason: ${p.adminNote}`}</p>
                  )}
                </div>
                <span className="text-sm font-semibold">{formatTsh(p.amount)}</span>
                <PaymentStatus status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl tracking-wide">{value}</p>
    </div>
  )
}
