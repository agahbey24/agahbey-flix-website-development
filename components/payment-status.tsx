import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  pending: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
}

export function PaymentStatus({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize', styles[status] ?? 'bg-muted')}>
      {status}
    </span>
  )
}
