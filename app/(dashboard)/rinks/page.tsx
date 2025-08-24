'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RinksPage() {
  const [rinks, setRinks] = useState<any[]>([])
  const [filteredRinks, setFilteredRinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Filter states
  const [priceRange, setPriceRange] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('price-asc')

  useEffect(() => {
    fetchRinks()
  }, [])

  useEffect(() => {
    filterAndSortRinks()
  }, [rinks, priceRange, searchTerm, sortBy])

  const fetchRinks = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rinks')
      .select('*')
      .order('hourly_rate', { ascending: true })
    
    if (!error && data) {
      setRinks(data)
      setFilteredRinks(data)
    }
    setLoading(false)
  }

  const filterAndSortRinks = () => {
    let filtered = [...rinks]
    
    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(rink => {
        if (max) {
          return rink.hourly_rate >= min && rink.hourly_rate <= max
        } else {
          return rink.hourly_rate >= min
        }
      })
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rink => 
        rink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rink.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'price-asc':
          return a.hourly_rate - b.hourly_rate
        case 'price-desc':
          return b.hourly_rate - a.hourly_rate
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    setFilteredRinks(filtered)
  }

  const getPriceCategory = (price: number) => {
    if (price >= 400) return { label: 'Premium', color: 'bg-purple-100 text-purple-800' }
    if (price >= 250) return { label: 'High-End', color: 'bg-red-100 text-red-800' }
    if (price >= 180) return { label: 'Standard', color: 'bg-blue-100 text-blue-800' }
    return { label: 'Budget', color: 'bg-green-100 text-green-800' }
  }

  // 生成 Google Maps URL
  const getMapUrl = (rink: any) => {
    const query = rink.address 
      ? `${rink.address}, Ottawa, ON, Canada`
      : `${rink.name} ice rink Ottawa`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  // 格式化电话号码
  const formatPhone = (phone: string) => {
    if (phone.includes('(')) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ottawa Ice Rinks</h1>
        <p className="text-gray-600">{filteredRinks.length} rinks available</p>
      </div>
      
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Rink name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Price Range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="0-150">Budget ($140-150/hr)</option>
              <option value="151-180">Economy ($151-180/hr)</option>
              <option value="181-250">Standard ($181-250/hr)</option>
              <option value="251-350">Premium ($251-350/hr)</option>
              <option value="351-9999">Luxury ($350+/hr)</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-end">
            <div className="w-full p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600">Avg Price</div>
              <div className="text-xl font-bold text-blue-600">
                ${Math.round(rinks.reduce((acc, r) => acc + r.hourly_rate, 0) / rinks.length)}/hr
              </div>
            </div>
          </div>
        </div>
        
        {/* Price Categories Legend */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="text-sm text-gray-600">Categories:</span>
          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Budget (&lt;$180)</span>
          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Standard ($180-250)</span>
          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">High-End ($250-400)</span>
          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">Premium ($400+)</span>
        </div>
      </div>
      
      {/* Rinks Grid */}
      {filteredRinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No rinks found matching your criteria.</p>
          <button
            onClick={() => {
              setPriceRange('all')
              setSearchTerm('')
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRinks.map((rink) => {
            const category = getPriceCategory(rink.hourly_rate)
            return (
              <div key={rink.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold flex-1">{rink.name}</h2>
                    <span className={`px-2 py-1 rounded text-xs ml-2 whitespace-nowrap ${category.color}`}>
                      {category.label}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 flex items-start">
                    <span className="mr-1">📍</span>
                    <span>{rink.address || 'Ottawa, ON'}</span>
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-blue-600">
                        ${rink.hourly_rate}
                      </span>
                      <span className="text-gray-600">/hour</span>
                    </div>
                    {rink.phone && (
                      <a 
                        href={`tel:${rink.phone}`}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        📞 {formatPhone(rink.phone)}
                      </a>
                    )}
                  </div>
                  
                  {rink.amenities && rink.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {rink.amenities.slice(0, 3).map((amenity: string, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {amenity.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      ))}
                      {rink.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{rink.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* Primary CTA - Book Now */}
                    <button
                      onClick={() => router.push(`/book/${rink.id}`)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      Book Now
                    </button>
                    
                    {/* Map Button */}
                    <button
                      onClick={() => window.open(getMapUrl(rink), '_blank')}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                      title="View on Google Maps"
                    >
                      <span>📍</span>
                      <span className="hidden sm:inline">Map</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            ${Math.min(...rinks.map(r => r.hourly_rate))}
          </div>
          <div className="text-sm text-gray-600">Lowest Price</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-red-600">
            ${Math.max(...rinks.map(r => r.hourly_rate))}
          </div>
          <div className="text-sm text-gray-600">Highest Price</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">
            {rinks.filter(r => r.hourly_rate < 200).length}
          </div>
          <div className="text-sm text-gray-600">Budget Options</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {rinks.filter(r => r.hourly_rate >= 250).length}
          </div>
          <div className="text-sm text-gray-600">Premium Rinks</div>
        </div>
      </div>
    </div>
  )
}