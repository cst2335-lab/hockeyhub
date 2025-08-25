'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Bell, 
  Heart, 
  CheckCircle, 
  Trophy,
  Calendar,
  Clock,
  Trash2,
  BellOff
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_game_id?: string;
  related_user_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  game?: {
    title: string;
    game_date: string;
  };
  related_user?: {
    full_name: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
    markAsRead();
  }, [filter]);

  async function loadNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Load related data for each notification
      const enrichedNotifications = await Promise.all(
        (data || []).map(async (notif) => {
          const enriched = { ...notif };

          // Load related game info
          if (notif.related_game_id) {
            const { data: gameData } = await supabase
              .from('game_invitations')
              .select('title, game_date')
              .eq('id', notif.related_game_id)
              .single();
            
            if (gameData) {
              enriched.game = gameData;
            }
          }

          // Load related user info
          if (notif.related_user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', notif.related_user_id)
              .single();
            
            if (userData) {
              enriched.related_user = userData;
            }
          }

          return enriched;
        })
      );

      setNotifications(enrichedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark all unread notifications as read
      await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  async function deleteNotification(id: string) {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async function clearAll() {
    if (!confirm('Clear all notifications?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'game_interest':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'game_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'game_invite':
        return <Trophy className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes} min ago` : 'Just now';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-2 text-gray-600">
                {unreadCount > 0 
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
                filter === 'all'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
                filter === 'unread'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition ${
                  !notification.is_read ? 'border-blue-200 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    {/* Related Game Link */}
                    {notification.game && notification.related_game_id && (
                      <Link
                        href={`/games/${notification.related_game_id}`}
                        className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Trophy className="h-4 w-4 mr-1" />
                        {notification.game.title}
                        <span className="ml-2 text-gray-500">
                          • {new Date(notification.game.game_date).toLocaleDateString()}
                        </span>
                      </Link>
                    )}
                    
                    {/* Related User */}
                    {notification.related_user && (
                      <p className="text-sm text-gray-500 mt-2">
                        From: {notification.related_user.full_name}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <BellOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'You\'re all caught up!'
                : 'When someone interacts with your games, you\'ll see it here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}