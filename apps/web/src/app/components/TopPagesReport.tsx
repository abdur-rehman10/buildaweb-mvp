import { Card } from './Card';
import { TrendingUp, TrendingDown, Eye, Clock, MousePointer } from 'lucide-react';

interface PageMetrics {
  path: string;
  pageviews: number;
  uniqueVisitors: number;
  avgTimeOnPage: string;
  bounceRate: number;
  trend: 'up' | 'down' | 'neutral';
  trendPercentage: number;
}

export function TopPagesReport() {
  const pages: PageMetrics[] = [
    {
      path: '/home',
      pageviews: 15420,
      uniqueVisitors: 12300,
      avgTimeOnPage: '2m 45s',
      bounceRate: 35,
      trend: 'up',
      trendPercentage: 12,
    },
    {
      path: '/products',
      pageviews: 9800,
      uniqueVisitors: 7500,
      avgTimeOnPage: '4m 20s',
      bounceRate: 28,
      trend: 'up',
      trendPercentage: 8,
    },
    {
      path: '/pricing',
      pageviews: 6200,
      uniqueVisitors: 5100,
      avgTimeOnPage: '3m 10s',
      bounceRate: 42,
      trend: 'down',
      trendPercentage: 5,
    },
    {
      path: '/about',
      pageviews: 4100,
      uniqueVisitors: 3400,
      avgTimeOnPage: '1m 55s',
      bounceRate: 48,
      trend: 'up',
      trendPercentage: 3,
    },
    {
      path: '/contact',
      pageviews: 2800,
      uniqueVisitors: 2200,
      avgTimeOnPage: '2m 30s',
      bounceRate: 52,
      trend: 'down',
      trendPercentage: 2,
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Top Pages</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Page
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Views
                </div>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  Unique
                </div>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Avg Time
                </div>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Bounce Rate
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={page.path} className="border-b border-border hover:bg-accent transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{page.path}</span>
                  </div>
                </td>
                <td className="py-3 px-2 font-medium">
                  {page.pageviews.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-muted-foreground">
                  {page.uniqueVisitors.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-muted-foreground">
                  {page.avgTimeOnPage}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[60px]">
                      <div
                        className="h-full bg-destructive rounded-full"
                        style={{ width: `${page.bounceRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{page.bounceRate}%</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div
                    className={`flex items-center gap-1 ${
                      page.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {page.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{page.trendPercentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
