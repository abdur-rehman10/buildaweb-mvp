import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Code, Palette, Zap, Globe, Users, Shield, BarChart, Puzzle, Cloud, Lock, RefreshCw, Smartphone } from 'lucide-react';

interface PublicFeaturesProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export function PublicFeatures({ onBack, onGetStarted }: PublicFeaturesProps) {
  const featureCategories = [
    {
      title: 'Design & Building',
      features: [
        { icon: Zap, name: 'AI-Powered Builder', description: 'Let AI help you create stunning designs instantly' },
        { icon: Palette, name: 'Visual Editor', description: 'Drag-and-drop interface with real-time preview' },
        { icon: Code, name: 'Custom Code', description: 'Add your own HTML, CSS, and JavaScript' },
        { icon: Smartphone, name: 'Mobile Responsive', description: 'Perfect on all devices automatically' },
      ],
    },
    {
      title: 'Collaboration',
      features: [
        { icon: Users, name: 'Team Workspace', description: 'Invite team members with role-based access' },
        { icon: RefreshCw, name: 'Real-time Sync', description: 'See changes as they happen' },
        { icon: Puzzle, name: 'Component Library', description: 'Reusable blocks across projects' },
        { icon: BarChart, name: 'Analytics', description: 'Track visitor data and insights' },
      ],
    },
    {
      title: 'Performance & Security',
      features: [
        { icon: Shield, name: 'SSL Certificates', description: 'Free SSL for all sites' },
        { icon: Lock, name: 'Password Protection', description: 'Control who accesses your site' },
        { icon: Cloud, name: 'Auto Backups', description: 'Daily automatic backups' },
        { icon: Globe, name: 'Global CDN', description: 'Fast loading worldwide' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <Button onClick={onGetStarted}>Get Started Free</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Every Feature You Need</h1>
          <p className="text-xl text-muted-foreground">
            From design to deployment, we've got you covered with powerful tools and integrations
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {featureCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-3xl font-bold mb-12 text-center">{category.title}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.features.map((feature) => (
                  <Card key={feature.name} className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Try all features free for 14 days
          </p>
          <Button size="lg" onClick={onGetStarted}>
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
}
