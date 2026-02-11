//app/[locale]/(dashboard)/manage-rink/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
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

  // 初始化：要求登录；加载当前用户的 rink（仅 verified 管理员）
  useEffect(() => {
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
        }
      } finally {
        setLoadingPage(false);
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

      toast.success('Rink information updated successfully!');
    } catch (err) {
      console.error('update rink error:', err);
      toast.error('Failed to update rink. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!myRink) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Rink Manager Portal</h1>
          <div className="bg-yellow-50 p-4 rounded">
            <p>You are not registered as a rink manager.</p>
            <div className="mt-3 flex gap-3">
              <Link
                href={withLocale('/login')}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Sign in
              </Link>
              {/* 如果后续有申请页面，把链接换成对应路径 */}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => toast.info('Coming soon: manager application flow')}
              >
                Apply to Manage a Rink
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
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Manage: {myRink.name}</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData((s) => ({ ...s, hourly_rate: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., 180"
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Online Booking URL</label>
            <input
              type="url"
              value={formData.booking_url}
              onChange={(e) =>
                setFormData((s) => ({ ...s, booking_url: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Amenities (comma separated)
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) =>
                setFormData((s) => ({ ...s, amenities: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="Skate sharpening, Pro shop, Snack bar"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Peak Hours</label>
            <input
              type="text"
              value={formData.peak_hours}
              onChange={(e) =>
                setFormData((s) => ({ ...s, peak_hours: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="Weekdays 6-9pm, Weekends all day"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Special Notes</label>
            <textarea
              value={formData.special_notes}
              onChange={(e) =>
                setFormData((s) => ({ ...s, special_notes: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Any special information for users..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Rink Information'}
          </button>
        </form>
      </div>
    </div>
  );
}
