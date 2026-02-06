import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Key, Plus, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface APIKeysManagementProps {
  onBack: () => void;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

export function APIKeysManagement({ onBack }: APIKeysManagementProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'baw_live_kj3h4kj5h34kj5h3k4j5h34kj5h34kj',
      created: 'Feb 1, 2026',
      lastUsed: '2 hours ago',
      permissions: ['read', 'write'],
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'baw_test_987h6g5f4d3s2a1q9w8e7r6t5y4u3i',
      created: 'Jan 15, 2026',
      lastUsed: '5 days ago',
      permissions: ['read'],
    },
  ]);

  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const toggleKeyVisibility = (keyId: string) => {
    if (visibleKeys.includes(keyId)) {
      setVisibleKeys(visibleKeys.filter((id) => id !== keyId));
    } else {
      setVisibleKeys([...visibleKeys, keyId]);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleCreateKey = () => {
    if (!newKeyName) return;
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `baw_live_${Math.random().toString(36).substring(2, 15)}`,
      created: 'Just now',
      lastUsed: 'Never',
      permissions: ['read'],
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNewKeyModal(false);
    toast.success('API key created successfully');
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    toast.success('API key deleted');
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
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">API Keys</h1>
                  <p className="text-sm text-muted-foreground">Manage developer access</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowNewKeyModal(true)}>
              <Plus className="h-5 w-5" />
              Create API Key
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>API Documentation:</strong> Use these keys to authenticate requests to the Buildaweb API. Keep your keys secure and never share them publicly.
          </p>
        </Card>

        {showNewKeyModal && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">Create New API Key</h3>
            <div className="space-y-4">
              <Input
                label="Key Name"
                placeholder="e.g., Production Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                autoFocus
              />
              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span>Read access</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" />
                    <span>Write access</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" />
                    <span>Delete access</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewKeyModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} className="flex-1">
                  Create Key
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{apiKey.name}</h3>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>Created: {apiKey.created}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteKey(apiKey.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">API Key</label>
                <div className="flex gap-2">
                  <Input
                    value={visibleKeys.includes(apiKey.id) ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {visibleKeys.includes(apiKey.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {apiKey.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize"
                  >
                    {permission}
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
