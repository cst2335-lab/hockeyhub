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
      const parsedRate = Number(formData.hourly_rate);
      const hourly_rate =
        Number.isFinite(parsedRate) && parsedRate >= 0 ? parsedRate : null;

      const amenities =
        formData.amenities.trim() === ''
          ? []
          : formData.amenities.split(',').map((a) => a.trim()).filter(Boolean);

      const { error } = await supabase
        .from('rinks')
        .update({
          hourly_rate,
          booking_url: formData.booking_url || null,
          amenities,
          custom_info: {
            peak_hours: formData.peak_hours || null,
            special_notes: formData.special_notes || null,
          },
          source: 'manager_updated',
        })
        .eq('id', myRink.id);

      if (error) throw error;

      // 记录日志（若已登录）
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('rink_updates_log').insert({
          rink_id: myRink.id,
          updated_by: user.id,
          changes: formData,
          update_type: 'manager_update',
        });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  if (!myRink) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{t('portalTitle')}</h1>
          <div className="bg-yellow-50 p-4 rounded">
            <p>{t('notRegistered')}</p>
            <div className="mt-3 flex gap-3">
              <Link
                href={withLocale('/login')}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href={withLocale('/dashboard')} className="text-gray-600 hover:underline">
            {t('backLink')}
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">{t('manageTitle', { name: myRink.name })}</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('hourlyRate')}</label>
            <input
              type="number"
              inputMode="decimal"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData((s) => ({ ...s, hourly_rate: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
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
              className="w-full px-3 py-2 border rounded"
              placeholder={t('placeholderUrl')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('amenities')}</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) =>
                setFormData((s) => ({ ...s, amenities: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              placeholder={t('placeholderAmenities')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('peakHours')}</label>
            <input
              type="text"
              value={formData.peak_hours}
              onChange={(e) =>
                setFormData((s) => ({ ...s, peak_hours: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              placeholder={t('placeholderPeak')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">{t('specialNotes')}</label>
            <textarea
              value={formData.special_notes}
              onChange={(e) =>
                setFormData((s) => ({ ...s, special_notes: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
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
