import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Webhook, Plus, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WebhooksConfigurationProps {
  onBack: () => void;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered: string;
  status: 'success' | 'failed' | 'pending';
}

export function WebhooksConfiguration({ onBack }: WebhooksConfigurationProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
      events: ['project.published', 'form.submitted'],
      active: true,
      lastTriggered: '2 hours ago',
      status: 'success',
    },
    {
      id: '2',
      name: 'Analytics Tracking',
      url: 'https://api.analytics.com/webhook',
      events: ['page.viewed', 'project.created'],
      active: false,
      lastTriggered: '5 days ago',
      status: 'failed',
    },
  ]);

  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });

  const availableEvents = [
    'project.created',
    'project.published',
    'project.deleted',
    'page.created',
    'page.viewed',
    'form.submitted',
    'comment.posted',
    'user.signed_up',
  ];

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) return;
    const webhook: Webhook = {
      id: Date.now().toString(),
      ...newWebhook,
      active: true,
      lastTriggered: 'Never',
      status: 'pending',
    };
    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setShowNewWebhook(false);
    toast.success('Webhook created successfully');
  };

  const handleTest = (id: string) => {
    toast.success('Test event sent to webhook');
  };

  const toggleActive = (id: string) => {
    setWebhooks(
      webhooks.map((wh) => (wh.id === id ? { ...wh, active: !wh.active } : wh))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Webhook className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Webhooks</h1>
                  <p className="text-sm text-muted-foreground">Event notifications</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowNewWebhook(true)}>
              <Plus className="h-5 w-5" />
              Add Webhook
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showNewWebhook && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">Create New Webhook</h3>
            <div className="space-y-4">
              <Input
                label="Webhook Name"
                placeholder="e.g., Slack Notifications"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
              />
              <Input
                label="Webhook URL"
                placeholder="https://your-server.com/webhook"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Events to Listen For</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewWebhook(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook} className="flex-1">
                  Create Webhook
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{webhook.name}</h3>
                    {webhook.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {webhook.status === 'failed' && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhook.active}
                        onChange={() => toggleActive(webhook.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-mono">{webhook.url}</p>
                  <p className="text-xs text-muted-foreground">Last triggered: {webhook.lastTriggered}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleTest(webhook.id)}>
                    <TestTube className="h-4 w-4" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {webhook.events.map((event) => (
                  <span
                    key={event}
                    className="px-2 py-1 bg-muted text-xs rounded"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
