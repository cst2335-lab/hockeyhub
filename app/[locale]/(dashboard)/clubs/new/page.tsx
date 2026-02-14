'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewClubPage() {
  const t = useTranslations('clubs')
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
    <div className="min-h-screen bg-background">
      {/* In-page back link - dashboard layout provides main nav */}
      <div className="container mx-auto px-4 pt-4">
        <Link href={withLocale('/clubs')} className="text-gogo-primary hover:text-gogo-dark dark:hover:text-sky-300 text-sm font-medium">
          {t('backToClubs')}
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-foreground">{t('registerClub')}</h1>
        
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Club Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('clubName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
                placeholder="Ottawa Knights Hockey Club"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
                rows={3}
                placeholder="Tell us about your club..."
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('contactEmail')} *
              </label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
                placeholder="info@clubname.com"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('contactPhone')}
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
                placeholder="(613) 555-0100"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('website')}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
                placeholder="https://www.clubname.com"
              />
            </div>

            {/* Founded Year */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('foundedYear')}
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founded_year}
                onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              />
            </div>

            {/* Home Rink */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('homeRink')}
              </label>
              <input
                type="text"
                value={formData.home_rink}
                onChange={(e) => setFormData({ ...formData, home_rink: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
                placeholder="Bell Sensplex"
              />
            </div>

            {/* Age Groups */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('ageGroups')}
              </label>
              <div className="flex flex-wrap gap-2">
                {ageGroups.map((ageGroup) => (
                  <button
                    key={ageGroup}
                    type="button"
                    onClick={() => handleAgeGroupToggle(ageGroup)}
                    className={`px-3 py-1 rounded-lg border transition ${
                      formData.age_groups.includes(ageGroup)
                        ? 'bg-gogo-primary text-white border-gogo-primary'
                        : 'bg-background text-foreground border-input hover:bg-muted'
                    }`}
                  >
                    {ageGroup}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`text-sm p-3 rounded-lg ${
                message.includes('Error') || message.includes('login')
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gogo-primary text-white py-2 px-4 rounded-lg hover:bg-gogo-dark disabled:opacity-50 transition"
              >
                {loading ? t('creating') : t('registerClub')}
              </button>
              <button
                type="button"
                onClick={() => router.push(withLocale('/clubs'))}
                className="flex-1 bg-muted text-foreground py-2 px-4 rounded-lg hover:bg-muted/80 transition"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}