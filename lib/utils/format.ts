/**
 * Formatting helpers for currency and date.
 * Keep them pure and SSR-safe.
 */

import { format as dfFormat, type Locale } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

const localeMap: Record<string, Locale> = { en: enUS, fr };

export function formatCurrency(
  value: number | string | null | undefined,
  currency = 'CAD',
  locale = 'en-CA'
) {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : 0
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num)
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

/** Locale 代码：'en' | 'fr'，用于 date-fns */
export type DateLocaleCode = 'en' | 'fr';

/**
 * 按 locale 格式化日期（仅日期）
 * @param input 日期字符串或 Date
 * @param localeCode 'en' | 'fr'
 */
export function formatDateByLocale(
  input: string | Date,
  localeCode: string = 'en'
): string {
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return String(input)
  const loc = localeMap[localeCode] ?? enUS
  return dfFormat(d, 'MMM d, yyyy', { locale: loc })
}

/**
 * 按 locale 格式化日期时间
 */
export function formatDateTimeByLocale(
  input: string | Date,
  localeCode: string = 'en'
): string {
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return String(input)
  const loc = localeMap[localeCode] ?? enUS
  return dfFormat(d, 'MMM d, yyyy h:mm a', { locale: loc })
}
