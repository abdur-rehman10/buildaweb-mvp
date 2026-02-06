import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Search, Type, Star } from 'lucide-react';
import { toast } from 'sonner';

interface FontLibraryProps {
  onBack: () => void;
  onApply: (fontFamily: string) => void;
}

export function FontLibrary({ onBack, onApply }: FontLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fonts = [
    { name: 'Inter', category: 'sans-serif', popular: true },
    { name: 'Roboto', category: 'sans-serif', popular: true },
    { name: 'Open Sans', category: 'sans-serif', popular: true },
    { name: 'Lato', category: 'sans-serif', popular: false },
    { name: 'Montserrat', category: 'sans-serif', popular: true },
    { name: 'Poppins', category: 'sans-serif', popular: true },
    { name: 'Raleway', category: 'sans-serif', popular: false },
    { name: 'Playfair Display', category: 'serif', popular: true },
    { name: 'Merriweather', category: 'serif', popular: false },
    { name: 'Lora', category: 'serif', popular: false },
    { name: 'PT Serif', category: 'serif', popular: false },
    { name: 'Source Serif Pro', category: 'serif', popular: false },
    { name: 'Fira Code', category: 'monospace', popular: true },
    { name: 'JetBrains Mono', category: 'monospace', popular: false },
    { name: 'Roboto Mono', category: 'monospace', popular: false },
    { name: 'Dancing Script', category: 'handwriting', popular: true },
    { name: 'Pacifico', category: 'handwriting', popular: false },
    { name: 'Caveat', category: 'handwriting', popular: false },
  ];

  const categories = [
    { id: 'all', name: 'All Fonts' },
    { id: 'sans-serif', name: 'Sans Serif' },
    { id: 'serif', name: 'Serif' },
    { id: 'monospace', name: 'Monospace' },
    { id: 'handwriting', name: 'Handwriting' },
  ];

  const filteredFonts = fonts.filter((font) => {
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (font: typeof fonts[0]) => {
    onApply(font.name);
    toast.success(`${font.name} applied`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Font Library</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredFonts.length} Google Fonts available
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Font List */}
        {filteredFonts.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold text-lg mb-2">No fonts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFonts.map((font) => (
              <Card key={font.name} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{font.name}</h3>
                    {font.popular && (
                      <Star className="h-4 w-4 fill-warning text-warning" />
                    )}
                    <span className="text-xs px-2 py-1 bg-muted rounded capitalize">
                      {font.category}
                    </span>
                  </div>
                  <Button size="sm" onClick={() => handleApply(font)}>
                    Apply Font
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl" style={{ fontFamily: font.name }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-2xl" style={{ fontFamily: font.name }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                  <p className="text-lg text-muted-foreground" style={{ fontFamily: font.name }}>
                    abcdefghijklmnopqrstuvwxyz 0123456789
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
