import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { ArrowLeft, Search, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface SEOManagerProps {
  projectId: string;
  onBack: () => void;
}

export function SEOManager({ projectId, onBack }: SEOManagerProps) {
  const [seoData, setSeoData] = useState({
    title: 'My Amazing Website - Best Products & Services',
    description: 'Discover our innovative solutions and services. Join thousands of satisfied customers worldwide.',
    keywords: 'website, services, products, online business',
    ogTitle: 'My Amazing Website',
    ogDescription: 'Discover our innovative solutions',
    ogImage: 'https://example.com/og-image.jpg',
    twitterCard: 'summary_large_image',
    canonical: 'https://mysite.buildaweb.app',
    robots: 'index, follow',
  });

  const [seoScore, setSeoScore] = useState(78);

  const handleSave = () => {
    toast.success('SEO settings saved successfully!');
  };

  const seoChecks = [
    { label: 'Title tag present', status: 'pass', message: 'Title is 52 characters (optimal)' },
    { label: 'Meta description', status: 'pass', message: 'Description is 148 characters (optimal)' },
    { label: 'Open Graph tags', status: 'pass', message: 'All OG tags configured' },
    { label: 'Mobile-friendly', status: 'pass', message: 'Site is responsive' },
    { label: 'Page speed', status: 'warning', message: 'Could be improved (75/100)' },
    { label: 'SSL certificate', status: 'pass', message: 'HTTPS enabled' },
    { label: 'Sitemap', status: 'pass', message: 'XML sitemap generated' },
    { label: 'Image alt tags', status: 'warning', message: '2 images missing alt text' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SEO Manager</h1>
          <p className="text-muted-foreground">Optimize your website for search engines</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic SEO */}
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="font-bold text-lg">Basic SEO</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Input
                    label="Page Title"
                    value={seoData.title}
                    onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {seoData.title.length}/60 characters (50-60 recommended)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 rounded-[var(--radius-sm)] border border-input bg-input-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    value={seoData.description}
                    onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {seoData.description.length}/160 characters (150-160 recommended)
                  </p>
                </div>

                <Input
                  label="Keywords"
                  value={seoData.keywords}
                  onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />

                <Input
                  label="Canonical URL"
                  value={seoData.canonical}
                  onChange={(e) => setSeoData({ ...seoData, canonical: e.target.value })}
                />
              </div>
            </Card>

            {/* Social Media */}
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="font-bold text-lg">Social Media (Open Graph)</h2>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="OG Title"
                  value={seoData.ogTitle}
                  onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">OG Description</label>
                  <textarea
                    className="w-full min-h-[60px] px-3 py-2 rounded-[var(--radius-sm)] border border-input bg-input-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    value={seoData.ogDescription}
                    onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
                  />
                </div>
                <Input
                  label="OG Image URL"
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter Card Type</label>
                  <select
                    value={seoData.twitterCard}
                    onChange={(e) => setSeoData({ ...seoData, twitterCard: e.target.value })}
                    className="w-full px-3 h-10 rounded-md border border-input bg-background"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Advanced */}
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="font-bold text-lg">Advanced Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Robots Meta Tag</label>
                  <select
                    value={seoData.robots}
                    onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                    className="w-full px-3 h-10 rounded-md border border-input bg-background"
                  >
                    <option value="index, follow">Index, Follow (Recommended)</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">XML Sitemap</p>
                    <p className="text-sm text-muted-foreground">Automatically generated</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Robots.txt</p>
                    <p className="text-sm text-muted-foreground">Configure crawler access</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleSave} size="lg">Save Changes</Button>
              <Button variant="outline" onClick={onBack} size="lg">Cancel</Button>
            </div>
          </div>

          {/* SEO Score Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-6 text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="h-32 w-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#8B5CF6"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(seoScore / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold">{seoScore}</span>
                    <span className="text-xs text-muted-foreground">SEO Score</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {seoScore >= 80 ? 'Excellent!' : seoScore >= 60 ? 'Good, but can improve' : 'Needs improvement'}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="font-bold flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO Checklist
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {seoChecks.map((check, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {check.status === 'pass' ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{check.label}</p>
                      <p className="text-xs text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Pro SEO Tools</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock advanced features like schema markup and keyword tracking
                </p>
                <Button size="sm" fullWidth>Upgrade to Pro</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
