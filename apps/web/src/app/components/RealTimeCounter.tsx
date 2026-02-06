import { useState, useEffect } from 'react';
import { Users, Activity, Eye } from 'lucide-react';
import { Card } from './Card';

interface RealTimeStats {
  activeVisitors: number;
  pageViews: number;
  uniqueVisitors: number;
}

export function RealTimeCounter() {
  const [stats, setStats] = useState<RealTimeStats>({
    activeVisitors: 0,
    pageViews: 0,
    uniqueVisitors: 0,
  });

  const [recentVisitors, setRecentVisitors] = useState<Array<{
    id: string;
    page: string;
    location: string;
    timestamp: Date;
  }>>([]);

  // Simulate real-time updates
  useEffect(() => {
    // Initial data
    setStats({
      activeVisitors: Math.floor(Math.random() * 50) + 10,
      pageViews: Math.floor(Math.random() * 500) + 100,
      uniqueVisitors: Math.floor(Math.random() * 200) + 50,
    });

    setRecentVisitors([
      { id: '1', page: '/home', location: 'New York, US', timestamp: new Date() },
      { id: '2', page: '/products', location: 'London, UK', timestamp: new Date(Date.now() - 30000) },
      { id: '3', page: '/about', location: 'Tokyo, JP', timestamp: new Date(Date.now() - 60000) },
      { id: '4', page: '/contact', location: 'Paris, FR', timestamp: new Date(Date.now() - 90000) },
    ]);

    // Update every 5 seconds
    const interval = setInterval(() => {
      setStats((prev) => ({
        activeVisitors: Math.max(1, prev.activeVisitors + Math.floor(Math.random() * 5) - 2),
        pageViews: prev.pageViews + Math.floor(Math.random() * 3),
        uniqueVisitors: prev.uniqueVisitors + Math.floor(Math.random() * 2),
      }));

      // Add random visitor
      if (Math.random() > 0.5) {
        const pages = ['/home', '/products', '/about', '/contact', '/blog', '/pricing'];
        const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Paris, FR', 'Berlin, DE'];
        setRecentVisitors((prev) => [
          {
            id: Date.now().toString(),
            page: pages[Math.floor(Math.random() * pages.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            timestamp: new Date(),
          },
          ...prev.slice(0, 9),
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-4">
      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Visitors</p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-medium">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <p className="text-3xl font-bold">{stats.activeVisitors}</p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Page Views Today</p>
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-secondary" />
            <p className="text-3xl font-bold">{stats.pageViews}</p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Unique Visitors</p>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-accent-foreground" />
            <p className="text-3xl font-bold">{stats.uniqueVisitors}</p>
          </div>
        </Card>
      </div>

      {/* Recent visitors */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          <h3 className="font-bold">Recent Visitors</h3>
        </div>
        <div className="space-y-2">
          {recentVisitors.map((visitor) => (
            <div
              key={visitor.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{visitor.page}</p>
                  <p className="text-xs text-muted-foreground">{visitor.location}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{formatTimestamp(visitor.timestamp)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
