import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle, Clock, Lightbulb, Rocket, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

interface RoadmapPageProps {
  onBack: () => void;
}

export function RoadmapPage({ onBack }: RoadmapPageProps) {
  const roadmapItems = [
    {
      id: '1',
      title: 'AI Design Assistant 2.0',
      description: 'Enhanced AI that can generate entire page layouts from text descriptions',
      status: 'in-progress',
      quarter: 'Q1 2026',
      votes: 234,
      category: 'AI Features',
    },
    {
      id: '2',
      title: 'Mobile App Builder',
      description: 'Create native mobile apps directly from your website',
      status: 'planned',
      quarter: 'Q2 2026',
      votes: 189,
      category: 'New Product',
    },
    {
      id: '3',
      title: 'Advanced Animation Editor',
      description: 'Visual timeline-based animation editor with custom keyframes',
      status: 'planned',
      quarter: 'Q2 2026',
      votes: 156,
      category: 'Design Tools',
    },
    {
      id: '4',
      title: 'E-commerce Enhanced Features',
      description: 'Advanced inventory management, subscription products, and abandoned cart recovery',
      status: 'in-progress',
      quarter: 'Q1 2026',
      votes: 298,
      category: 'E-commerce',
    },
    {
      id: '5',
      title: 'Multi-language Support',
      description: 'Built-in translation management and automatic language detection',
      status: 'planned',
      quarter: 'Q3 2026',
      votes: 145,
      category: 'Internationalization',
    },
    {
      id: '6',
      title: 'White Label Solution',
      description: 'Rebrand and resell Buildaweb under your own brand',
      status: 'under-review',
      quarter: 'Q3 2026',
      votes: 87,
      category: 'Enterprise',
    },
    {
      id: '7',
      title: 'Dark Mode Editor',
      description: 'Work on your projects in dark mode for reduced eye strain',
      status: 'completed',
      quarter: 'Q4 2025',
      votes: 412,
      category: 'UI/UX',
    },
    {
      id: '8',
      title: 'Version Control & Branching',
      description: 'Git-like version control with branching and merging',
      status: 'completed',
      quarter: 'Q4 2025',
      votes: 356,
      category: 'Collaboration',
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Completed' };
      case 'in-progress':
        return { icon: Rocket, color: 'text-primary', bg: 'bg-primary/10', label: 'In Progress' };
      case 'planned':
        return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Planned' };
      case 'under-review':
        return { icon: Lightbulb, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Under Review' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  const handleVote = (id: string) => {
    toast.success('Vote recorded! We appreciate your feedback.');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
        </div>
      </header>

      <section className="py-16 bg-gradient-to-br from-primary/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Product Roadmap</h1>
          <p className="text-xl text-muted-foreground">
            See what we're building next and vote on features you want
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Status Legend */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['completed', 'in-progress', 'planned', 'under-review'].map((status) => {
            const info = getStatusInfo(status);
            const Icon = info.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${info.color}`} />
                <span className="text-sm">{info.label}</span>
              </div>
            );
          })}
        </div>

        {/* Roadmap Items */}
        <div className="space-y-6">
          {['completed', 'in-progress', 'planned', 'under-review'].map((status) => {
            const items = roadmapItems.filter((item) => item.status === status);
            if (items.length === 0) return null;

            const info = getStatusInfo(status);
            const Icon = info.icon;

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`h-5 w-5 ${info.color}`} />
                  <h2 className="text-xl font-bold">{info.label}</h2>
                  <span className="text-sm text-muted-foreground">({items.length})</span>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 text-center">
                          <button
                            onClick={() => handleVote(item.id)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">{item.votes}</span>
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                              <p className="text-muted-foreground mb-3">{item.description}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs px-2 py-1 bg-muted rounded">
                                  {item.category}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Target: {item.quarter}
                                </span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full ${info.bg} ${info.color} text-sm flex items-center gap-1`}>
                              <Icon className="h-4 w-4" />
                              {info.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Idea */}
        <Card className="p-8 text-center mt-12 bg-muted">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Have a Feature Idea?</h2>
          <p className="text-muted-foreground mb-6">
            We'd love to hear your suggestions for new features
          </p>
          <Button size="lg">Submit Feature Request</Button>
        </Card>
      </div>
    </div>
  );
}
