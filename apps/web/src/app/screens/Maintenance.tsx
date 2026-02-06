import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Wrench, Clock, RefreshCw, Twitter, Mail } from 'lucide-react';

interface MaintenanceProps {
  estimatedTime?: string;
  message?: string;
  onRetry?: () => void;
}

export function Maintenance({ 
  estimatedTime = 'a few hours',
  message = 'We\'re performing scheduled maintenance to improve your experience.',
  onRetry
}: MaintenanceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E0E7FF] dark:from-gray-900 dark:to-purple-950 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Animated circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-primary/20 animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/30 animate-pulse" />
            </div>
            
            {/* Icon */}
            <div className="relative h-32 w-32 rounded-full bg-white dark:bg-gray-800 border-4 border-primary flex items-center justify-center mx-auto shadow-xl">
              <Wrench className="h-16 w-16 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold mb-4">We'll Be Right Back</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          {message}
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
          <Card className="p-6">
            <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-1">Estimated Time</h3>
            <p className="text-sm text-muted-foreground">{estimatedTime}</p>
          </Card>
          <Card className="p-6">
            <RefreshCw className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h3 className="font-bold mb-1">Status Updates</h3>
            <p className="text-sm text-muted-foreground">Check our status page</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {onRetry && (
            <Button size="lg" onClick={onRetry}>
              <RefreshCw className="h-5 w-5" />
              Retry Connection
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={() => window.open('https://status.buildaweb.app', '_blank')}>
            View Status Page
          </Button>
        </div>

        {/* Timeline */}
        <Card className="p-6 max-w-lg mx-auto mb-8">
          <h3 className="font-bold mb-4">Maintenance Timeline</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-success mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Started: Today at 2:00 AM EST</p>
                <p className="text-xs text-muted-foreground">All services temporarily unavailable</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-warning mt-2 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-medium">In Progress: Upgrading infrastructure</p>
                <p className="text-xs text-muted-foreground">Database migration and server optimization</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-muted mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Expected: Today at 6:00 AM EST</p>
                <p className="text-xs text-muted-foreground">All services will be restored</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">Stay updated:</p>
          <Button variant="ghost" size="sm">
            <Twitter className="h-4 w-4" />
            @buildaweb
          </Button>
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4" />
            Email Updates
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-8">
          We apologize for any inconvenience. Your data is safe and will be available once maintenance is complete.
        </p>
      </div>
    </div>
  );
}
