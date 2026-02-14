'use client';

import {useCallback, useEffect, useMemo} from 'react';
import {Bell, Check, CheckCheck, Trash2, ExternalLink} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {formatDateTimeByLocale} from '@/lib/utils/format';
import {useNotifications} from '@/lib/hooks';
import {useTranslations} from 'next-intl';

export default function NotificationsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('notifications');

  const locale = useMemo(() => (pathname?.split('/')?.[1] || 'en').trim(), [pathname]);
  const withLocale = useCallback((p: string) => `/${locale || ''}${p}`.replace('//', '/'), [locale]);

  const {
    notifications,
    isLoading: loading,
    unreadCount,
    user,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    if (!loading && !user) {
      router.push(withLocale('/login'));
    }
  }, [loading, user, router, withLocale]);

  const localizeLink = (href: string) => {
    if (!href) return href;
    if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:)/i.test(href)) return href;
    if (href.startsWith(`/${locale}/`)) return href;
    return withLocale(href.startsWith('/') ? href : `/${href}`);
  };

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
        return 'bg-gogo-secondary/20 text-gogo-primary';
      case 'interest_accepted':
        return 'bg-green-100 text-green-800';
      case 'game_cancelled':
        return 'bg-red-100 text-red-800';
      case 'game_updated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-gogo-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('unreadCount', { count: unreadCount })}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark"
          >
            <CheckCheck className="h-4 w-4" />
            {t('markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('noNotifications')}</h2>
          <p className="text-muted-foreground">
            When someone shows interest in your games or accepts your requests, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const href = notification.link ? localizeLink(notification.link) : null;
            return (
              <div
                key={notification.id}
                className={`bg-card border border-border rounded-xl shadow-sm p-4 transition-all ${
                  !notification.is_read ? 'border-l-4 border-gogo-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!notification.is_read && (
                        <span className="px-2 py-1 bg-gogo-primary text-white text-xs rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-foreground mb-1">{notification.title}</h3>

                    <p className="text-muted-foreground mb-2">{notification.message}</p>

                    <div className="flex items-center gap-4">
                      {href && (
                        <Link
                          href={href}
                          className="text-sm text-gogo-primary hover:text-gogo-dark flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Details
                        </Link>
                      )}

                      <span className="text-xs text-muted-foreground">
                        {formatDateTimeByLocale(notification.created_at, locale)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-muted-foreground hover:text-gogo-primary hover:bg-gogo-primary/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title={t('deleteTitle')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
