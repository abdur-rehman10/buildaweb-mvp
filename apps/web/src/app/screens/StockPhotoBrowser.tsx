import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Search, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface StockPhotoBrowserProps {
  onBack: () => void;
  onInsert: (imageUrl: string) => void;
}

export function StockPhotoBrowser({ onBack, onInsert }: StockPhotoBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');

  const categories = ['Popular', 'Business', 'Technology', 'Nature', 'People', 'Abstract'];

  const photos = [
    { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', photographer: 'John Doe', likes: 234 },
    { id: '2', url: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e', photographer: 'Jane Smith', likes: 189 },
    { id: '3', url: 'https://images.unsplash.com/photo-1618004652321-13a63e576b80', photographer: 'Mike Johnson', likes: 312 },
    { id: '4', url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead', photographer: 'Sarah Williams', likes: 156 },
    { id: '5', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6', photographer: 'Tom Brown', likes: 267 },
    { id: '6', url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032', photographer: 'Lisa Davis', likes: 198 },
    { id: '7', url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca', photographer: 'Chris Wilson', likes: 423 },
    { id: '8', url: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191', photographer: 'Emma Taylor', likes: 345 },
  ];

  const handleInsert = (photo: typeof photos[0]) => {
    onInsert(photo.url);
    toast.success('Photo added to page');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Stock Photos</h1>
                  <p className="text-sm text-muted-foreground">Powered by Unsplash</p>
                </div>
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
              placeholder="Search millions of free photos..."
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

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="group overflow-hidden cursor-pointer">
              <div className="relative aspect-square">
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" onClick={() => handleInsert(photo)}>
                    <Download className="h-4 w-4" />
                    Insert
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-muted-foreground">by {photo.photographer}</p>
                <p className="text-xs text-muted-foreground">❤️ {photo.likes}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
