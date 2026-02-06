import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';
import { AnalyticsExport } from '../components/AnalyticsExport';
import { RealTimeCounter } from '../components/RealTimeCounter';
import { TrafficSources } from '../components/TrafficSources';
import { TopPagesReport } from '../components/TopPagesReport';
import { ConversionFunnel } from '../components/ConversionFunnel';
import { EventTracking } from '../components/EventTracking';
import { GoalTracking } from '../components/GoalTracking';
import { Heatmap } from '../components/Heatmap';
import { SessionRecordings } from '../components/SessionRecordings';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  LayoutGrid,
  Activity,
  Video,
  Zap,
  Flame,
  PlayCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  onBack?: () => void;
}

export function Analytics({ onBack }: AnalyticsProps) {
  const [activeView, setActiveView] = useState<'overview' | 'realtime' | 'traffic' | 'funnel' | 'events' | 'goals' | 'heatmaps' | 'sessions' | 'export'>('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 30 days',
  });

  const visitorData = [
    { date: 'Jan 1', visitors: 1200, pageviews: 4500 },
    { date: 'Jan 5', visitors: 1800, pageviews: 5200 },
    { date: 'Jan 10', visitors: 1500, pageviews: 4800 },
    { date: 'Jan 15', visitors: 2200, pageviews: 6800 },
    { date: 'Jan 20', visitors: 2800, pageviews: 8200 },
    { date: 'Jan 25', visitors: 1900, pageviews: 5500 },
    { date: 'Jan 30', visitors: 1600, pageviews: 4900 },
  ];

  const stats = [
    {
      label: 'Total Visitors',
      value: '29,483',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
    },
    {
      label: 'Page Views',
      value: '84,230',
      change: '+8.2%',
      trend: 'up',
      icon: Eye,
    },
    {
      label: 'Avg. Session',
      value: '3m 24s',
      change: '+0.8%',
      trend: 'up',
      icon: Activity,
    },
    {
      label: 'Bounce Rate',
      value: '42.3%',
      change: '-2.1%',
      trend: 'down',
      icon: MousePointerClick,
    },
  ];

  const views = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'realtime', label: 'Real-Time', icon: Activity },
    { id: 'traffic', label: 'Traffic', icon: Users },
    { id: 'funnel', label: 'Funnel', icon: TrendingUp },
    { id: 'events', label: 'Events', icon: Zap },
    { id: 'goals', label: 'Goals', icon: TrendingUp },
    { id: 'heatmaps', label: 'Heatmaps', icon: Flame },
    { id: 'sessions', label: 'Sessions', icon: PlayCircle },
    { id: 'export', label: 'Export', icon: ArrowLeft },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights for your website</p>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* View Tabs */}
        <div className="mb-6 border-b border-border overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as typeof activeView)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeView === view.id
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp
                        className={`h-4 w-4 ${
                          stat.trend === 'up' ? 'text-success' : 'text-destructive'
                        } ${stat.trend === 'down' ? 'rotate-180' : ''}`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {stat.change}
                      </p>
                      <p className="text-sm text-muted-foreground">vs last period</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Visitor Chart */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6">Visitors Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={visitorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrafficSources />
              <TopPagesReport />
            </div>
          </div>
        )}

        {/* Real-Time View */}
        {activeView === 'realtime' && <RealTimeCounter />}

        {/* Traffic View */}
        {activeView === 'traffic' && (
          <div className="space-y-6">
            <TrafficSources />
            <TopPagesReport />
          </div>
        )}

        {/* Funnel View */}
        {activeView === 'funnel' && <ConversionFunnel />}

        {/* Events View */}
        {activeView === 'events' && <EventTracking />}

        {/* Goals View */}
        {activeView === 'goals' && <GoalTracking />}

        {/* Heatmaps View */}
        {activeView === 'heatmaps' && <Heatmap />}

        {/* Sessions View */}
        {activeView === 'sessions' && <SessionRecordings />}

        {/* Export View */}
        {activeView === 'export' && <AnalyticsExport />}

        {/* Quick Actions */}
        <Card className="p-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Need more advanced analytics?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4" />
                View Tutorial
              </Button>
              <Button size="sm">Upgrade to Pro</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}