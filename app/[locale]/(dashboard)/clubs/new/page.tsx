'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewClubPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useMemo(() => (pathname?.split('/')?.[1] || 'en').trim(), [pathname])
  const withLocale = useCallback((p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/'), [locale])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    founded_year: new Date().getFullYear().toString(),
    home_rink: '',
    age_groups: [] as string[],
  })

  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18']

  const handleAgeGroupToggle = (ageGroup: string) => {
    setFormData(prev => ({
      ...prev,
      age_groups: prev.age_groups.includes(ageGroup)
        ? prev.age_groups.filter(ag => ag !== ageGroup)
        : [...prev.age_groups, ageGroup]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('Please login to create a club')
        setLoading(false)
        return
      }

      // Create club
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          ...formData,
          manager_id: user.id,
          verified: false,
          age_groups: formData.age_groups.join(',')
        })
        .select()
        .single()

      if (error) {
        setMessage('Error creating club: ' + error.message)
      } else {
        setMessage('Club created successfully!')
        setTimeout(() => {
          router.push(withLocale('/clubs'))
        }, 1500)
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* In-page back link - dashboard layout provides main nav */}
      <div className="container mx-auto px-4 pt-4">
        <Link href={withLocale('/clubs')} className="text-gogo-primary hover:text-gogo-dark text-sm font-medium">
          ← Back to Clubs
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Register Your Club</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Club Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ottawa Knights Hockey Club"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Tell us about your club..."
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="info@clubname.com"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="(613) 555-0100"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://www.clubname.com"
              />
            </div>

            {/* Founded Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Founded Year
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founded_year}
                onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Home Rink */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Rink
              </label>
              <input
                type="text"
                value={formData.home_rink}
                onChange={(e) => setFormData({ ...formData, home_rink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Bell Sensplex"
              />
            </div>

            {/* Age Groups */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Groups
              </label>
              <div className="flex flex-wrap gap-2">
                {ageGroups.map((ageGroup) => (
                  <button
                    key={ageGroup}
                    type="button"
                    onClick={() => handleAgeGroupToggle(ageGroup)}
                    className={`px-3 py-1 rounded-md border ${
                      formData.age_groups.includes(ageGroup)
                        ? 'bg-gogo-primary text-white border-gogo-primary'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {ageGroup}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`text-sm p-3 rounded ${
                message.includes('Error') || message.includes('login')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gogo-primary text-white py-2 px-4 rounded-md hover:bg-gogo-dark disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Register Club'}
              </button>
              <button
                type="button"
                onClick={() => router.push(withLocale('/clubs'))}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}