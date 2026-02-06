import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Play, Clock, Eye, Search } from 'lucide-react';
import { Input } from '../components/Input';

interface VideoTutorialsProps {
  onBack: () => void;
}

export function VideoTutorials({ onBack }: VideoTutorialsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Getting Started', 'Design', 'Features', 'Advanced'];

  const videos = [
    {
      id: '1',
      title: 'Welcome to Buildaweb - Platform Overview',
      category: 'getting-started',
      duration: '5:32',
      views: 45200,
      thumbnail: '🎬',
      description: 'A complete introduction to the Buildaweb platform',
    },
    {
      id: '2',
      title: 'Creating Your First Website',
      category: 'getting-started',
      duration: '8:15',
      views: 38500,
      thumbnail: '🚀',
      description: 'Step-by-step guide to launching your first site',
    },
    {
      id: '3',
      title: 'Mastering the Visual Editor',
      category: 'design',
      duration: '12:40',
      views: 29100,
      thumbnail: '🎨',
      description: 'Learn all the tools in the drag-and-drop editor',
    },
    {
      id: '4',
      title: 'Responsive Design Best Practices',
      category: 'design',
      duration: '10:22',
      views: 25600,
      thumbnail: '📱',
      description: 'Make your site look perfect on all devices',
    },
    {
      id: '5',
      title: 'Using AI Design Assistant',
      category: 'features',
      duration: '7:18',
      views: 31400,
      thumbnail: '🤖',
      description: 'Get AI-powered design suggestions',
    },
    {
      id: '6',
      title: 'Team Collaboration & Permissions',
      category: 'features',
      duration: '9:45',
      views: 18900,
      thumbnail: '👥',
      description: 'Work with your team effectively',
    },
    {
      id: '7',
      title: 'Custom Code Injection',
      category: 'advanced',
      duration: '15:30',
      views: 22100,
      thumbnail: '💻',
      description: 'Add custom HTML, CSS, and JavaScript',
    },
    {
      id: '8',
      title: 'SEO Optimization Guide',
      category: 'advanced',
      duration: '11:55',
      views: 27800,
      thumbnail: '🔍',
      description: 'Improve your search engine rankings',
    },
  ];

  const filteredVideos = videos.filter((video) => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Video Tutorials</h1>
                  <p className="text-sm text-muted-foreground">Learn at your own pace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <Card className="p-12 text-center">
            <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold text-lg mb-2">No videos found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center text-6xl relative">
                  {video.thumbnail}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views.toLocaleString()} views
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
