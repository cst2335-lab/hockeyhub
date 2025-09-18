// components/notifications/notification-bell.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Cache user id to avoid calling auth.getUser() multiple times
  const [userId, setUserId] = useState<string | null>(null);

  // Load current user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  // Fetch unread count helper (HEAD-style for lower payload)
  async function loadUnreadCount(uid: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count ?? 0);
    } catch (e) {
      console.error('Error loading notification count:', e);
    }
  }

  // Subscribe to realtime changes with proper cleanup
  useEffect(() => {
    if (!userId) return;

    // Initial load
    loadUnreadCount(userId);

    // Subscribe to any changes for this user's notifications
    const channel = supabase
      .channel('notifications-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => loadUnreadCount(userId)
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <Link
      href="/notifications"
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="View notifications"
      aria-label="Notifications"
    >
      <Bell className="h-6 w-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
