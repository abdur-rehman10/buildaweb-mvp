import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink, 
  Search,
  BarChart3,
  Facebook,
  Mail,
  MessageSquare,
  Zap,
  Settings
} from 'lucide-react';

interface IntegrationsProps {
  projectId: string;
  onBack: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'marketing' | 'communication' | 'automation';
  icon: any;
  connected: boolean;
  configFields?: { label: string; value: string }[];
}

export function Integrations({ projectId, onBack }: IntegrationsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfigModal, setShowConfigModal] = useState<Integration | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track website traffic and user behavior with GA4',
      category: 'analytics',
      icon: BarChart3,
      connected: true,
      configFields: [
        { label: 'Measurement ID', value: 'G-XXXXXXXXXX' },
      ],
    },
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      description: 'Track conversions and build audiences for Facebook Ads',
      category: 'marketing',
      icon: Facebook,
      connected: false,
      configFields: [
        { label: 'Pixel ID', value: '' },
      ],
    },
    {
      id: 'google-tag-manager',
      name: 'Google Tag Manager',
      description: 'Manage all your website tags without editing code',
      category: 'marketing',
      icon: Settings,
      connected: false,
      configFields: [
        { label: 'Container ID', value: '' },
      ],
    },
    {
      id: 'hotjar',
      name: 'Hotjar',
      description: 'Understand user behavior with heatmaps and recordings',
      category: 'analytics',
      icon: BarChart3,
      connected: false,
      configFields: [
        { label: 'Site ID', value: '' },
      ],
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and newsletter automation',
      category: 'communication',
      icon: Mail,
      connected: true,
      configFields: [
        { label: 'API Key', value: '••••••••••••••••' },
        { label: 'List ID', value: 'abc123def' },
      ],
    },
    {
      id: 'intercom',
      name: 'Intercom',
      description: 'Customer messaging and live chat support',
      category: 'communication',
      icon: MessageSquare,
      connected: false,
      configFields: [
        { label: 'App ID', value: '' },
      ],
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps and automate workflows',
      category: 'automation',
      icon: Zap,
      connected: false,
      configFields: [
        { label: 'Webhook URL', value: '' },
      ],
    },
    {
      id: 'linkedin-insight',
      name: 'LinkedIn Insight Tag',
      description: 'Track conversions from LinkedIn Ads',
      category: 'marketing',
      icon: BarChart3,
      connected: false,
      configFields: [
        { label: 'Partner ID', value: '' },
      ],
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Integrations' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'communication', label: 'Communication' },
    { id: 'automation', label: 'Automation' },
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = (integration: Integration) => {
    setShowConfigModal(integration);
    const initialData: Record<string, string> = {};
    integration.configFields?.forEach((field) => {
      initialData[field.label] = field.value;
    });
    setConfigData(initialData);
  };

  const handleSaveConfig = () => {
    if (!showConfigModal) return;

    setIntegrations(integrations.map((int) =>
      int.id === showConfigModal.id
        ? { ...int, connected: true, configFields: int.configFields?.map((field) => ({
            ...field,
            value: configData[field.label] || field.value,
          })) }
        : int
    ));

    toast.success(`${showConfigModal.name} connected successfully!`);
    setShowConfigModal(null);
    setConfigData({});
  };

  const handleDisconnect = (integration: Integration) => {
    setIntegrations(integrations.map((int) =>
      int.id === integration.id ? { ...int, connected: false } : int
    ));
    toast.success(`${integration.name} disconnected`);
  };

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and services • {connectedCount} connected
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search integrations..."
              className="w-full pl-10 pr-4 h-12 rounded-[var(--radius-md)] border border-input bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-[var(--radius-sm)] whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:bg-accent'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      integration.connected ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        integration.connected ? 'text-success' : 'text-muted-foreground'
                      }`} />
                    </div>
                    {integration.connected && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>

                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => handleConnect(integration)}
                        >
                          <Settings className="h-4 w-4" />
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDisconnect(integration)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button fullWidth onClick={() => handleConnect(integration)}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No integrations found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>
        )}

        {/* Request Integration */}
        <Card className="mt-8 bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] border-0 text-white">
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Need a different integration?</h3>
            <p className="text-lg opacity-90 mb-6">
              Let us know which tools you'd like to connect
            </p>
            <Button variant="secondary" size="lg">
              <Mail className="h-4 w-4" />
              Request Integration
            </Button>
          </div>
        </Card>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <showConfigModal.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{showConfigModal.name}</h3>
                  <p className="text-xs text-muted-foreground">Configuration</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {showConfigModal.configFields?.map((field) => (
                <Input
                  key={field.label}
                  label={field.label}
                  value={configData[field.label] || field.value}
                  onChange={(e) =>
                    setConfigData({ ...configData, [field.label]: e.target.value })
                  }
                  placeholder={`Enter your ${field.label}`}
                />
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>How to find this:</strong> Visit your {showConfigModal.name} dashboard
                  and look for the integration or API settings.
                </p>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Documentation
                </a>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" fullWidth onClick={() => setShowConfigModal(null)}>
                  Cancel
                </Button>
                <Button fullWidth onClick={handleSaveConfig}>
                  {showConfigModal.connected ? 'Save Changes' : 'Connect'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
