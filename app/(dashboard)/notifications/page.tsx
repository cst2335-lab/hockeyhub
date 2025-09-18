// app/(dashboard)/notifications/page.tsx
'use client';

/**
 * Notifications page
 * - Fetches notifications for the current user with lightweight pagination.
 * - Subscribes to realtime changes (only for the current user).
 * - Supports mark-as-read, mark-all-as-read, and delete with optimistic UI + rollback.
 * - Uses head:true + count:'exact' for total/unread counters to reduce payload.
 */

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);

  // Pagination + data
  const [page, setPage] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Derived counters
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const hasPrev = page > 0;
  const hasNext = (page + 1) * PAGE_SIZE < totalCount;

  // Load current user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('[notifications] getUser error:', error);
        return;
      }
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  // Fetch total count (head-only, cheaper)
  const fetchTotalCount = async (uid: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid);

    if (error) {
      console.error('[notifications] count error:', error);
      return;
    }
    setTotalCount(count ?? 0);
  };

  // Load one page of notifications
  const loadPage = async (uid: string, pageIndex: number) => {
    setLoading(true);
    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, message, link, related_id, is_read, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setNotifications(data ?? []);
    } catch (e) {
      console.error('[notifications] loadPage error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + subscribe to realtime changes (only current user)
  useEffect(() => {
    if (!userId) return;

    // First load
    fetchTotalCount(userId);
    loadPage(userId, page);

    // Realtime subscription
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`, // only my rows
        },
        () => {
          // On any change: refresh total & current page
          fetchTotalCount(userId);
          loadPage(userId, page);
        }
      )
      .subscribe();

    // Cleanup on unmount / userId change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, page]);

  // Handlers — optimistic update with rollback on failure
  async function markAsRead(id: string) {
    const prev = notifications;
    setNotifications(ns => ns.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) {
      console.error('[notifications] markAsRead error:', error);
      setNotifications(prev); // rollback
    }
  }

  async function markAllAsRead() {
    if (!userId) return;
    const prev = notifications;
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) {
      console.error('[notifications] markAllAsRead error:', error);
      setNotifications(prev); // rollback
    }
  }

  async function deleteNotification(id: string) {
    const prev = notifications;
    setNotifications(ns => ns.filter(n => n.id !== id));
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) {
      console.error('[notifications] delete error:', error);
      setNotifications(prev); // rollback
    } else {
      // Update total count and ensure pagination is consistent
      fetchTotalCount(userId!);
      if (notifications.length === 1 && page > 0) {
        // If we removed the last item on this page, go back one page
        setPage(p => Math.max(0, p - 1));
      }
    }
  }

  // Type → icon / color helpers
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game_interest':
        return '🏒';
      case 'interest_accepted':
        return '✅';
      case 'game_cancelled':
        return '❌';
      case 'game_updated':
        return '📝';
      default:
        return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'game_interest':
        return 'bg-blue-100 text-blue-800';
      case 'interest_accepted':
        return 'bg-green-100 text-green-800';
      case 'game_cancelled':
        return 'bg-red-100 text-red-800';
      case 'game_updated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {totalCount > 0 && (
              <p className="text-sm text-gray-600">
                You have {totalCount} notification{totalCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No notifications yet</h2>
          <p className="text-gray-500">
            When someone shows interest in your games or accepts your requests, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 transition-all ${
                !notification.is_read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeIcon(notification.type)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                      {notification.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {!notification.is_read && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">NEW</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>

                  <p className="text-gray-600 mb-2">{notification.message}</p>

                  <div className="flex items-center gap-4">
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Details
                      </Link>
                    )}

                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={!hasPrev}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
