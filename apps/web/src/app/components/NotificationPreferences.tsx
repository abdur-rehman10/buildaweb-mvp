import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Bell, Mail, Smartphone, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    types: {
      comments: boolean;
      teamActivity: boolean;
      siteUpdates: boolean;
      systemAlerts: boolean;
      marketing: boolean;
      billing: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      comments: boolean;
      teamActivity: boolean;
      siteUpdates: boolean;
      systemAlerts: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    types: {
      comments: boolean;
      teamActivity: boolean;
      siteUpdates: boolean;
      systemAlerts: boolean;
    };
  };
}

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      frequency: 'instant',
      types: {
        comments: true,
        teamActivity: true,
        siteUpdates: true,
        systemAlerts: true,
        marketing: false,
        billing: true,
      },
    },
    push: {
      enabled: false,
      types: {
        comments: true,
        teamActivity: true,
        siteUpdates: false,
        systemAlerts: true,
      },
    },
    inApp: {
      enabled: true,
      types: {
        comments: true,
        teamActivity: true,
        siteUpdates: true,
        systemAlerts: true,
      },
    },
  });

  const handleSave = () => {
    // Save to backend
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    toast.success('Notification preferences saved!');
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings({
          ...settings,
          push: { ...settings.push, enabled: true },
        });
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notification permission denied');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-bold">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({
                ...settings,
                email: { ...settings.email, enabled: !settings.email.enabled },
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.email.enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.email.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.email.enabled && (
          <div className="space-y-4">
            {/* Frequency */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Frequency
              </label>
              <select
                value={settings.email.frequency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      frequency: e.target.value as 'instant' | 'daily' | 'weekly',
                    },
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="instant">Instant (as they happen)</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>

            {/* Types */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Notification Types
              </label>
              <div className="space-y-3">
                {Object.entries(settings.email.types).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            types: {
                              ...settings.email.types,
                              [key]: !value,
                            },
                          },
                        })
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        value ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Push Notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-bold">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Desktop and mobile notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!settings.push.enabled) {
                requestPushPermission();
              } else {
                setSettings({
                  ...settings,
                  push: { ...settings.push, enabled: false },
                });
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.push.enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.push.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.push.enabled ? (
          <div className="space-y-3">
            {Object.entries(settings.push.types).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      push: {
                        ...settings.push,
                        types: {
                          ...settings.push.types,
                          [key]: !value,
                        },
                      },
                    })
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            Enable push notifications to receive real-time updates on your device.
          </div>
        )}
      </Card>

      {/* In-App Notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-bold">In-App Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Notifications within Buildaweb
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({
                ...settings,
                inApp: { ...settings.inApp, enabled: !settings.inApp.enabled },
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.inApp.enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.inApp.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.inApp.enabled && (
          <div className="space-y-3">
            {Object.entries(settings.inApp.types).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      inApp: {
                        ...settings.inApp,
                        types: {
                          ...settings.inApp.types,
                          [key]: !value,
                        },
                      },
                    })
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
