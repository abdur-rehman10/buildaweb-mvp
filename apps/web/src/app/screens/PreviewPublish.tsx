import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Globe,
  Eye,
  ExternalLink,
  Copy,
  Share2,
  CheckCircle,
  Loader2,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface PreviewPublishProps {
  projectId: string;
  onBack: () => void;
}

export function PreviewPublish({ projectId, onBack }: PreviewPublishProps) {
  const [publishStatus, setPublishStatus] = useState<'draft' | 'publishing' | 'published'>('draft');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedPage, setSelectedPage] = useState('home');
  const [showShareModal, setShowShareModal] = useState(false);

  const siteUrl = 'https://mysite.buildaweb.app';

  const pages = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'services', name: 'Services' },
    { id: 'contact', name: 'Contact' },
  ];

  const handlePublish = () => {
    setPublishStatus('publishing');
    
    // Simulate publishing process
    setTimeout(() => {
      setPublishStatus('published');
      toast.success('Site published successfully!', {
        description: 'Your website is now live and accessible.',
      });
    }, 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    toast.success('URL copied to clipboard!');
  };

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
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
          <div className="flex items-center gap-3">
            {publishStatus === 'published' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    Visit Site
                  </Button>
                </a>
              </>
            )}
            {publishStatus === 'draft' && (
              <Button size="sm" onClick={handlePublish}>
                <Globe className="h-4 w-4" />
                Publish Site
              </Button>
            )}
            {publishStatus === 'publishing' && (
              <Button size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Status Banner */}
        {publishStatus === 'published' && (
          <Card className="mb-6 bg-success/10 border-success/20">
            <div className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-success mb-1">Site Published Successfully!</h3>
                <div className="flex items-center gap-2 text-sm">
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {siteUrl}
                  </a>
                  <button
                    onClick={handleCopyUrl}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button size="sm" onClick={handlePublish}>
                Republish
              </Button>
            </div>
          </Card>
        )}

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-4 h-10 rounded-md border border-input bg-white"
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-white">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded transition-colors ${
                device === 'desktop' ? 'bg-accent' : 'hover:bg-accent'
              }`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded transition-colors ${
                device === 'tablet' ? 'bg-accent' : 'hover:bg-accent'
              }`}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded transition-colors ${
                device === 'mobile' ? 'bg-accent' : 'hover:bg-accent'
              }`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex justify-center">
          <div className={`${deviceWidths[device]} transition-all duration-300`}>
            <Card className="overflow-hidden shadow-2xl">
              {/* Browser Chrome */}
              <div className="h-10 bg-muted border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-warning" />
                  <div className="h-3 w-3 rounded-full bg-success" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-white rounded px-3 flex items-center text-xs text-muted-foreground border border-border">
                    <Eye className="h-3 w-3 mr-2" />
                    {siteUrl}
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-white overflow-y-auto" style={{ height: '70vh' }}>
                {/* Hero Section */}
                <div className="p-16 text-center bg-white">
                  <h1 className="text-5xl font-bold mb-4">
                    Build Beautiful Websites
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    Create professional websites in minutes with our AI-powered builder
                  </p>
                  <div className="flex gap-4 justify-center">
                    <div className="h-12 px-8 bg-primary text-white rounded-lg flex items-center font-medium">
                      Get Started
                    </div>
                    <div className="h-12 px-8 bg-muted rounded-lg flex items-center font-medium">
                      Learn More
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="p-16 bg-[#F9FAFB]">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    Powerful Features
                  </h2>
                  <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="text-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-lg mx-auto mb-4" />
                        <h3 className="font-bold mb-2">Feature {i}</h3>
                        <p className="text-sm text-muted-foreground">
                          Description of feature {i}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials */}
                <div className="p-16">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    What Our Customers Say
                  </h2>
                  <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-muted p-6 rounded-lg">
                        <p className="mb-4">
                          "Amazing product! It has completely transformed how we work."
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/20 rounded-full" />
                          <div>
                            <div className="font-medium">John Doe</div>
                            <div className="text-sm text-muted-foreground">CEO, Company</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="p-16 bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] text-white text-center">
                  <h2 className="text-4xl font-bold mb-4">
                    Ready to get started?
                  </h2>
                  <p className="text-xl opacity-90 mb-8">
                    Join thousands of satisfied customers today
                  </p>
                  <div className="h-12 px-8 bg-white text-primary rounded-lg inline-flex items-center font-medium">
                    Start Free Trial
                  </div>
                </div>

                {/* Footer */}
                <div className="p-16 bg-secondary text-white">
                  <div className="grid grid-cols-4 gap-8 mb-8 max-w-4xl mx-auto">
                    {['Product', 'Company', 'Resources', 'Legal'].map((section) => (
                      <div key={section}>
                        <h4 className="font-bold mb-4">{section}</h4>
                        <div className="space-y-2 text-sm opacity-80">
                          <div>Link 1</div>
                          <div>Link 2</div>
                          <div>Link 3</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 border-t border-white/20 text-center text-sm opacity-60">
                    © 2026 Buildaweb. All rights reserved.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Share Your Site</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteUrl}
                    readOnly
                    className="flex-1 px-3 h-10 rounded-md border border-input bg-muted text-sm"
                  />
                  <Button variant="outline" onClick={handleCopyUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Share on social media</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" fullWidth onClick={() => toast.success('Shared!')}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => toast.success('Shared!')}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => toast.success('Shared!')}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}