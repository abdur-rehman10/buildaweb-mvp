import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';

interface PublicBlogProps {
  onBack: () => void;
}

export function PublicBlog({ onBack }: PublicBlogProps) {
  const posts = [
    {
      id: '1',
      title: '10 Web Design Trends for 2026',
      excerpt: 'Stay ahead of the curve with these emerging design trends that will dominate the web this year.',
      category: 'Design',
      date: 'Feb 5, 2026',
      readTime: '5 min',
      image: '🎨',
    },
    {
      id: '2',
      title: 'How to Optimize Your Site for SEO',
      excerpt: 'Learn the essential SEO techniques to help your website rank higher in search results.',
      category: 'SEO',
      date: 'Feb 3, 2026',
      readTime: '8 min',
      image: '🔍',
    },
    {
      id: '3',
      title: 'Building Your First E-commerce Store',
      excerpt: 'A step-by-step guide to launching your online store and making your first sale.',
      category: 'E-commerce',
      date: 'Feb 1, 2026',
      readTime: '12 min',
      image: '🛍️',
    },
    {
      id: '4',
      title: 'The Power of AI in Web Design',
      excerpt: 'Discover how AI is revolutionizing the way we create and design websites.',
      category: 'AI',
      date: 'Jan 29, 2026',
      readTime: '6 min',
      image: '🤖',
    },
    {
      id: '5',
      title: 'Mobile-First Design Best Practices',
      excerpt: 'Essential tips for creating mobile-responsive websites that users love.',
      category: 'Mobile',
      date: 'Jan 25, 2026',
      readTime: '7 min',
      image: '📱',
    },
    {
      id: '6',
      title: 'Increasing Conversion Rates: A Guide',
      excerpt: 'Proven strategies to turn more visitors into customers on your website.',
      category: 'Marketing',
      date: 'Jan 20, 2026',
      readTime: '10 min',
      image: '📈',
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
          <h1 className="text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Tips, tutorials, and insights for building better websites
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center text-6xl">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs mb-3">
                    {post.category}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime} read
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 p-0">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
