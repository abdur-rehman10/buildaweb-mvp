import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Search, BookOpen, ChevronRight, ThumbsUp } from 'lucide-react';

interface KnowledgeBaseProps {
  onBack: () => void;
}

export function KnowledgeBase({ onBack }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      name: 'Getting Started',
      icon: '🚀',
      articles: [
        { id: '1', title: 'How to create your first website', views: 12500 },
        { id: '2', title: 'Choosing the right template', views: 8900 },
        { id: '3', title: 'Publishing your site', views: 7600 },
      ],
    },
    {
      name: 'Design & Customization',
      icon: '🎨',
      articles: [
        { id: '4', title: 'Understanding the visual editor', views: 9200 },
        { id: '5', title: 'Working with colors and fonts', views: 6800 },
        { id: '6', title: 'Creating responsive layouts', views: 7100 },
      ],
    },
    {
      name: 'Domain & Hosting',
      icon: '🌐',
      articles: [
        { id: '7', title: 'Connecting a custom domain', views: 15300 },
        { id: '8', title: 'SSL certificates explained', views: 5400 },
        { id: '9', title: 'DNS settings guide', views: 4200 },
      ],
    },
    {
      name: 'SEO & Marketing',
      icon: '📈',
      articles: [
        { id: '10', title: 'SEO best practices', views: 11100 },
        { id: '11', title: 'Setting up Google Analytics', views: 8700 },
        { id: '12', title: 'Social media integration', views: 6300 },
      ],
    },
    {
      name: 'Billing & Plans',
      icon: '💳',
      articles: [
        { id: '13', title: 'Understanding pricing plans', views: 9800 },
        { id: '14', title: 'How to upgrade or downgrade', views: 5600 },
        { id: '15', title: 'Billing and invoices', views: 4900 },
      ],
    },
    {
      name: 'Troubleshooting',
      icon: '🔧',
      articles: [
        { id: '16', title: 'Common errors and fixes', views: 13200 },
        { id: '17', title: 'Browser compatibility', views: 3800 },
        { id: '18', title: 'Performance optimization', views: 7400 },
      ],
    },
  ];

  const popularArticles = [
    { id: '7', title: 'Connecting a custom domain', category: 'Domain & Hosting', views: 15300 },
    { id: '16', title: 'Common errors and fixes', category: 'Troubleshooting', views: 13200 },
    { id: '1', title: 'How to create your first website', category: 'Getting Started', views: 12500 },
    { id: '10', title: 'SEO best practices', category: 'SEO & Marketing', views: 11100 },
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

      {/* Hero Search */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Search our knowledge base for answers
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article) => (
              <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{article.category}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.views.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                </div>
                <div className="space-y-2">
                  {category.articles.map((article) => (
                    <button
                      key={article.id}
                      className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors group flex items-center justify-between"
                    >
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {article.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  View all articles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="p-8 text-center mt-12 bg-muted">
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-3 justify-center">
            <Button>Contact Support</Button>
            <Button variant="outline">Join Community Forum</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
