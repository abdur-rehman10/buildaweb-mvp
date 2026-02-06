import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { 
  ArrowLeft, 
  Globe, 
  Edit, 
  Trash2, 
  UserPlus, 
  Settings,
  Eye,
  Download,
  Filter
} from 'lucide-react';

interface ActivityLogProps {
  onBack: () => void;
}

interface Activity {
  id: string;
  type: 'publish' | 'edit' | 'delete' | 'invite' | 'settings' | 'view';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    siteName?: string;
    pageName?: string;
    userName?: string;
  };
}

export function ActivityLog({ onBack }: ActivityLogProps) {
  const [filter, setFilter] = useState<'all' | 'publish' | 'edit' | 'delete'>('all');
  const [dateRange, setDateRange] = useState('7days');

  const activities: Activity[] = [
    {
      id: '1',
      type: 'publish',
      title: 'Site Published',
      description: 'Published "My Portfolio" to production',
      user: 'You',
      timestamp: '5 minutes ago',
      metadata: { siteName: 'My Portfolio' },
    },
    {
      id: '2',
      type: 'edit',
      title: 'Page Updated',
      description: 'Edited homepage hero section',
      user: 'You',
      timestamp: '2 hours ago',
      metadata: { siteName: 'My Portfolio', pageName: 'Home' },
    },
    {
      id: '3',
      type: 'invite',
      title: 'Team Member Invited',
      description: 'Invited Sarah Johnson to the team',
      user: 'You',
      timestamp: '1 day ago',
      metadata: { userName: 'Sarah Johnson' },
    },
    {
      id: '4',
      type: 'settings',
      title: 'Settings Changed',
      description: 'Updated site SEO settings',
      user: 'You',
      timestamp: '2 days ago',
      metadata: { siteName: 'Coffee Shop Website' },
    },
    {
      id: '5',
      type: 'edit',
      title: 'Content Modified',
      description: 'Updated pricing section content',
      user: 'Sarah Johnson',
      timestamp: '2 days ago',
      metadata: { siteName: 'Tech Startup Landing', pageName: 'Pricing' },
    },
    {
      id: '6',
      type: 'publish',
      title: 'Site Published',
      description: 'Published "Coffee Shop Website" to production',
      user: 'You',
      timestamp: '3 days ago',
      metadata: { siteName: 'Coffee Shop Website' },
    },
    {
      id: '7',
      type: 'delete',
      title: 'Page Deleted',
      description: 'Removed old blog page',
      user: 'You',
      timestamp: '5 days ago',
      metadata: { siteName: 'My Portfolio', pageName: 'Blog' },
    },
    {
      id: '8',
      type: 'view',
      title: 'Analytics Viewed',
      description: 'Checked site analytics',
      user: 'Sarah Johnson',
      timestamp: '1 week ago',
      metadata: { siteName: 'Tech Startup Landing' },
    },
  ];

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'publish':
        return Globe;
      case 'edit':
        return Edit;
      case 'delete':
        return Trash2;
      case 'invite':
        return UserPlus;
      case 'settings':
        return Settings;
      case 'view':
        return Eye;
      default:
        return Edit;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'publish':
        return 'bg-success/10 text-success';
      case 'edit':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-destructive/10 text-destructive';
      case 'invite':
        return 'bg-purple-100 text-purple-700';
      case 'settings':
        return 'bg-warning/10 text-warning';
      case 'view':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    // Simulate export
    const dataStr = JSON.stringify(activities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'activity-log.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
            <p className="text-muted-foreground">Track all changes and actions across your sites</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'publish', label: 'Published' },
                  { value: 'edit', label: 'Edited' },
                  { value: 'delete', label: 'Deleted' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as any)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      filter === option.value
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-white text-sm"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <div className="divide-y divide-border">
            {filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="p-6 hover:bg-accent transition-colors">
                  <div className="flex gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="font-bold">{activity.title}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">By {activity.user}</span>
                        {activity.metadata?.siteName && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-primary">{activity.metadata.siteName}</span>
                          </>
                        )}
                        {activity.metadata?.pageName && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span>{activity.metadata.pageName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {filteredActivities.length === 0 && (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more results
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
