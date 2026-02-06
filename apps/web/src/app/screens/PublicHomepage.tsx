import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Zap, Users, Globe, Shield, Star, ArrowRight, Check } from 'lucide-react';

interface PublicHomepageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function PublicHomepage({ onGetStarted, onLogin }: PublicHomepageProps) {
  const features = [
    { icon: Zap, title: 'AI-Powered Design', description: 'Create stunning websites in minutes with AI assistance' },
    { icon: Globe, title: 'Custom Domains', description: 'Connect your own domain with one click' },
    { icon: Shield, title: 'Enterprise Security', description: 'SSL, backups, and 99.9% uptime guaranteed' },
    { icon: Users, title: 'Team Collaboration', description: 'Work together with real-time updates' },
  ];

  const stats = [
    { value: '50K+', label: 'Websites Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500" />
              <span className="text-xl font-bold">Buildaweb</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#templates" className="hover:text-primary transition-colors">Templates</a>
              <a href="#blog" className="hover:text-primary transition-colors">Blog</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onLogin}>Sign In</Button>
              <Button onClick={onGetStarted}>Get Started Free</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-cyan-500/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Website Builder
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Build Beautiful Websites in Minutes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The easiest way to create stunning, professional websites. No coding required. Powered by AI.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={onGetStarted}>
                Start Building Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to bring your vision to life
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Creators Worldwide</h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-6 w-6 fill-warning text-warning" />
              ))}
            </div>
            <p className="text-muted-foreground">Based on 10,000+ reviews</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  "Buildaweb made it incredibly easy to launch my business website. The AI suggestions were spot-on!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10" />
                  <div>
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-xs text-muted-foreground">Founder, DesignCo</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Website?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 50,000+ creators who trust Buildaweb
          </p>
          <Button size="lg" onClick={onGetStarted} className="bg-white text-primary hover:bg-white/90">
            Start Free Trial
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500" />
                <span className="font-bold">Buildaweb</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The easiest way to build beautiful websites.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Features</div>
                <div>Pricing</div>
                <div>Templates</div>
                <div>Blog</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>About</div>
                <div>Careers</div>
                <div>Contact</div>
                <div>Status</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Terms</div>
                <div>Privacy</div>
                <div>Cookies</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2026 Buildaweb. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
