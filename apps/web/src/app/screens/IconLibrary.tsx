import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Search, Star, Heart, Home, User, Mail, Phone, Globe, ShoppingCart, Settings, Bell, Calendar, Camera, Clock, Copy, Download, Edit, File, Filter, Flag, Folder, Grid, Image, Link, List, Lock, Map, Menu, MessageCircle, Music, Play, Plus, Printer, RefreshCw, Save, Send, Share, Trash, Upload, Video, Wifi, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface IconLibraryProps {
  onBack: () => void;
  onInsert: (iconName: string) => void;
}

export function IconLibrary({ onBack, onInsert }: IconLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const icons = [
    { name: 'Star', component: Star, category: 'general' },
    { name: 'Heart', component: Heart, category: 'general' },
    { name: 'Home', component: Home, category: 'navigation' },
    { name: 'User', component: User, category: 'user' },
    { name: 'Mail', component: Mail, category: 'communication' },
    { name: 'Phone', component: Phone, category: 'communication' },
    { name: 'Globe', component: Globe, category: 'general' },
    { name: 'Shopping Cart', component: ShoppingCart, category: 'ecommerce' },
    { name: 'Settings', component: Settings, category: 'interface' },
    { name: 'Bell', component: Bell, category: 'interface' },
    { name: 'Calendar', component: Calendar, category: 'general' },
    { name: 'Camera', component: Camera, category: 'media' },
    { name: 'Clock', component: Clock, category: 'general' },
    { name: 'Copy', component: Copy, category: 'interface' },
    { name: 'Download', component: Download, category: 'interface' },
    { name: 'Edit', component: Edit, category: 'interface' },
    { name: 'File', component: File, category: 'interface' },
    { name: 'Filter', component: Filter, category: 'interface' },
    { name: 'Flag', component: Flag, category: 'general' },
    { name: 'Folder', component: Folder, category: 'interface' },
    { name: 'Grid', component: Grid, category: 'layout' },
    { name: 'Image', component: Image, category: 'media' },
    { name: 'Link', component: Link, category: 'interface' },
    { name: 'List', component: List, category: 'layout' },
    { name: 'Lock', component: Lock, category: 'security' },
    { name: 'Map', component: Map, category: 'navigation' },
    { name: 'Menu', component: Menu, category: 'navigation' },
    { name: 'Message', component: MessageCircle, category: 'communication' },
    { name: 'Music', component: Music, category: 'media' },
    { name: 'Play', component: Play, category: 'media' },
    { name: 'Plus', component: Plus, category: 'interface' },
    { name: 'Printer', component: Printer, category: 'interface' },
    { name: 'Refresh', component: RefreshCw, category: 'interface' },
    { name: 'Save', component: Save, category: 'interface' },
    { name: 'Send', component: Send, category: 'communication' },
    { name: 'Share', component: Share, category: 'interface' },
    { name: 'Trash', component: Trash, category: 'interface' },
    { name: 'Upload', component: Upload, category: 'interface' },
    { name: 'Video', component: Video, category: 'media' },
    { name: 'Wifi', component: Wifi, category: 'connectivity' },
    { name: 'X', component: X, category: 'interface' },
    { name: 'Zap', component: Zap, category: 'general' },
  ];

  const categories = [
    { id: 'all', name: 'All Icons' },
    { id: 'general', name: 'General' },
    { id: 'interface', name: 'Interface' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'communication', name: 'Communication' },
    { id: 'media', name: 'Media' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'user', name: 'User' },
    { id: 'security', name: 'Security' },
  ];

  const filteredIcons = icons.filter((icon) => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInsert = (icon: typeof icons[0]) => {
    onInsert(icon.name);
    toast.success(`${icon.name} icon added`);
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
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Icon Library</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredIcons.length} icons available
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
              placeholder="Search icons..."
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

        {/* Icon Grid */}
        {filteredIcons.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold text-lg mb-2">No icons found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredIcons.map((icon) => {
              const Icon = icon.component;
              return (
                <button
                  key={icon.name}
                  onClick={() => handleInsert(icon)}
                  className="p-4 border border-border rounded-lg hover:bg-accent hover:border-primary transition-colors group"
                  title={icon.name}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-xs text-center text-muted-foreground group-hover:text-foreground truncate">
                    {icon.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}