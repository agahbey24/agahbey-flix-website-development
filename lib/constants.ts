export const MOVIE_PRICE = 500
export const SEASON_PRICE = 1000

export const GENRES = [
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Romance',
  'Thriller',
] as const

export const PAYMENT_METHODS = [
  { id: 'mixx', name: 'Mixx by Yas', settingKey: 'pay_mixx', color: '#facc15' },
  { id: 'mpesa', name: 'M-Pesa', settingKey: 'pay_mpesa', color: '#16a34a' },
  { id: 'airtel', name: 'Airtel Money', settingKey: 'pay_airtel', color: '#ef4444' },
  { id: 'halopesa', name: 'HaloPesa', settingKey: 'pay_halopesa', color: '#f97316' },
] as const

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id']

export function paymentMethodName(id: string) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.name ?? id
}

export function formatTsh(amount: number) {
  return `TSh ${amount.toLocaleString('en-US')}`
}

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
