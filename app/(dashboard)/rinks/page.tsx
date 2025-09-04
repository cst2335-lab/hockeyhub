'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type Rink = {
  id: string
  name: string
  address: string
  city: string | null
  hourly_rate: number | string | null
}

/**
 * Rinks list page
 * - Fix exhaustive-deps by wrapping handlers with useCallback.
 * - Use formatCurrency helper.
 */
export default function RinksPage() {
  const [rinks, setRinks] = useState<Rink[]>([])
  const [visibleRinks, setVisibleRinks] = useState<Rink[]>([])
  const [loading, setLoading] = useState(true)

  const [city, setCity] = useState<string>('all')
  const [sort, setSort] = useState<'name' | 'price'>('name')

  const fetchRinks = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rinks')
      .select('id, name, address, city, hourly_rate')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to load rinks:', error)
      setRinks([])
    } else {
      setRinks((data as Rink[]) || [])
    }
    setLoading(false)
  }, [])

  const filterAndSortRinks = useCallback(() => {
    let next = [...rinks]
    if (city !== 'all') {
      next = next.filter((r) => (r.city ?? '').toLowerCase() === city.toLowerCase())
    }
    if (sort === 'name') {
      next.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      const num = (v: number | string | null) =>
        typeof v === 'number'
          ? v
          : typeof v === 'string'
          ? Number.parseFloat(v)
          : Number.POSITIVE_INFINITY
      next.sort((a, b) => num(a.hourly_rate) - num(b.hourly_rate))
    }
    setVisibleRinks(next)
  }, [rinks, city, sort])

  useEffect(() => {
    fetchRinks()
  }, [fetchRinks])

  useEffect(() => {
    filterAndSortRinks()
  }, [filterAndSortRinks])

  const cities = useMemo(() => {
    const set = new Set<string>()
    rinks.forEach((r) => r.city && set.add(r.city))
    return ['all', ...Array.from(set)]
  }, [rinks])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Rinks</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Cities' : c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'name' | 'price')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="name">Name (A→Z)</option>
            <option value="price">Hourly Rate (Low→High)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setCity('all')
              setSort('name')
            }}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {visibleRinks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No rinks found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleRinks.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold">{r.name}</h3>
              <p className="text-gray-600">{r.address}</p>
              <p className="text-gray-600">{r.city}</p>
              <p className="text-gray-800 font-medium mt-1">
                {r.hourly_rate != null ? `${formatCurrency(r.hourly_rate)}/hour` : 'Rate N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
