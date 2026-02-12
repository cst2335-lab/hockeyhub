// components/notifications/notification-bell.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userData.user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, [supabase]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    loadUnreadCount();

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const ch = supabase
        .channel('notification-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userData.user.id}`,
          },
          loadUnreadCount
        )
        .subscribe();
      channelRef.current = ch;
    })();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, loadUnreadCount]);

  return (
    <Link 
      href="/notifications" 
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="View notifications"
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