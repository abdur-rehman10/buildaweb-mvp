import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Image as ImageIcon, Search, Crown } from 'lucide-react';

interface SiteSettingsProps {
  projectId: string;
  onBack: () => void;
}

export function SiteSettings({ projectId, onBack }: SiteSettingsProps) {
  const [siteTitle, setSiteTitle] = useState('My Awesome Site');
  const [seoTitle, setSeoTitle] = useState('My Awesome Site - Build Amazing Websites');
  const [seoDescription, setSeoDescription] = useState(
    'Create professional websites in minutes with our AI-powered builder. No coding required.'
  );
  const [subdomain, setSubdomain] = useState('mysite');
  const [favicon, setFavicon] = useState<string | null>(null);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
    setTimeout(() => onBack(), 500);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
          <p className="text-muted-foreground">Configure your website's general settings</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-lg">General</h2>
            </div>
            <div className="p-6 space-y-6">
              <Input
                label="Site Title"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="My Awesome Site"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                    {favicon ? (
                      <img src={favicon} alt="Favicon" className="w-12 h-12" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button variant="outline" size="sm">
                      Upload Favicon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 32×32 px, PNG format
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* SEO Settings */}
          <Card>
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <h2 className="font-bold text-lg">SEO & Meta Tags</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <Input
                label="SEO Title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="My Awesome Site - Build Amazing Websites"
              />
              <p className="text-xs text-muted-foreground -mt-4">
                {seoTitle.length} / 60 characters
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">SEO Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 rounded-[var(--radius-sm)] border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Write a compelling description for search engines..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoDescription.length} / 160 characters
                </p>
              </div>

              {/* SEO Preview */}
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Google Search Preview</p>
                <div className="space-y-1">
                  <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {seoTitle}
                  </p>
                  <p className="text-xs text-green-700">
                    https://{subdomain}.buildaweb.app
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {seoDescription}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Domain Settings */}
          <Card>
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <h2 className="font-bold text-lg">Domain</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Subdomain</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 h-10 rounded-md border border-input bg-background"
                    placeholder="mysite"
                  />
                  <div className="flex items-center px-4 h-10 rounded-md border border-input bg-muted text-muted-foreground whitespace-nowrap">
                    .buildaweb.app
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your site will be available at:{' '}
                  <a
                    href={`https://${subdomain}.buildaweb.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://{subdomain}.buildaweb.app
                  </a>
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Custom Domain</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use your own domain name (e.g., www.yourdomain.com) with Buildaweb Pro
                    </p>
                    <Button variant="outline" size="sm">
                      <Crown className="h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Analytics */}
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-lg">Analytics</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                <Input placeholder="G-XXXXXXXXXX" />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add your Google Analytics tracking ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
                <Input placeholder="000000000000000" />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add your Facebook Pixel ID
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
