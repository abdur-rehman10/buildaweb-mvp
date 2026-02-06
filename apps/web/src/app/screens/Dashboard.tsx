import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Search,
  MoreVertical, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Globe, 
  Clock,
  TrendingUp,
  Eye,
  Zap,
  LayoutGrid,
  List,
  Columns,
  Filter,
  ArrowUpDown,
  Rocket,
  PlayCircle,
  LayoutTemplate,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onLogout: () => void;
}

interface Project {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  lastEdited: string;
  url?: string;
  views: number;
  uptime: number;
  lastPublished?: string;
}

type ViewMode = 'grid' | 'list' | 'compact';
type FilterMode = 'all' | 'published' | 'draft' | 'archived';
type SortMode = 'date' | 'name' | 'views' | 'status';

export function Dashboard({ onSelectProject, onCreateProject, onLogout }: DashboardProps) {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'My Portfolio',
      status: 'published',
      lastEdited: '2 hours ago',
      lastPublished: '2 hours ago',
      url: 'myportfolio.buildaweb.app',
      views: 12543,
      uptime: 99.9,
    },
    {
      id: '2',
      name: 'Coffee Shop Website',
      status: 'draft',
      lastEdited: '1 day ago',
      views: 0,
      uptime: 0,
    },
    {
      id: '3',
      name: 'Tech Startup Landing',
      status: 'published',
      lastEdited: '3 days ago',
      lastPublished: '3 days ago',
      url: 'techstartup.buildaweb.app',
      views: 8921,
      uptime: 100,
    },
    {
      id: '4',
      name: 'Local Business Site',
      status: 'draft',
      lastEdited: '1 week ago',
      views: 0,
      uptime: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: string; projectName: string }>({
    isOpen: false,
    projectId: '',
    projectName: '',
  });

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterMode === 'all' || project.status === filterMode;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'views':
          return b.views - a.views;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return 0; // Keep original order for date
      }
    });

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    draft: projects.filter((p) => p.status === 'draft').length,
    totalViews: projects.reduce((sum, p) => sum + p.views, 0),
  };

  const recentActivity = [
    { id: '1', action: 'Published "My Portfolio"', time: '2 hours ago', type: 'publish' },
    { id: '2', action: 'Updated "Coffee Shop Website"', time: '1 day ago', type: 'edit' },
    { id: '3', action: 'Created "Tech Startup Landing"', time: '3 days ago', type: 'create' },
  ];

  const templates = [
    { id: '1', name: 'Portfolio', icon: '🎨', category: 'Creative' },
    { id: '2', name: 'Business', icon: '💼', category: 'Professional' },
    { id: '3', name: 'E-commerce', icon: '🛍️', category: 'Shop' },
    { id: '4', name: 'Blog', icon: '📝', category: 'Content' },
  ];

  const handleDeleteClick = (projectId: string, projectName: string) => {
    setShowProjectMenu(null);
    setDeleteConfirm({ isOpen: true, projectId, projectName });
  };

  const handleDeleteConfirm = () => {
    toast.success(`"${deleteConfirm.projectName}" has been deleted`);
    setDeleteConfirm({ isOpen: false, projectId: '', projectName: '' });
  };

  const handleDuplicate = (projectId: string, projectName: string) => {
    setShowProjectMenu(null);
    toast.success(`"${projectName}" duplicated successfully`);
  };

  const handlePublish = (projectId: string, projectName: string) => {
    setShowProjectMenu(null);
    toast.success(`"${projectName}" published successfully`);
  };

  // Show empty state for new users
  const isNewUser = projects.length === 0;

  if (isNewUser) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
        <Card className="max-w-2xl w-full p-12 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to Buildaweb!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Start building beautiful websites in minutes with our AI-powered builder
          </p>
          
          {/* Video Tutorial */}
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-lg mb-8 flex items-center justify-center cursor-pointer hover:from-primary/20 hover:to-cyan-500/20 transition-colors">
            <PlayCircle className="h-16 w-16 text-primary" />
          </div>

          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={onCreateProject}>
              <Plus className="h-5 w-5" />
              Create Your First Site
            </Button>
            <Button size="lg" variant="outline">
              <LayoutTemplate className="h-5 w-5" />
              Browse Templates
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Sites</span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Published</span>
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <div className="text-3xl font-bold text-success">{stats.published}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Views</span>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Drafts</span>
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
          <div className="text-3xl font-bold text-warning">{stats.draft}</div>
        </Card>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Sites</h1>
          <p className="text-muted-foreground">Manage and edit your websites</p>
        </div>
        <Button size="lg" onClick={onCreateProject}>
          <Plus className="h-5 w-5" />
          Create New Site
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'archived'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-4 py-2 border border-input rounded-lg bg-background"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="views">Sort by Views</option>
            <option value="status">Sort by Status</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 border border-input rounded-lg p-1">
            {([
              { mode: 'grid', icon: LayoutGrid },
              { mode: 'list', icon: List },
              { mode: 'compact', icon: Columns },
            ] as const).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === mode ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Projects */}
          {filteredProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => { setSearchQuery(''); setFilterMode('all'); }}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                : 'space-y-4'
            }>
              {filteredProjects.map((project) => (
                viewMode === 'list' ? (
                  // List View
                  <Card key={project.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{project.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.lastEdited}
                          </span>
                          {project.status === 'published' && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {project.views.toLocaleString()} views
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {project.uptime}% uptime
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          project.status === 'published' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {project.status}
                        </span>
                        {project.status === 'draft' && (
                          <Button size="sm" onClick={() => handlePublish(project.id, project.name)}>
                            <Rocket className="h-4 w-4" />
                            Publish
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => onSelectProject(project.id)}>
                          Open
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : viewMode === 'compact' ? (
                  // Compact View
                  <Card key={project.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectProject(project.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{project.name}</h3>
                          <p className="text-xs text-muted-foreground">{project.lastEdited}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.status === 'published' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </Card>
                ) : (
                  // Grid View
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div 
                      className="h-48 bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center relative"
                      onClick={() => onSelectProject(project.id)}
                    >
                      <Globe className="h-16 w-16 text-primary/20" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 truncate">{project.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {project.lastEdited}
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowProjectMenu(showProjectMenu === project.id ? null : project.id);
                            }}
                            className="p-1 hover:bg-accent rounded-md transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {showProjectMenu === project.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setShowProjectMenu(null)}
                              />
                              <div className="absolute right-0 top-8 z-20 w-48 bg-card rounded-lg border border-border shadow-lg py-1">
                                {project.status === 'draft' && (
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2" onClick={() => handlePublish(project.id, project.name)}>
                                    <Rocket className="h-4 w-4" />
                                    Publish
                                  </button>
                                )}
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2" onClick={() => handleDuplicate(project.id, project.name)}>
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </button>
                                {project.url && (
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Visit Site
                                  </button>
                                )}
                                <hr className="my-1 border-border" />
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2" onClick={() => handleDeleteClick(project.id, project.name)}>
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      {project.status === 'published' && (
                        <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-muted rounded-lg">
                          <div>
                            <div className="text-xs text-muted-foreground">Views</div>
                            <div className="font-medium">{project.views.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Uptime</div>
                            <div className="font-medium">{project.uptime}%</div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            project.status === 'published' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        {project.url && (
                          <p className="text-xs text-muted-foreground truncate">
                            {project.url}
                          </p>
                        )}
                      </div>

                      <Button 
                        fullWidth 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => onSelectProject(project.id)}
                      >
                        Open Editor
                      </Button>
                    </div>
                  </Card>
                )
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start from Template */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Start from Template</h3>
            </div>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="w-full p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  onClick={onCreateProject}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.category}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button fullWidth variant="outline" className="mt-4">
              View All Templates
            </Button>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'publish' ? 'bg-success/10' :
                    activity.type === 'edit' ? 'bg-primary/10' :
                    'bg-muted'
                  }`}>
                    {activity.type === 'publish' ? <Rocket className="h-4 w-4 text-success" /> :
                     activity.type === 'edit' ? <Zap className="h-4 w-4 text-primary" /> :
                     <Plus className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteConfirm.projectName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: '', projectName: '' })}
      />
    </div>
  );
}