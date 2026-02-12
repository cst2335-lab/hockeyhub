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
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
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
