'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

export default function RinksPage() {
  const [rinks, setRinks] = useState<Rink[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [query, setQuery] = useState('')
  const [price, setPrice] = useState<PriceBand>('all')
  const [sort, setSort] = useState<'name' | 'price'>('name')
  const [city, setCity] = useState<string>('all')

  // Load rinks (wrapped with useCallback for stable deps)
  const fetchRinks = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rinks')
      .select('id, name, address, city, phone, hourly_rate, amenities, booking_url')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to load rinks:', error)
      setRinks([])
    } else {
      setRinks((data as Rink[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRinks()
  }, [fetchRinks])

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
    if (rate < 170) return 'Budget'
    if (rate <= 220) return 'Standard'
    return 'Premium'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-2">Ice Rinks in Ottawa</h1>
      <p className="text-gray-600 mb-6">{filtered.length} rinks available</p>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rinks..."
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
          <option value="all">All Prices</option>
          <option value="budget">Budget (&lt; $170)</option>
          <option value="standard">Standard ($170–$220)</option>
          <option value="premium">Premium (&gt; $220)</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'name' | 'price')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Price: Low → High</option>
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md md:col-span-1"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Cities' : c}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setQuery('')
            setPrice('all')
            setSort('name')
            setCity('all')
          }}
          className="w-full px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 md:col-span-1"
        >
          Clear Filters
        </button>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No rinks match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const rateNum = toNum(r.hourly_rate)
            const tag = band(rateNum)
            return (
              <div key={r.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
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
                  {/* Book Now → internal booking page */}
                  <Link
                    href={`/book/${r.id}`}
                    className="col-span-1 text-center px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Book Now
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
      )}

      {/* Quick Stats (based on filtered list) */}
      <div className="mt-10 p-6 bg-blue-50 rounded-xl flex flex-wrap items-center justify-around">
        <div className="text-center">
          <h3 className="font-bold text-lg text-blue-900">Quick Stats</h3>
          <p className="text-blue-800">Total Rinks: {stats.count}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-800">
            Average Price:{' '}
            {stats.avg !== null ? `${formatCurrency(stats.avg)}/hr` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-blue-800">
            Lowest Price:{' '}
            {stats.min !== null ? `${formatCurrency(stats.min)}/hr` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-blue-800">
            Highest Price:{' '}
            {stats.max !== null ? `${formatCurrency(stats.max)}/hr` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
