'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type Rink = {
  id: string
  name: string
  address: string
  city: string | null
  phone: string | null
  hourly_rate: number | string | null
  amenities: string[] | null
  booking_url: string | null
}

type PriceBand = 'all' | 'budget' | 'standard' | 'premium'

const PAGE_SIZE = 20

export default function RinksPage() {
  const t = useTranslations('rinks')
  const tActions = useTranslations('actions')
  const tCommon = useTranslations('common')

  const { data: rinks = [], isLoading: loading } = useQuery({
    queryKey: ['rinks'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('rinks')
        .select('id, name, address, city, phone, hourly_rate, amenities, booking_url')
        .order('name', { ascending: true })
      if (error) throw error
      return (data as Rink[]) || []
    },
  })

  // UI state
  const [query, setQuery] = useState('')
  const [price, setPrice] = useState<PriceBand>('all')
  const [sort, setSort] = useState<'name' | 'price'>('name')
  const [city, setCity] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const pathname = usePathname()
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname])
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/')

  // Distinct cities for the filter
  const cities = useMemo(() => {
    const set = new Set<string>()
    rinks.forEach((r) => r.city && set.add(r.city))
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rinks])

  // Helpers
  const toNum = (v: number | string | null) =>
    typeof v === 'number' ? v : typeof v === 'string' ? Number.parseFloat(v) : Number.NaN

  const band = (rate: number) => {
    if (Number.isNaN(rate)) return null
    if (rate < 170) return t('bandBudget')
    if (rate <= 220) return t('bandStandard')
    return t('bandPremium')
  }

  // Apply search / filters / sorting
  const filtered = useMemo(() => {
    let list = [...rinks]

    // search by name/address/city/phone
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((r) =>
        [r.name, r.address, r.city, r.phone].some((f) => (f ?? '').toLowerCase().includes(q))
      )
    }

    // city
    if (city !== 'all') {
      list = list.filter((r) => (r.city ?? '').toLowerCase() === city.toLowerCase())
    }

    // price band
    if (price !== 'all') {
      list = list.filter((r) => {
        const n = toNum(r.hourly_rate)
        if (Number.isNaN(n)) return false
        if (price === 'budget') return n < 170
        if (price === 'standard') return n >= 170 && n <= 220
        return n > 220 // premium
      })
    }

    // sort
    if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      list.sort((a, b) => (toNum(a.hourly_rate) || 1e9) - (toNum(b.hourly_rate) || 1e9))
    }

    return list
  }, [rinks, query, price, sort, city])

  // Quick Stats computed from the filtered list
  const stats = useMemo(() => {
    if (filtered.length === 0) {
      return { count: 0, avg: null as number | null, min: null as number | null, max: null as number | null }
    }
    const numbers = filtered
      .map((r) => toNum(r.hourly_rate))
      .filter((n) => Number.isFinite(n)) as number[]
    if (numbers.length === 0) return { count: filtered.length, avg: null, min: null, max: null }
    const sum = numbers.reduce((s, n) => s + n, 0)
    const avg = Math.round(sum / numbers.length)
    const min = Math.min(...numbers)
    const max = Math.max(...numbers)
    return { count: filtered.length, avg, min, max }
  }, [filtered])

  useEffect(() => setCurrentPage(1), [query, price, sort, city])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedRinks = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-2">{t('title')}</h1>
      <p className="text-gray-600 mb-6">{t('available', { count: filtered.length })}</p>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">⌕</span>
          </div>
        </div>

        <select
          value={price}
          onChange={(e) => setPrice(e.target.value as PriceBand)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">{t('allPrices')}</option>
          <option value="budget">{t('budget')}</option>
          <option value="standard">{t('standard')}</option>
          <option value="premium">{t('premium')}</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'name' | 'price')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="name">{t('sortByName')}</option>
          <option value="price">{t('sortByPrice')}</option>
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md md:col-span-1"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? t('allCities') : c}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setQuery('')
            setPrice('all')
            setSort('name')
            setCity('all')
            setCurrentPage(1)
          }}
          className="w-full px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 md:col-span-1"
        >
          {t('clearFilters')}
        </button>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">{t('noMatch')}</p>
        </div>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedRinks.map((r) => {
            const rateNum = toNum(r.hourly_rate)
            const tag = band(rateNum)
            return (
              <div key={r.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-slate-200 hover:border-gogo-secondary transition-colors">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{r.name}</h3>
                  {tag && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      {tag}
                    </span>
                  )}
                </div>

                <div className="text-gray-600 space-y-1">
                  <div>📍 {r.address}</div>
                  {r.phone && <div>📞 {r.phone}</div>}
                  <div>💲 {Number.isNaN(rateNum) ? 'N/A' : `${formatCurrency(rateNum)}/hour`}</div>
                  {r.amenities && r.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {r.amenities.slice(0, 6).map((a) => (
                        <span
                          key={a}
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {/* Book Now → internal booking page (locale-aware) */}
                  <Link
                    href={withLocale(`/book/${r.id}`)}
                    className="col-span-1 text-center px-3 py-2 rounded bg-gogo-primary text-white hover:bg-gogo-dark transition-colors"
                  >
                    {tActions('bookNow')}
                  </Link>

                  {/* Map → open Google Maps place */}
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(r.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center px-3 py-2 rounded border hover:bg-gray-50"
                  >
                    Map
                  </a>

                  {/* Go → open Google Maps navigation directly */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${r.name} ${r.address} ${r.city ?? ''}`
                    )}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-center px-3 py-2 rounded border hover:bg-gray-50"
                  >
                    Go
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gogo-secondary/10 hover:border-gogo-primary hover:text-gogo-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {t('prevPage')}
            </button>
            <span className="text-sm text-gray-600">
              {t('pageOf', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gogo-secondary/10 hover:border-gogo-primary hover:text-gogo-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {t('nextPage')}
            </button>
          </div>
        )}
        </>
      )}

      {/* Quick Stats (based on filtered list) */}
      <div className="mt-10 p-6 bg-gogo-secondary/10 rounded-xl flex flex-wrap items-center justify-around">
        <div className="text-center">
          <h3 className="font-bold text-lg text-gogo-dark">{t('quickStats')}</h3>
          <p className="text-gogo-primary">{t('totalRinks')}: {stats.count}</p>
        </div>
        <div className="text-center">
          <p className="text-gogo-primary">
            {t('avgPrice')}:{' '}
            {stats.avg !== null ? `${formatCurrency(stats.avg)}/hr` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gogo-primary">
            {t('lowestPrice')}:{' '}
            {stats.min !== null ? `${formatCurrency(stats.min)}/hr` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gogo-primary">
            {t('highestPrice')}:{' '}
            {stats.max !== null ? `${formatCurrency(stats.max)}/hr` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
