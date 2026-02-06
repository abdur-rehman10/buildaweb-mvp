import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit2,
  Copy,
  Trash2,
  ExternalLink,
  Menu
} from 'lucide-react';

interface PageManagerProps {
  projectId: string;
  onBack: () => void;
}

interface Page {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
}

interface NavItem {
  id: string;
  label: string;
  targetPage: string;
}

export function PageManager({ projectId, onBack }: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([
    { id: '1', name: 'Home', slug: '/', isHome: true },
    { id: '2', name: 'About', slug: '/about', isHome: false },
    { id: '3', name: 'Services', slug: '/services', isHome: false },
    { id: '4', name: 'Contact', slug: '/contact', isHome: false },
  ]);

  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: '1', label: 'Home', targetPage: '1' },
    { id: '2', label: 'About', targetPage: '2' },
    { id: '3', label: 'Services', targetPage: '3' },
    { id: '4', label: 'Contact', targetPage: '4' },
  ]);

  const [editingPage, setEditingPage] = useState<string | null>(null);

  const handleAddPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      name: 'New Page',
      slug: '/new-page',
      isHome: false,
    };
    setPages([...pages, newPage]);
    toast.success('Page added successfully!');
  };

  const handleDuplicatePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      const newPage: Page = {
        ...page,
        id: Date.now().toString(),
        name: `${page.name} (Copy)`,
        slug: `${page.slug}-copy`,
        isHome: false,
      };
      setPages([...pages, newPage]);
      toast.success('Page duplicated successfully!');
    }
  };

  const handleDeletePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page?.isHome) {
      toast.error('Cannot delete the home page');
      return;
    }
    setPages(pages.filter(p => p.id !== pageId));
    toast.success('Page deleted successfully!');
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
              Back to Editor
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Pages & Navigation</h1>
          <p className="text-muted-foreground">Manage your site's pages and navigation menu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg">Pages</h2>
                <Button size="sm" onClick={handleAddPage}>
                  <Plus className="h-4 w-4" />
                  Add Page
                </Button>
              </div>
              <div className="divide-y divide-border">
                {pages.map((page) => (
                  <div key={page.id} className="p-4 flex items-center gap-4 hover:bg-accent transition-colors">
                    <button className="cursor-grab hover:text-primary">
                      <GripVertical className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      {editingPage === page.id ? (
                        <div className="space-y-2">
                          <Input
                            defaultValue={page.name}
                            className="h-9"
                            onBlur={() => setEditingPage(null)}
                          />
                          <Input
                            defaultValue={page.slug}
                            className="h-9 font-mono text-sm"
                            onBlur={() => setEditingPage(null)}
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{page.name}</span>
                            {page.isHome && (
                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                Home
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">{page.slug}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingPage(page.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDuplicatePage(page.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePage(page.id)}
                        disabled={page.isHome}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Navigation Menu */}
          <div>
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Menu className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Navigation Menu</h2>
                </div>
                <p className="text-sm text-muted-foreground">Configure your site's navigation</p>
              </div>
              <div className="p-6 space-y-4">
                {navItems.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <label className="block text-sm font-medium">Label</label>
                    <Input defaultValue={item.label} className="h-9" />
                    <label className="block text-sm font-medium">Page</label>
                    <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                        </option>
                      ))}
                      <option value="external">External URL</option>
                    </select>
                  </div>
                ))}
                <Button variant="outline" fullWidth size="sm">
                  <Plus className="h-4 w-4" />
                  Add Nav Item
                </Button>
              </div>
              <div className="p-6 border-t border-border">
                <h3 className="font-medium mb-3">CTA Button</h3>
                <div className="space-y-3">
                  <Input placeholder="Button text" defaultValue="Get Started" className="h-9" />
                  <Input placeholder="Button URL" defaultValue="https://example.com" className="h-9" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={() => {
            toast.success('Changes saved successfully!');
            onBack();
          }}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
