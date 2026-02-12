'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function ClubsPage() {
  const t = useTranslations('clubs')
  const pathname = usePathname()
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname])
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/')

  const { data: clubs = [], isLoading: loading, isError } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('clubs').select('*').order('name')
      if (error) throw error
      return (data as Record<string, unknown>[]) || []
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary"
          aria-hidden
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{t('loadError')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link
          href={withLocale('/clubs/new')}
          className="bg-gogo-primary text-white px-4 py-2 rounded-lg hover:bg-gogo-dark transition"
        >
          {t('registerClub')}
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">{t('noClubs')}</p>
          <Link
            href={withLocale('/clubs/new')}
            className="text-gogo-primary hover:text-gogo-dark"
          >
            {t('beFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club: Record<string, unknown>) => (
            <div key={String(club.id)} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{String(club.name ?? '')}</h2>
                {club.verified && (
                  <span className="bg-gogo-secondary/20 text-gogo-primary px-2 py-1 rounded text-xs">
                    {t('verified')}
                  </span>
                )}
              </div>

              {club.description && (
                <p className="text-gray-600 mb-3 text-sm">{String(club.description)}</p>
              )}

              {club.contact_email && (
                <p className="text-gray-600 text-sm mb-1">📧 {String(club.contact_email)}</p>
              )}

              {club.contact_phone && (
                <p className="text-gray-600 text-sm mb-1">📞 {String(club.contact_phone)}</p>
              )}

              {club.home_rink && (
                <p className="text-gray-600 text-sm mb-1">🏒 Home: {String(club.home_rink)}</p>
              )}

              {club.age_groups && typeof club.age_groups === 'string' && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {club.age_groups.split(',').map((ageGroup: string) => (
                    <span
                      key={ageGroup}
                      className="bg-gogo-secondary/20 text-gogo-primary px-2 py-1 rounded text-xs"
                    >
                      {ageGroup.trim()}
                    </span>
                  ))}
                </div>
              )}

              {club.website && (
                <a
                  href={String(club.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-gogo-primary hover:text-gogo-dark text-sm"
                >
                  {t('visitWebsite')} →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
