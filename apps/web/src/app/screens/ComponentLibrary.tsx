import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Package, Search, Plus, Star, Download, Folder } from 'lucide-react';
import { toast } from 'sonner';

interface ComponentLibraryProps {
  onBack: () => void;
  onInsert: (componentId: string) => void;
}

interface Component {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  isFavorite: boolean;
  usageCount: number;
}

export function ComponentLibrary({ onBack, onInsert }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [components] = useState<Component[]>([
    {
      id: '1',
      name: 'Hero Section',
      category: 'headers',
      thumbnail: '🎯',
      description: 'Full-width hero with CTA',
      isFavorite: true,
      usageCount: 24,
    },
    {
      id: '2',
      name: 'Feature Grid',
      category: 'sections',
      thumbnail: '📱',
      description: '3-column feature showcase',
      isFavorite: false,
      usageCount: 18,
    },
    {
      id: '3',
      name: 'Pricing Table',
      category: 'pricing',
      thumbnail: '💳',
      description: 'Comparison pricing cards',
      isFavorite: true,
      usageCount: 32,
    },
    {
      id: '4',
      name: 'Contact Form',
      category: 'forms',
      thumbnail: '✉️',
      description: 'Styled contact form',
      isFavorite: false,
      usageCount: 15,
    },
    {
      id: '5',
      name: 'Testimonial Slider',
      category: 'testimonials',
      thumbnail: '⭐',
      description: 'Customer reviews carousel',
      isFavorite: true,
      usageCount: 21,
    },
    {
      id: '6',
      name: 'Footer',
      category: 'footers',
      thumbnail: '🔗',
      description: 'Multi-column footer',
      isFavorite: false,
      usageCount: 28,
    },
    {
      id: '7',
      name: 'CTA Banner',
      category: 'cta',
      thumbnail: '🚀',
      description: 'Call-to-action section',
      isFavorite: false,
      usageCount: 19,
    },
    {
      id: '8',
      name: 'Team Grid',
      category: 'sections',
      thumbnail: '👥',
      description: 'Team member cards',
      isFavorite: false,
      usageCount: 12,
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Components', count: components.length },
    { id: 'headers', name: 'Headers', count: components.filter(c => c.category === 'headers').length },
    { id: 'sections', name: 'Sections', count: components.filter(c => c.category === 'sections').length },
    { id: 'pricing', name: 'Pricing', count: components.filter(c => c.category === 'pricing').length },
    { id: 'forms', name: 'Forms', count: components.filter(c => c.category === 'forms').length },
    { id: 'testimonials', name: 'Testimonials', count: components.filter(c => c.category === 'testimonials').length },
    { id: 'footers', name: 'Footers', count: components.filter(c => c.category === 'footers').length },
    { id: 'cta', name: 'CTAs', count: components.filter(c => c.category === 'cta').length },
  ];

  const filteredComponents = components.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInsert = (component: Component) => {
    onInsert(component.id);
    toast.success(`${component.name} added to page`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Component Library</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredComponents.length} components available
                  </p>
                </div>
              </div>
            </div>
            <Button>
              <Plus className="h-5 w-5" />
              Save Component
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs opacity-70">{category.count}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-warning fill-warning" />
                <h3 className="font-bold">Favorites</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {components.filter(c => c.isFavorite).length} saved components
              </p>
            </Card>
          </div>

          {/* Component Grid */}
          <div className="lg:col-span-3">
            {filteredComponents.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-bold text-lg mb-2">No components found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or category filter
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComponents.map((component) => (
                  <Card key={component.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center text-6xl">
                      {component.thumbnail}
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{component.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {component.category}
                        </p>
                      </div>
                      <button className="p-1 hover:bg-accent rounded-md">
                        <Star className={`h-4 w-4 ${component.isFavorite ? 'fill-warning text-warning' : ''}`} />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Used {component.usageCount}x
                      </span>
                      <Button size="sm" onClick={() => handleInsert(component)}>
                        <Plus className="h-4 w-4" />
                        Insert
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
