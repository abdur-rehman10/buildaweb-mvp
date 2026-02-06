import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { 
  Search, 
  Star, 
  Download, 
  TrendingUp, 
  Zap, 
  Palette, 
  Package,
  Filter,
  Check,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: 'plugin' | 'theme';
  category: string;
  price: number; // 0 for free
  rating: number;
  downloads: number;
  author: string;
  image: string;
  installed: boolean;
  featured: boolean;
}

interface MarketplaceProps {
  onBack: () => void;
}

export function Marketplace({ onBack }: MarketplaceProps) {
  const [items] = useState<MarketplaceItem[]>([
    {
      id: '1',
      name: 'Advanced Forms Pro',
      description: 'Create complex forms with conditional logic, file uploads, and payment integration',
      type: 'plugin',
      category: 'Forms',
      price: 29,
      rating: 4.8,
      downloads: 15420,
      author: 'FormMaster Studio',
      image: '🔧',
      installed: false,
      featured: true,
    },
    {
      id: '2',
      name: 'E-commerce Suite',
      description: 'Complete e-commerce solution with cart, checkout, and inventory management',
      type: 'plugin',
      category: 'E-commerce',
      price: 49,
      rating: 4.9,
      downloads: 8234,
      author: 'ShopBuilder Inc',
      image: '🛍️',
      installed: true,
      featured: true,
    },
    {
      id: '3',
      name: 'SEO Optimizer',
      description: 'Automatically optimize your site for search engines with AI-powered suggestions',
      type: 'plugin',
      category: 'SEO',
      price: 0,
      rating: 4.6,
      downloads: 32145,
      author: 'SEO Tools Co',
      image: '📊',
      installed: false,
      featured: true,
    },
    {
      id: '4',
      name: 'Modern Business Theme',
      description: 'Clean and professional theme perfect for business websites',
      type: 'theme',
      category: 'Business',
      price: 39,
      rating: 4.7,
      downloads: 6789,
      author: 'ThemeForge',
      image: '🎨',
      installed: false,
      featured: false,
    },
    {
      id: '5',
      name: 'Creative Portfolio',
      description: 'Stunning portfolio theme with animations and gallery features',
      type: 'theme',
      category: 'Portfolio',
      price: 0,
      rating: 4.5,
      downloads: 12456,
      author: 'Design Studio',
      image: '🖼️',
      installed: false,
      featured: false,
    },
    {
      id: '6',
      name: 'Analytics Plus',
      description: 'Enhanced analytics with custom dashboards and export features',
      type: 'plugin',
      category: 'Analytics',
      price: 19,
      rating: 4.4,
      downloads: 5632,
      author: 'Data Insights',
      image: '📈',
      installed: false,
      featured: false,
    },
    {
      id: '7',
      name: 'Live Chat Widget',
      description: 'Add real-time customer support chat to your website',
      type: 'plugin',
      category: 'Communication',
      price: 0,
      rating: 4.7,
      downloads: 18943,
      author: 'ChatBot AI',
      image: '💬',
      installed: true,
      featured: false,
    },
    {
      id: '8',
      name: 'Blog Master',
      description: 'Advanced blogging features with categories, tags, and RSS feeds',
      type: 'plugin',
      category: 'Content',
      price: 15,
      rating: 4.6,
      downloads: 9234,
      author: 'Content Hub',
      image: '📝',
      installed: false,
      featured: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'plugin' | 'theme'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const categories = ['all', 'Forms', 'E-commerce', 'SEO', 'Business', 'Portfolio', 'Analytics', 'Communication', 'Content'];

  const filteredItems = items
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return parseInt(b.id) - parseInt(a.id);
        default:
          return 0;
      }
    });

  const featuredItems = items.filter(item => item.featured);

  const handleInstall = (item: MarketplaceItem) => {
    if (item.price > 0) {
      toast.success(`Redirecting to checkout for ${item.name}...`);
    } else {
      toast.success(`${item.name} installed successfully!`);
    }
  };

  const handleUninstall = (item: MarketplaceItem) => {
    toast.success(`${item.name} uninstalled`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Extend your website with plugins and themes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{items.length}</p>
                <p className="text-sm text-muted-foreground">Available Items</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {items.filter(i => i.installed).length}
                </p>
                <p className="text-sm text-muted-foreground">Installed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuredItems.length}</p>
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-warning" />
              <h2 className="text-xl font-bold">Featured</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredItems.map((item) => (
                <Card key={item.id} className="p-6 border-2 border-warning/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{item.image}</div>
                    <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded">
                      Featured
                    </span>
                  </div>
                  <h3 className="font-bold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{item.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      {item.price === 0 ? 'Free' : `$${item.price}`}
                    </span>
                    {item.installed ? (
                      <Button size="sm" variant="outline" onClick={() => handleUninstall(item)}>
                        Uninstall
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleInstall(item)}>
                        Install
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search plugins and themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">All Types</option>
              <option value="plugin">Plugins</option>
              <option value="theme">Themes</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </Card>

        {/* All Items */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            All Items ({filteredItems.length})
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-bold text-lg mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{item.image}</div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    item.type === 'plugin' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </div>

                <h3 className="font-bold mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  by {item.author}
                </p>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= Math.floor(item.rating)
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {item.rating}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{item.downloads.toLocaleString()}</span>
                  </div>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-muted rounded text-xs">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-bold text-lg">
                    {item.price === 0 ? 'Free' : `$${item.price}`}
                  </span>
                  {item.installed ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleUninstall(item)}>
                        Uninstall
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleInstall(item)}>
                      {item.price === 0 ? 'Install' : 'Buy Now'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
