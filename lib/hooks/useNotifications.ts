'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

async function fetchNotifications(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, message, link, related_id, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export function useNotifications() {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(supabase, user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'mark_read', notificationId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to mark notification as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to mark all notifications as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'delete', notificationId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete notification');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const isLoadingCombined = authLoading || isLoading;

  return {
    notifications,
    isLoading: isLoadingCombined,
    unreadCount,
    user,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
}
