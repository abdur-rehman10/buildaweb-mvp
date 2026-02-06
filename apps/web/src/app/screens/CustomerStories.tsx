import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Star, ArrowRight, TrendingUp } from 'lucide-react';

interface CustomerStoriesProps {
  onBack: () => void;
}

export function CustomerStories({ onBack }: CustomerStoriesProps) {
  const stories = [
    {
      id: '1',
      company: 'DesignCo',
      industry: 'Creative Agency',
      result: '300% increase in leads',
      testimonial: 'Buildaweb transformed how we showcase our work. Our new website has generated more leads in 3 months than our old site did all year.',
      author: 'Sarah Johnson',
      role: 'Founder & CEO',
      stats: [
        { label: 'Lead Growth', value: '+300%' },
        { label: 'Time Saved', value: '40hrs/mo' },
        { label: 'Cost Reduction', value: '65%' },
      ],
    },
    {
      id: '2',
      company: 'TechStart',
      industry: 'SaaS Startup',
      result: 'Launched in 2 days',
      testimonial: 'We needed to launch quickly. Buildaweb let us create a professional website in just 2 days, and we\'ve been iterating ever since.',
      author: 'Michael Chen',
      role: 'CTO',
      stats: [
        { label: 'Launch Time', value: '2 days' },
        { label: 'Page Speed', value: '98/100' },
        { label: 'Conversion Rate', value: '8.5%' },
      ],
    },
    {
      id: '3',
      company: 'ShopLocal',
      industry: 'E-commerce',
      result: '$100K in first month',
      testimonial: 'The e-commerce features are incredible. We sold $100K worth of products in our first month online.',
      author: 'Emily Davis',
      role: 'Owner',
      stats: [
        { label: 'Revenue (Mo 1)', value: '$100K' },
        { label: 'Products Listed', value: '500+' },
        { label: 'Customer Rating', value: '4.9★' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
        </div>
      </header>

      <section className="py-16 bg-gradient-to-br from-primary/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Customer Success Stories</h1>
          <p className="text-xl text-muted-foreground">
            Real results from real businesses using Buildaweb
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {stories.map((story, index) => (
            <div key={story.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm mb-4">
                  <TrendingUp className="h-4 w-4" />
                  {story.result}
                </div>
                <h2 className="text-3xl font-bold mb-4">{story.company}</h2>
                <p className="text-muted-foreground mb-6">{story.industry}</p>
                <blockquote className="text-lg mb-6 italic">
                  "{story.testimonial}"
                </blockquote>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-full bg-primary/10" />
                  <div>
                    <div className="font-bold">{story.author}</div>
                    <div className="text-sm text-muted-foreground">{story.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
              </div>
              <Card className="p-8">
                <h3 className="font-bold text-lg mb-6">Key Metrics</h3>
                <div className="space-y-6">
                  {story.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Your Success Story Starts Here</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses growing with Buildaweb
          </p>
          <Button size="lg">
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
