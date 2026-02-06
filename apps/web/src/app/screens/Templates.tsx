import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { ArrowLeft, Search, Star, Eye, Sparkles } from 'lucide-react';

interface TemplatesProps {
  onBack: () => void;
}

interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  popular: boolean;
  description: string;
}

export function Templates({ onBack }: TemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'saas', label: 'SaaS' },
    { id: 'agency', label: 'Agency' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'blog', label: 'Blog' },
  ];

  const templates: Template[] = [
    {
      id: '1',
      name: 'SaaS Startup',
      category: 'saas',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      popular: true,
      description: 'Modern landing page for SaaS products',
    },
    {
      id: '2',
      name: 'Creative Agency',
      category: 'agency',
      image: 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=800',
      popular: true,
      description: 'Showcase your creative work',
    },
    {
      id: '3',
      name: 'E-commerce Store',
      category: 'ecommerce',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
      popular: false,
      description: 'Clean online store template',
    },
    {
      id: '4',
      name: 'Portfolio Pro',
      category: 'portfolio',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
      popular: true,
      description: 'Perfect for designers and developers',
    },
    {
      id: '5',
      name: 'Restaurant Delight',
      category: 'restaurant',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      popular: false,
      description: 'Appetizing restaurant website',
    },
    {
      id: '6',
      name: 'Tech Blog',
      category: 'blog',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
      popular: false,
      description: 'Minimalist blog template',
    },
    {
      id: '7',
      name: 'AI Platform',
      category: 'saas',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      popular: true,
      description: 'Modern AI product showcase',
    },
    {
      id: '8',
      name: 'Marketing Agency',
      category: 'agency',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      popular: false,
      description: 'Professional marketing site',
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: Template) => {
    toast.success(`Creating site from ${template.name} template...`);
    setTimeout(() => onBack(), 1000);
  };

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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose a Template</h1>
          <p className="text-lg text-muted-foreground">
            Start with a professionally designed template and customize it to your needs
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 h-12 rounded-[var(--radius-md)] border border-input bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-[var(--radius-sm)] whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:bg-accent'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer"
            >
              {/* Template Preview */}
              <div className="relative h-64 bg-muted overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {template.popular && (
                  <div className="absolute top-3 right-3 bg-warning text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Popular
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Button
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <div className="flex gap-2">
                  <Button
                    fullWidth
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No templates found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* AI Generate Option */}
        <Card className="mt-8 bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] border-0 text-white">
          <div className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h3>
            <p className="text-lg opacity-90 mb-6">
              Let AI create a custom website tailored to your business
            </p>
            <Button variant="secondary" size="lg" onClick={onBack}>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">{previewTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleUseTemplate(previewTemplate)}>
                  Use Template
                </Button>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <img
                src={previewTemplate.image}
                alt={previewTemplate.name}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
