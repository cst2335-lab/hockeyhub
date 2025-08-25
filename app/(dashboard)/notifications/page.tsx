'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, Eye, Heart, Check, Trash2, Calendar, MapPin } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  game_id: string | null;
  from_user_id: string | null;
  from_user_email: string | null;
  is_read: boolean;
  created_at: string;
  game?: {
    title: string;
    game_date: string;
    game_time: string;
    location: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
    
    // 设置实时订阅
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${getCurrentUserId()}`
      }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  }

  async function loadNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 加载通知和相关游戏信息
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          game:game_invitations(
            title,
            game_date,
            game_time,
            location
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (!error) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  function handleNotificationClick(notification: Notification) {
    // 标记为已读
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // 跳转到相关游戏
    if (notification.game_id) {
      router.push(`/games/${notification.game_id}`);
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  function getIcon(type: string) {
    switch (type) {
      case 'game_interest':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'game_matched':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-2">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filter Tabs and Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 px-1 border-b-2 transition ${
                filter === 'all' 
                  ? 'border-blue-600 text-blue-600 font-medium' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2 px-1 border-b-2 transition ${
                filter === 'unread' 
                  ? 'border-blue-600 text-blue-600 font-medium' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-4 transition hover:shadow-md cursor-pointer ${
                  !notification.is_read ? 'border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      {/* 游戏信息 */}
                      {notification.game && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium text-gray-700">
                            {notification.game.title}
                          </div>
                          <div className="flex items-center space-x-3 text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(notification.game.game_date).toLocaleDateString()}
                            </span>
                            {notification.game.location && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {notification.game.location}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* 联系信息（如果有） */}
                      {notification.from_user_email && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">From: </span>
                          <a 
                            href={`mailto:${notification.from_user_email}`}
                            className="text-sm text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {notification.from_user_email}
                          </a>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              When someone interacts with your games, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}