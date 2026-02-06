import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Mail,
  ChevronRight,
  ExternalLink,
  Sparkles,
  FileText,
  Settings,
  Palette,
  Globe
} from 'lucide-react';

interface HelpProps {
  onBack: () => void;
}

export function Help({ onBack }: HelpProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: Sparkles,
      articles: [
        { title: 'Creating your first website with AI', time: '5 min read' },
        { title: 'Understanding the editor interface', time: '3 min read' },
        { title: 'Publishing your site', time: '2 min read' },
      ],
    },
    {
      id: 'editor',
      name: 'Using the Editor',
      icon: FileText,
      articles: [
        { title: 'Adding and editing sections', time: '4 min read' },
        { title: 'Customizing text and images', time: '3 min read' },
        { title: 'Working with the page outline', time: '2 min read' },
      ],
    },
    {
      id: 'design',
      name: 'Design & Styling',
      icon: Palette,
      articles: [
        { title: 'Customizing colors and fonts', time: '4 min read' },
        { title: 'Using global styles', time: '3 min read' },
        { title: 'Making your site mobile-friendly', time: '5 min read' },
      ],
    },
    {
      id: 'publishing',
      name: 'Publishing & Domains',
      icon: Globe,
      articles: [
        { title: 'Publishing your website', time: '3 min read' },
        { title: 'Setting up a custom domain', time: '6 min read' },
        { title: 'SEO best practices', time: '8 min read' },
      ],
    },
    {
      id: 'settings',
      name: 'Settings & Account',
      icon: Settings,
      articles: [
        { title: 'Managing your account', time: '2 min read' },
        { title: 'Billing and subscriptions', time: '4 min read' },
        { title: 'Team collaboration', time: '5 min read' },
      ],
    },
  ];

  const popularArticles = [
    { title: 'How to create a website with AI in 10 minutes', views: '12.5k', category: 'Getting Started' },
    { title: 'Setting up a custom domain', views: '8.2k', category: 'Publishing' },
    { title: 'Customizing your site colors', views: '6.8k', category: 'Design' },
    { title: 'Publishing your first site', views: '5.4k', category: 'Publishing' },
  ];

  const videos = [
    { title: 'Buildaweb Quick Start Guide', duration: '5:32', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
    { title: 'Advanced Editor Features', duration: '8:15', thumbnail: 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400' },
    { title: 'Custom Domain Setup', duration: '4:20', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400' },
  ];

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
              Back to Dashboard
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 h-14 rounded-[var(--radius-md)] border border-input bg-white text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Book className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive guides and tutorials
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">
                Step-by-step video walkthroughs
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-bold text-lg mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help from our support team
              </p>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.articles.map((article, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 hover:bg-accent px-3 rounded-md transition-colors"
                      >
                        <span className="text-sm">{article.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{article.time}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
          <Card>
            <div className="divide-y divide-border">
              {popularArticles.map((article, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.category} • {article.views} views
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Video Tutorials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative h-48 bg-muted">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[16px] border-l-primary border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/75 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium">{video.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] border-0 text-white">
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-lg opacity-90 mb-6">
              Our support team is here to assist you
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
