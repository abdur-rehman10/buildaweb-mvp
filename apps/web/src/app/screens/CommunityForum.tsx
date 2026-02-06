import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Users, MessageCircle, ThumbsUp, Search, Plus, TrendingUp } from 'lucide-react';

interface CommunityForumProps {
  onBack: () => void;
}

export function CommunityForum({ onBack }: CommunityForumProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', count: 248 },
    { id: 'general', name: 'General Discussion', count: 89 },
    { id: 'help', name: 'Help & Support', count: 67 },
    { id: 'showcase', name: 'Showcase', count: 42 },
    { id: 'features', name: 'Feature Requests', count: 31 },
    { id: 'tips', name: 'Tips & Tricks', count: 19 },
  ];

  const topics = [
    {
      id: '1',
      title: 'Best practices for responsive design?',
      category: 'help',
      author: 'Sarah M.',
      replies: 24,
      likes: 45,
      views: 892,
      lastActive: '5 mins ago',
      trending: true,
    },
    {
      id: '2',
      title: 'Check out my portfolio website!',
      category: 'showcase',
      author: 'Mike Chen',
      replies: 18,
      likes: 67,
      views: 1234,
      lastActive: '1 hour ago',
      trending: true,
    },
    {
      id: '3',
      title: 'How to optimize site performance?',
      category: 'help',
      author: 'Emma Davis',
      replies: 31,
      likes: 89,
      views: 2156,
      lastActive: '2 hours ago',
      trending: false,
    },
    {
      id: '4',
      title: 'Custom animation tutorial',
      category: 'tips',
      author: 'Alex Johnson',
      replies: 12,
      likes: 34,
      views: 567,
      lastActive: '3 hours ago',
      trending: false,
    },
    {
      id: '5',
      title: 'Request: Dark mode editor',
      category: 'features',
      author: 'Lisa Wong',
      replies: 56,
      likes: 123,
      views: 3421,
      lastActive: '5 hours ago',
      trending: true,
    },
  ];

  const filteredTopics = topics.filter((topic) => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
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
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Community Forum</h1>
                  <p className="text-sm text-muted-foreground">Connect with other users</p>
                </div>
              </div>
            </div>
            <Button>
              <Plus className="h-5 w-5" />
              New Topic
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
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
              <h3 className="font-bold mb-3">Community Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Topics</span>
                  <span className="font-medium">248</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium">3,421</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-medium">1,892</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {topic.trending && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning text-xs rounded">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </div>
                            )}
                            <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                              {topic.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {topic.author} • Last active {topic.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {topic.replies} replies
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {topic.likes}
                        </div>
                        <div>{topic.views} views</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
