import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Search, Star, Eye, Heart, Download } from 'lucide-react';
import { toast } from 'sonner';

interface PublicTemplateGalleryProps {
  onBack: () => void;
  onUseTemplate: (templateId: string) => void;
}

export function PublicTemplateGallery({ onBack, onUseTemplate }: PublicTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = ['All', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'Landing Page', 'Restaurant', 'Fashion'];

  const templates = [
    { id: '1', name: 'Modern Portfolio', category: 'portfolio', views: 12500, rating: 4.9, image: '🎨', uses: 3200 },
    { id: '2', name: 'SaaS Landing', category: 'landing-page', views: 18200, rating: 5.0, image: '🚀', uses: 5400 },
    { id: '3', name: 'Online Store', category: 'e-commerce', views: 9800, rating: 4.8, image: '🛍️', uses: 2100 },
    { id: '4', name: 'Tech Blog', category: 'blog', views: 7600, rating: 4.7, image: '📝', uses: 1800 },
    { id: '5', name: 'Agency Website', category: 'business', views: 15300, rating: 4.9, image: '💼', uses: 4200 },
    { id: '6', name: 'Restaurant Menu', category: 'restaurant', views: 6200, rating: 4.6, image: '🍽️', uses: 1500 },
    { id: '7', name: 'Photography Portfolio', category: 'portfolio', views: 11400, rating: 4.8, image: '📸', uses: 2800 },
    { id: '8', name: 'Fashion Store', category: 'fashion', views: 14100, rating: 4.9, image: '👗', uses: 3600 },
    { id: '9', name: 'Startup MVP', category: 'landing-page', views: 10500, rating: 4.7, image: '⚡', uses: 2400 },
    { id: '10', name: 'Creative Studio', category: 'business', views: 8900, rating: 4.8, image: '🎬', uses: 2000 },
    { id: '11', name: 'Travel Blog', category: 'blog', views: 9200, rating: 4.6, image: '✈️', uses: 1900 },
    { id: '12', name: 'Fitness Gym', category: 'business', views: 7800, rating: 4.7, image: '💪', uses: 1700 },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (templateId: string) => {
    if (favorites.includes(templateId)) {
      setFavorites(favorites.filter(id => id !== templateId));
      toast.success('Removed from favorites');
    } else {
      setFavorites([...favorites, templateId]);
      toast.success('Added to favorites');
    }
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    toast.success(`Creating project from "${template.name}"...`);
    onUseTemplate(template.id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {favorites.length} favorites
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Template Gallery</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Start with a professional template and make it your own
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden group hover:shadow-xl transition-all">
                  {/* Template Preview */}
                  <div className="relative bg-gradient-to-br from-primary/20 to-cyan-500/20 h-48 flex items-center justify-center">
                    <div className="text-6xl">{template.image}</div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-background/90 backdrop-blur"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-background/90 backdrop-blur"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/90 backdrop-blur hover:bg-background transition-colors"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(template.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{(template.views / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{(template.uses / 1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded capitalize">
                      {template.category.replace('-', ' ')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-6">
            Start from scratch and build your perfect website
          </p>
          <Button size="lg" onClick={() => toast.success('Creating blank project...')}>
            Start from Blank
          </Button>
        </div>
      </section>
    </div>
  );
}