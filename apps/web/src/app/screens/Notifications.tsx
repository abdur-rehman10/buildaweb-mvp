import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { NotificationPreferences } from '../components/NotificationPreferences';
import { PushNotificationManager } from '../components/PushNotificationManager';
import { 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Archive, 
  Trash2, 
  Filter,
  Bell,
  MessageSquare,
  Users,
  AlertCircle,
  Settings as SettingsIcon,
  Mail,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'comment' | 'system' | 'team';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationsProps {
  onBack: () => void;
}

export function Notifications({ onBack }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'preferences'>('all');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Site Published Successfully',
      message: 'Your portfolio website is now live at myportfolio.buildaweb.com',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      archived: false,
      actionUrl: '/preview',
      actionLabel: 'View Site',
    },
    {
      id: '2',
      type: 'comment',
      title: 'New Comment on Homepage',
      message: 'Sarah Johnson commented: "Great design! Love the color scheme."',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      archived: false,
      actionUrl: '/comments',
      actionLabel: 'View Comment',
    },
    {
      id: '3',
      type: 'team',
      title: 'Team Invitation',
      message: 'John Smith invited you to collaborate on "Coffee Shop Website"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      archived: false,
      actionUrl: '/team',
      actionLabel: 'Accept',
    },
    {
      id: '4',
      type: 'warning',
      title: 'Domain Expiring Soon',
      message: 'Your domain myportfolio.com will expire in 7 days',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
      actionUrl: '/domain-wizard',
      actionLabel: 'Renew Domain',
    },
    {
      id: '5',
      type: 'system',
      title: 'Backup Completed',
      message: 'Your site backup was created successfully',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
    },
    {
      id: '6',
      type: 'info',
      title: 'New Feature Available',
      message: 'Try our new AI-powered content generator!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
      actionUrl: '/editor',
      actionLabel: 'Try Now',
    },
    {
      id: '7',
      type: 'error',
      title: 'Build Failed',
      message: 'There was an error building your site. Please check your custom code.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
      actionUrl: '/editor',
      actionLabel: 'Fix Issue',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
    toast.success('Notification archived');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment': return MessageSquare;
      case 'team': return Users;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'success': return Check;
      case 'system': return SettingsIcon;
      case 'info': return Bell;
    }
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'archived' && !n.archived) return false;
    if (filter === 'all' && n.archived) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  return (
    <div className="min-h-screen bg-background">
      <PushNotificationManager />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* All Notifications Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {['all', 'unread', 'archived'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f as typeof filter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          filter === f
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                    className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="success">Success</option>
                    <option value="comment">Comments</option>
                    <option value="team">Team</option>
                    <option value="warning">Warnings</option>
                    <option value="system">System</option>
                    <option value="info">Info</option>
                  </select>

                  {unreadCount > 0 && (
                    <Button size="sm" variant="outline" onClick={markAllAsRead}>
                      <CheckCheck className="h-4 w-4" />
                      Mark All Read
                    </Button>
                  )}

                  <Button size="sm" variant="outline" onClick={clearAll}>
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </Card>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-bold text-lg mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' && 'You have no unread notifications'}
                  {filter === 'archived' && 'You have no archived notifications'}
                  {filter === 'all' && "You're all caught up!"}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(notification => {
                  const Icon = getTypeIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className={`p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold">{notification.title}</h3>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                            {notification.actionLabel && (
                              <button className="text-xs text-primary hover:underline font-medium">
                                {notification.actionLabel}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 hover:bg-accent rounded-lg transition-colors"
                              aria-label="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => archiveNotification(notification.id)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            aria-label="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && <NotificationPreferences />}
      </div>
    </div>
  );
}
