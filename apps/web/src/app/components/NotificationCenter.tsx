import { useState, useEffect } from 'react';
import { Bell, Check, X, Archive, Filter, Trash2, Settings } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'comment' | 'system' | 'team';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  onNavigateToSettings: () => void;
}

export function NotificationCenter({ onNavigateToSettings }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Site Published',
      message: 'Your portfolio site has been published successfully.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      archived: false,
      actionUrl: '/preview',
    },
    {
      id: '2',
      type: 'comment',
      title: 'New Comment',
      message: 'Sarah left a comment on your homepage.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      archived: false,
      actionUrl: '/comments',
    },
    {
      id: '3',
      type: 'team',
      title: 'Team Invitation',
      message: 'John invited you to join the "Coffee Shop" project.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      archived: false,
      actionUrl: '/team',
    },
    {
      id: '4',
      type: 'warning',
      title: 'Domain Expiring',
      message: 'Your domain myportfolio.com expires in 7 days.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
      actionUrl: '/domain-wizard',
    },
    {
      id: '5',
      type: 'system',
      title: 'Backup Complete',
      message: 'Your site backup was completed successfully.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
    },
  ]);

  const [filter, setFilter] = useState<'all' | Notification['type']>('all');

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['success', 'info', 'comment', 'team'][Math.floor(Math.random() * 4)] as Notification['type'],
          title: 'New Activity',
          message: 'Something happened on your site.',
          timestamp: new Date(),
          read: false,
          archived: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);

        // Show desktop notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.png',
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  const filteredNotifications = notifications.filter((n) => {
    if (n.archived) return false;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-success bg-success/10';
      case 'error': return 'text-destructive bg-destructive/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'info': return 'text-secondary bg-secondary/10';
      case 'comment': return 'text-primary bg-primary/10';
      case 'team': return 'text-accent-foreground bg-accent';
      case 'system': return 'text-muted-foreground bg-muted';
    }
  };

  const formatTimestamp = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-accent rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-96 max-h-[600px] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateToSettings}
                    className="p-1 hover:bg-accent rounded"
                    aria-label="Notification settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-accent rounded"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {['all', 'success', 'comment', 'team', 'warning', 'system'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      filter === type
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border hover:bg-accent transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Indicator */}
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-accent rounded"
                            aria-label="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => archiveNotification(notification.id)}
                          className="p-1 hover:bg-accent rounded"
                          aria-label="Archive"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <button
                onClick={onNavigateToSettings}
                className="w-full text-sm text-center text-primary hover:underline"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
