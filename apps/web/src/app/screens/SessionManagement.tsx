import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, AlertTriangle, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionManagementProps {
  onBack: () => void;
}

export function SessionManagement({ onBack }: SessionManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 121',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      deviceType: 'mobile',
      browser: 'Safari 17',
      location: 'San Francisco, CA',
      ip: '192.168.1.2',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Edge 120',
      location: 'New York, NY',
      ip: '203.0.113.42',
      lastActive: '1 day ago',
      isCurrent: false,
    },
    {
      id: '4',
      device: 'iPad Air',
      deviceType: 'tablet',
      browser: 'Safari 17',
      location: 'Los Angeles, CA',
      ip: '198.51.100.17',
      lastActive: '3 days ago',
      isCurrent: false,
    },
  ]);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    sessionId: string | null;
    isLogoutAll: boolean;
  }>({
    isOpen: false,
    sessionId: null,
    isLogoutAll: false,
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    toast.success('Session revoked successfully');
    setConfirmDialog({ isOpen: false, sessionId: null, isLogoutAll: false });
  };

  const handleRevokeAll = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    toast.success('All other sessions have been revoked');
    setConfirmDialog({ isOpen: false, sessionId: null, isLogoutAll: false });
  };

  const activeSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Active Sessions</h1>
                <p className="text-sm text-muted-foreground">
                  Manage devices with access to your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Security Alert */}
        {activeSessions.length > 3 && (
          <Card className="p-4 mb-6 bg-warning/10 border-warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Multiple Active Sessions Detected</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You have {activeSessions.length} other active sessions. If you don't recognize any of these, revoke them immediately and change your password.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setConfirmDialog({ isOpen: true, sessionId: null, isLogoutAll: true })}
                >
                  <LogOut className="h-4 w-4" />
                  Revoke All Other Sessions
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Current Session */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Current Session</h2>
          {sessions
            .filter((s) => s.isCurrent)
            .map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceType);
              return (
                <Card key={session.id} className="p-6 border-2 border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <DeviceIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{session.device}</h3>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                              Current Device
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.browser}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {session.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {session.lastActive}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">IP: {session.ip}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>

        {/* Other Sessions */}
        {activeSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Other Sessions ({activeSessions.length})</h2>
              {activeSessions.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setConfirmDialog({ isOpen: true, sessionId: null, isLogoutAll: true })}
                >
                  <LogOut className="h-4 w-4" />
                  Revoke All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {activeSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                return (
                  <Card key={session.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <DeviceIcon className="h-6 w-6" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <div>
                            <h3 className="font-bold mb-1">{session.device}</h3>
                            <p className="text-sm text-muted-foreground">{session.browser}</p>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {session.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.lastActive}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">IP: {session.ip}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({ isOpen: true, sessionId: session.id, isLogoutAll: false })
                        }
                      >
                        Revoke
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeSessions.length === 0 && (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
              <Shield className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-bold text-lg mb-2">All Secure</h3>
            <p className="text-muted-foreground">
              You're only logged in on this device
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-6 mt-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold mb-2 text-blue-900 dark:text-blue-100">
            Security Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Regularly review your active sessions</li>
            <li>• Revoke access from unrecognized devices immediately</li>
            <li>• Enable two-factor authentication for extra security</li>
            <li>• Use a strong, unique password</li>
          </ul>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.isLogoutAll ? 'Revoke All Sessions?' : 'Revoke This Session?'}
        description={
          confirmDialog.isLogoutAll
            ? 'This will log you out from all other devices. You will need to log in again on those devices.'
            : 'This device will no longer have access to your account. The user will need to log in again.'
        }
        confirmLabel="Revoke"
        variant="warning"
        onConfirm={() => {
          if (confirmDialog.isLogoutAll) {
            handleRevokeAll();
          } else if (confirmDialog.sessionId) {
            handleRevokeSession(confirmDialog.sessionId);
          }
        }}
        onClose={() => setConfirmDialog({ isOpen: false, sessionId: null, isLogoutAll: false })}
      />
    </div>
  );
}
