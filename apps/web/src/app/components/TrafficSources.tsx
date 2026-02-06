import { Card } from './Card';
import { Globe, Search, Facebook, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  icon: any;
  color: string;
}

export function TrafficSources() {
  const sources: TrafficSource[] = [
    { source: 'Direct', visitors: 12450, percentage: 42, icon: Globe, color: '#8B5CF6' },
    { source: 'Organic Search', visitors: 8300, percentage: 28, icon: Search, color: '#06B6D4' },
    { source: 'Social Media', visitors: 5200, percentage: 18, icon: Facebook, color: '#EC4899' },
    { source: 'Referral', visitors: 2100, percentage: 7, icon: ExternalLink, color: '#10B981' },
    { source: 'Email', visitors: 1450, percentage: 5, icon: Mail, color: '#F59E0B' },
  ];

  const totalVisitors = sources.reduce((sum, s) => sum + s.visitors, 0);

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-6">Traffic Sources</h3>

      <div className="space-y-4">
        {sources.map((source) => {
          const Icon = source.icon;
          return (
            <div key={source.source} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${source.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: source.color }} />
                  </div>
                  <div>
                    <p className="font-medium">{source.source}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.visitors.toLocaleString()} visitors
                    </p>
                  </div>
                </div>
                <p className="font-bold text-lg">{source.percentage}%</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${source.percentage}%`,
                    backgroundColor: source.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="font-medium">Total Visitors</p>
          <p className="font-bold text-xl">{totalVisitors.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}
