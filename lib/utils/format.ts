/**
 * Formatting helpers for currency and date.
 * Keep them pure and SSR-safe.
 */

export function formatCurrency(
  value: number | string | null | undefined,
  currency = 'CAD'
) {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : 0
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(num)
}

export function formatDate(input: string | Date) {
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return String(input)
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
