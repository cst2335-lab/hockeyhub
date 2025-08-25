'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, Clock, DollarSign, Search, Filter, Navigation } from 'lucide-react';

interface Rink {
  id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
  hourly_rate?: number;
  amenities?: string[];
  source?: string;
  booking_url?: string;
}

export default function RinksPage() {
  const [rinks, setRinks] = useState<Rink[]>([]);
  const [filteredRinks, setFilteredRinks] = useState<Rink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchRinks();
  }, []);

  useEffect(() => {
    filterAndSortRinks();
  }, [rinks, searchTerm, priceFilter, sortBy]);

  async function fetchRinks() {
    try {
      const { data, error } = await supabase
        .from('rinks')
        .select('*')
        .order('name');

      if (error) throw error;
      setRinks(data || []);
    } catch (error) {
      console.error('Error fetching rinks:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortRinks() {
    let filtered = [...rinks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rink =>
        rink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rink.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rink.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(rink => {
        const rate = rink.hourly_rate || 0;
        switch (priceFilter) {
          case 'budget':
            return rate <= 200;
          case 'standard':
            return rate > 200 && rate <= 300;
          case 'premium':
            return rate > 300 && rate <= 400;
          case 'luxury':
            return rate > 400;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_low':
          return (a.hourly_rate || 0) - (b.hourly_rate || 0);
        case 'price_high':
          return (b.hourly_rate || 0) - (a.hourly_rate || 0);
        default:
          return 0;
      }
    });

    setFilteredRinks(filtered);
  }

  function formatPhone(phone: string) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  function getPriceCategory(rate: number) {
    if (rate <= 200) return { label: 'Budget', color: 'bg-green-100 text-green-800' };
    if (rate <= 300) return { label: 'Standard', color: 'bg-blue-100 text-blue-800' };
    if (rate <= 400) return { label: 'Premium', color: 'bg-purple-100 text-purple-800' };
    return { label: 'Luxury', color: 'bg-yellow-100 text-yellow-800' };
  }

  function openGoogleMaps(address: string, name: string) {
    const query = encodeURIComponent(`${name} ${address} Ottawa`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapUrl, '_blank');
  }

  function getDirections(address: string, name: string) {
    const destination = encodeURIComponent(`${name} ${address} Ottawa`);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(directionsUrl, '_blank');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ice Rinks in Ottawa</h1>
          <p className="mt-2 text-gray-600">{filteredRinks.length} rinks available</p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search rinks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget (&lt;=$200/hr)</option>
              <option value="standard">Standard ($201-300/hr)</option>
              <option value="premium">Premium ($301-400/hr)</option>
              <option value="luxury">Luxury (&gt;$400/hr)</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceFilter('all');
                setSortBy('name');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Rinks Grid */}
        {filteredRinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRinks.map((rink) => {
              const priceCategory = rink.hourly_rate ? getPriceCategory(rink.hourly_rate) : null;
              
              return (
                <div key={rink.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header with Price Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {rink.name}
                      </h3>
                      {priceCategory && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${priceCategory.color}`}>
                          {priceCategory.label}
                        </span>
                      )}
                    </div>

                    {/* Rink Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {rink.address && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{rink.address}</span>
                        </div>
                      )}
                      
                      {rink.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          <a 
                            href={`tel:${rink.phone}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {formatPhone(rink.phone)}
                          </a>
                        </div>
                      )}
                      
                      {rink.hourly_rate && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">${rink.hourly_rate}/hour</span>
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
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
                      <button
                        onClick={() => router.push(`/book/${rink.id}`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                      >
                        Book Now
                      </button>
                      
                      {/* Map Button */}
                      <button
                        onClick={() => openGoogleMaps(rink.address || '', rink.name)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                        title="View on Google Maps"
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="hidden sm:inline">Map</span>
                      </button>
                      
                      {/* Directions Button */}
                      <button
                        onClick={() => getDirections(rink.address || '', rink.name)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                        title="Get Directions"
                      >
                        <Navigation className="h-4 w-4" />
                        <span className="hidden sm:inline">Go</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rinks found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Total Rinks:</span> {rinks.length}
            </div>
            <div>
              <span className="font-medium">Average Price:</span> $
              {Math.round(rinks.reduce((sum, r) => sum + (r.hourly_rate || 0), 0) / rinks.length)}
              /hr
            </div>
            <div>
              <span className="font-medium">Lowest Price:</span> $
              {Math.min(...rinks.map(r => r.hourly_rate || 999))}
              /hr
            </div>
            <div>
              <span className="font-medium">Highest Price:</span> $
              {Math.max(...rinks.map(r => r.hourly_rate || 0))}
              /hr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}