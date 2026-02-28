//app/[locale]/(dashboard)/manage-rink/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Rink = {
  id: string;
  name: string;
  hourly_rate?: number | null;
  booking_url?: string | null;
  amenities?: string[] | null;
  custom_info?: { peak_hours?: string | null; special_notes?: string | null } | null;
};

type ManagerRow = {
  rinks: Rink;
};

export default function ManageRinkPage() {
  const t = useTranslations('manageRink');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const supabase = useMemo(() => createClient(), []);

  const withLocale = useCallback(
    (p: string) => `/${locale || ''}${p}`.replace('//', '/'),
    [locale]
  );

  const [myRink, setMyRink] = useState<Rink | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    hourly_rate: '',
    booking_url: '',
    amenities: '',
    peak_hours: '',
    special_notes: '',
  });

  // 初始化：要求登录；加载当前用户的 rink（仅 verified 管理员）；非管理员重定向到 dashboard
  useEffect(() => {
    let redirecting = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(withLocale('/login'));
          return;
        }

        const { data, error } = await supabase
          .from('rink_managers')
          .select('*, rinks(*)')
          .eq('user_id', user.id)
          .eq('verified', true)
          .maybeSingle<ManagerRow>();

        if (error) {
          console.error('fetch manager error:', error);
        }

        if (data?.rinks) {
          const r = data.rinks;
          setMyRink(r);
          setFormData({
            hourly_rate: r.hourly_rate != null ? String(r.hourly_rate) : '',
            booking_url: r.booking_url || '',
            amenities: Array.isArray(r.amenities) ? r.amenities.join(', ') : '',
            peak_hours: r.custom_info?.peak_hours || '',
            special_notes: r.custom_info?.special_notes || '',
          });
        } else {
          setMyRink(null);
          redirecting = true;
          router.replace(withLocale('/dashboard'));
          return;
        }
      } finally {
        if (!redirecting) setLoadingPage(false);
      }
    })();
  }, [router, supabase, withLocale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRink) return;

    setSaving(true);
    try {
      const res = await fetch('/api/rinks/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          rinkId: myRink.id,
          ...formData,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update rink');
      }

      toast.success(t('updateSuccess'));
    } catch (err) {
      console.error('update rink error:', err);
      toast.error(t('updateError'));
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  if (!myRink) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{t('portalTitle')}</h1>
          <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <p className="text-foreground">{t('notRegistered')}</p>
            <div className="mt-3 flex gap-3">
              <Link
                href={withLocale('/login')}
                className="bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition"
              >
                {tNav('login')}
              </Link>
              <button
                className="bg-gogo-primary text-white px-4 py-2 rounded hover:bg-gogo-dark"
                onClick={() => toast.info(t('comingSoonManager'))}
              >
                {t('applyToManage')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href={withLocale('/dashboard')} className="text-muted-foreground hover:text-foreground hover:underline">
            {t('backLink')}
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-foreground">{t('manageTitle', { name: myRink.name })}</h1>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-foreground">{t('hourlyRate')}</label>
            <input
              type="number"
              inputMode="decimal"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData((s) => ({ ...s, hourly_rate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              placeholder={t('placeholderRate')}
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('bookingUrl')}</label>
            <input
              type="url"
              value={formData.booking_url}
              onChange={(e) =>
                setFormData((s) => ({ ...s, booking_url: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              placeholder={t('placeholderUrl')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-foreground">{t('amenities')}</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) =>
                setFormData((s) => ({ ...s, amenities: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              placeholder={t('placeholderAmenities')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-foreground">{t('peakHours')}</label>
            <input
              type="text"
              value={formData.peak_hours}
              onChange={(e) =>
                setFormData((s) => ({ ...s, peak_hours: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              placeholder={t('placeholderPeak')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-foreground">{t('specialNotes')}</label>
            <textarea
              value={formData.special_notes}
              onChange={(e) =>
                setFormData((s) => ({ ...s, special_notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              rows={3}
              placeholder={t('placeholderNotes')}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gogo-primary text-white py-2 rounded hover:bg-gogo-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('saving') : t('submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
