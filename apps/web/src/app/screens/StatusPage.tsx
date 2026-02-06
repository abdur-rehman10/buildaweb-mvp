import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';

interface StatusPageProps {
  onBack: () => void;
}

export function StatusPage({ onBack }: StatusPageProps) {
  const services = [
    { name: 'Website Builder', status: 'operational', uptime: '99.99%' },
    { name: 'API', status: 'operational', uptime: '99.98%' },
    { name: 'CDN', status: 'operational', uptime: '99.95%' },
    { name: 'Database', status: 'operational', uptime: '99.99%' },
    { name: 'Authentication', status: 'operational', uptime: '100%' },
    { name: 'File Storage', status: 'operational', uptime: '99.97%' },
  ];

  const incidents = [
    {
      date: 'Jan 28, 2026',
      title: 'Scheduled Maintenance',
      description: 'Database optimization completed successfully',
      status: 'resolved',
      duration: '30 minutes',
    },
    {
      date: 'Jan 15, 2026',
      title: 'CDN Performance Degradation',
      description: 'Temporary slowdown in Asia-Pacific region',
      status: 'resolved',
      duration: '45 minutes',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
        </div>
      </header>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Overall Status */}
          <Card className="p-8 mb-8 text-center bg-success/5 border-success/20">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">All Systems Operational</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </p>
          </Card>

          {/* Services */}
          <Card className="p-6 mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Service Status
            </h2>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {service.uptime} uptime
                    </span>
                    <span className="px-2 py-1 bg-success/10 text-success text-xs rounded capitalize">
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Uptime Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-success mb-2">99.98%</div>
              <div className="text-sm text-muted-foreground">30-Day Uptime</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-success mb-2">99.97%</div>
              <div className="text-sm text-muted-foreground">90-Day Uptime</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-success mb-2">99.96%</div>
              <div className="text-sm text-muted-foreground">All-Time Uptime</div>
            </Card>
          </div>

          {/* Incident History */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Recent Incidents</h2>
            {incidents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No incidents in the last 90 days
              </p>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div key={index} className="border-l-2 border-success pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-xs px-2 py-1 bg-success/10 text-success rounded">
                        {incident.status}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {incident.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {incident.date} • Duration: {incident.duration}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
