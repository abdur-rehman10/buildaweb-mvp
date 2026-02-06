import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Zap, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface PerformanceDashboardProps {
  projectId: string;
  onBack: () => void;
}

export function PerformanceDashboard({ projectId, onBack }: PerformanceDashboardProps) {
  const metrics = [
    { name: 'LCP', score: 92, value: '1.2s', threshold: '2.5s', status: 'good' },
    { name: 'FID', score: 100, value: '8ms', threshold: '100ms', status: 'good' },
    { name: 'CLS', score: 95, value: '0.05', threshold: '0.1', status: 'good' },
    { name: 'FCP', score: 88, value: '1.5s', threshold: '1.8s', status: 'good' },
    { name: 'TTI', score: 75, value: '3.2s', threshold: '3.8s', status: 'needs-improvement' },
    { name: 'TBT', score: 82, value: '150ms', threshold: '300ms', status: 'good' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 50) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Performance Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Core Web Vitals & Metrics</p>
                </div>
              </div>
            </div>
            <Button>
              <RefreshCw className="h-4 w-4" />
              Run Test
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overall Score */}
        <Card className="p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-success/10 mb-4">
            <div>
              <div className="text-5xl font-bold text-success">89</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Good Performance</h2>
          <p className="text-muted-foreground">
            Your site meets recommended Core Web Vitals thresholds
          </p>
        </Card>

        {/* Core Web Vitals */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.slice(0, 3).map((metric) => (
              <Card key={metric.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold">{metric.name}</h4>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(metric.score)}`}
                  >
                    {metric.score}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Threshold</span>
                    <span className="font-medium">{metric.threshold}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBg(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.slice(3).map((metric) => (
              <Card key={metric.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold">{metric.name}</h4>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(metric.score)}`}
                  >
                    {metric.score}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBg(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Optimization Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Compress images</div>
                <div className="text-sm text-muted-foreground">
                  Reduce image file sizes by 45% with compression
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Enable browser caching</div>
                <div className="text-sm text-muted-foreground">
                  Cache static resources for faster repeat visits
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <TrendingDown className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Reduce JavaScript execution time</div>
                <div className="text-sm text-muted-foreground">
                  Consider code splitting and lazy loading
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
