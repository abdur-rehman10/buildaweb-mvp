import { useState, useEffect, useMemo } from 'react';
import { Card } from './Card';
import { 
  Search, 
  Home, 
  Plus, 
  Settings, 
  CreditCard, 
  Users, 
  BarChart3, 
  HelpCircle,
  Palette,
  FileText,
  Globe,
  Image,
  Layout,
  Bell,
  Clock,
  Code,
  Zap,
  TestTube,
  MessageSquare,
  GitBranch,
  Rocket,
  Command
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  keywords: string[];
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Settings' | 'Tools';
}

interface CommandPaletteProps {
  onNavigate?: (screen: string) => void;
  onAction?: (action: string) => void;
}

export function CommandPalette({ onNavigate, onAction }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'dashboard', label: 'Go to Dashboard', description: 'View all your sites', icon: Home, keywords: ['home', 'dashboard', 'sites'], action: () => onNavigate?.('dashboard'), category: 'Navigation' },
    { id: 'editor', label: 'Open Editor', description: 'Edit your website', icon: Layout, keywords: ['edit', 'builder', 'design'], action: () => onNavigate?.('editor'), category: 'Navigation' },
    { id: 'templates', label: 'Browse Templates', description: 'Start from a template', icon: FileText, keywords: ['templates', 'start', 'new'], action: () => onNavigate?.('templates'), category: 'Navigation' },
    { id: 'analytics', label: 'View Analytics', description: 'Site performance', icon: BarChart3, keywords: ['analytics', 'stats', 'metrics'], action: () => onNavigate?.('analytics'), category: 'Navigation' },
    { id: 'team', label: 'Team Settings', description: 'Manage team members', icon: Users, keywords: ['team', 'members', 'collaborate'], action: () => onNavigate?.('team'), category: 'Navigation' },
    { id: 'billing', label: 'Billing & Plans', description: 'Manage subscription', icon: CreditCard, keywords: ['billing', 'payment', 'upgrade', 'plan'], action: () => onNavigate?.('billing'), category: 'Navigation' },
    { id: 'help', label: 'Help & Support', description: 'Get help', icon: HelpCircle, keywords: ['help', 'support', 'docs'], action: () => onNavigate?.('help'), category: 'Navigation' },
    
    // Actions
    { id: 'new-site', label: 'Create New Site', description: 'Start a new project', icon: Plus, keywords: ['new', 'create', 'site', 'project'], action: () => onNavigate?.('new-project'), category: 'Actions' },
    { id: 'publish', label: 'Publish Site', description: 'Make your site live', icon: Rocket, keywords: ['publish', 'deploy', 'live'], action: () => onAction?.('publish'), category: 'Actions' },
    { id: 'save', label: 'Save Changes', description: 'Save your work', icon: Zap, keywords: ['save'], action: () => onAction?.('save'), category: 'Actions' },
    
    // Settings
    { id: 'account', label: 'Account Settings', description: 'Manage your account', icon: Settings, keywords: ['account', 'settings', 'profile'], action: () => onNavigate?.('account-settings'), category: 'Settings' },
    { id: 'site-settings', label: 'Site Settings', description: 'Configure your site', icon: Globe, keywords: ['site', 'settings', 'config'], action: () => onNavigate?.('site-settings'), category: 'Settings' },
    { id: 'notifications', label: 'Notifications', description: 'Manage notifications', icon: Bell, keywords: ['notifications', 'alerts'], action: () => onNavigate?.('notifications'), category: 'Settings' },
    
    // Tools
    { id: 'pages', label: 'Page Manager', description: 'Manage pages', icon: FileText, keywords: ['pages', 'manage'], action: () => onNavigate?.('page-manager'), category: 'Tools' },
    { id: 'media', label: 'Media Library', description: 'Upload & manage media', icon: Image, keywords: ['media', 'images', 'files'], action: () => onNavigate?.('media-library'), category: 'Tools' },
    { id: 'styles', label: 'Global Styles', description: 'Design system', icon: Palette, keywords: ['styles', 'colors', 'fonts', 'theme'], action: () => onNavigate?.('global-styles'), category: 'Tools' },
    { id: 'seo', label: 'SEO Manager', description: 'Optimize for search', icon: Search, keywords: ['seo', 'search', 'optimize'], action: () => onNavigate?.('seo-manager'), category: 'Tools' },
    { id: 'integrations', label: 'Integrations', description: 'Connect tools', icon: Zap, keywords: ['integrations', 'connect', 'tools'], action: () => onNavigate?.('integrations'), category: 'Tools' },
    { id: 'versions', label: 'Version History', description: 'View past versions', icon: GitBranch, keywords: ['versions', 'history', 'backup'], action: () => onNavigate?.('version-history'), category: 'Tools' },
    { id: 'forms', label: 'Form Builder', description: 'Create forms', icon: FileText, keywords: ['forms', 'contact'], action: () => onNavigate?.('form-builder'), category: 'Tools' },
    { id: 'ab-testing', label: 'A/B Testing', description: 'Run experiments', icon: TestTube, keywords: ['ab', 'testing', 'experiments'], action: () => onNavigate?.('ab-testing'), category: 'Tools' },
    { id: 'comments', label: 'Comments', description: 'Team feedback', icon: MessageSquare, keywords: ['comments', 'feedback'], action: () => onNavigate?.('comments'), category: 'Tools' },
    { id: 'activity', label: 'Activity Log', description: 'Recent changes', icon: Clock, keywords: ['activity', 'log', 'history'], action: () => onNavigate?.('activity-log'), category: 'Tools' },
    { id: 'domain', label: 'Domain Wizard', description: 'Setup custom domain', icon: Globe, keywords: ['domain', 'dns', 'custom'], action: () => onNavigate?.('domain-wizard'), category: 'Tools' },
  ], [onNavigate, onAction]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    
    const searchLower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(keyword => keyword.includes(searchLower))
    );
  }, [search, commands]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      // Arrow navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }

      // Enter to execute
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-[15vh]"
      onClick={() => {
        setIsOpen(false);
        setSearch('');
      }}
    >
      <Card 
        className="w-full max-w-2xl max-h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No results found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase">
                  {category}
                </div>
                {items.map((cmd, idx) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors ${
                        globalIndex === selectedIndex ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground">{cmd.description}</div>
                        )}
                      </div>
                      {globalIndex === selectedIndex && (
                        <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
              <span>Select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K to open</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
