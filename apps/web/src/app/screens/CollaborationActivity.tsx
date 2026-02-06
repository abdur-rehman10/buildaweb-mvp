import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Activity, Users, Circle } from 'lucide-react';

interface CollaborationActivityProps {
  projectId: string;
  onBack: () => void;
}

interface ActiveUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  currentPage: string;
  action: string;
  lastActive: string;
}

export function CollaborationActivity({ projectId, onBack }: CollaborationActivityProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      color: '#8B5CF6',
      currentPage: 'Homepage',
      action: 'Editing header section',
      lastActive: 'Just now',
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'MC',
      color: '#06B6D4',
      currentPage: 'About Page',
      action: 'Adding images',
      lastActive: '1 min ago',
    },
    {
      id: '3',
      name: 'Emily Davis',
      avatar: 'ED',
      color: '#EC4899',
      currentPage: 'Contact',
      action: 'Reviewing form',
      lastActive: '3 min ago',
    },
  ]);

  const recentChanges = [
    { user: 'Sarah Johnson', action: 'Updated hero image', page: 'Homepage', time: '2 min ago' },
    { user: 'Mike Chen', action: 'Added team photos', page: 'About Page', time: '5 min ago' },
    { user: 'You', action: 'Changed color scheme', page: 'Global Styles', time: '8 min ago' },
    { user: 'Emily Davis', action: 'Modified contact form', page: 'Contact', time: '12 min ago' },
    { user: 'Sarah Johnson', action: 'Published changes', page: 'All pages', time: '15 min ago' },
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((users) =>
        users.map((user) => ({
          ...user,
          lastActive: user.id === '1' ? 'Just now' : user.lastActive,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Collaboration Activity</h1>
                  <p className="text-sm text-muted-foreground">
                    {activeUsers.length} people active right now
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.avatar}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Now */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Now
              </h2>
              <div className="space-y-4">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{user.name}</h3>
                          <div className="flex items-center gap-1">
                            <Circle
                              className="h-2 w-2 fill-success animate-pulse"
                              style={{ color: '#10B981' }}
                            />
                            <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{user.action}</div>
                        <div className="text-xs px-2 py-1 bg-muted rounded inline-block">
                          {user.currentPage}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Changes */}
          <div>
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Recent Changes</h2>
              <div className="space-y-3">
                {recentChanges.map((change, index) => (
                  <div key={index} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="font-medium text-sm mb-1">{change.user}</div>
                    <div className="text-sm text-muted-foreground mb-1">{change.action}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{change.page}</span>
                      <span className="text-xs text-muted-foreground">{change.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Updates Info */}
            <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Circle className="h-2 w-2 fill-success animate-pulse" style={{ color: '#10B981' }} />
                <span className="font-medium text-sm text-blue-900 dark:text-blue-100">
                  Live Updates Active
                </span>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                You'll see changes in real-time as your team works
              </p>
            </Card>
          </div>
        </div>

        {/* Activity Timeline */}
        <Card className="p-6 mt-6">
          <h2 className="font-bold text-lg mb-4">Today's Activity</h2>
          <div className="space-y-4">
            {recentChanges.map((change, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  {index < recentChanges.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{change.user}</span>
                    <span className="text-xs text-muted-foreground">{change.time}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{change.action}</div>
                  <div className="text-xs px-2 py-1 bg-muted rounded inline-block">
                    {change.page}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
