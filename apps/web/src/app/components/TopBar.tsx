import { Search, Bell, User } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface TopBarProps {
  currentScreen: string;
  onSearch: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onNavigate?: (screen: string) => void;
}

export function TopBar({ currentScreen, onSearch, onNotifications, onProfile, onNavigate }: TopBarProps) {
  const getScreenTitle = (screen: string): string => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'onboarding': 'Getting Started',
      'templates': 'Templates',
      'editor': 'Site Editor',
      'analytics': 'Analytics',
      'team': 'Team',
      'billing': 'Billing',
      'account-settings': 'Account Settings',
      'help': 'Help Center',
      'notifications': 'Notifications',
      'page-manager': 'Page Manager',
      'media-library': 'Media Library',
      'global-styles': 'Global Styles',
      'site-settings': 'Site Settings',
      'preview-publish': 'Preview & Publish',
      'new-project': 'New Project',
      'domain-wizard': 'Domain Setup',
      'activity-log': 'Activity Log',
      'seo-manager': 'SEO Manager',
      'integrations': 'Integrations',
      'version-history': 'Version History',
      'form-builder': 'Form Builder',
      'ab-testing': 'A/B Testing',
      'comments': 'Comments',
      'project-settings': 'Project Settings',
      'trash': 'Trash',
      'project-folders': 'Project Folders',
    };
    return titles[screen] || 'Buildaweb';
  };

  const getBreadcrumbs = (screen: string) => {
    const paths = [{ label: 'Home', href: 'dashboard' }];
    
    // Add context-specific breadcrumbs
    if (screen.includes('editor') || screen.includes('page-') || screen.includes('media-') || screen.includes('global-') || screen.includes('site-')) {
      paths.push({ label: 'Project', href: 'editor' });
    }
    
    if (screen !== 'dashboard') {
      paths.push({ label: getScreenTitle(screen), href: screen });
    }
    
    return paths;
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex-1">
        <Breadcrumbs paths={getBreadcrumbs(currentScreen)} onNavigate={onNavigate} />
      </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={onSearch}
          className="h-9 px-3 rounded-lg border border-input bg-background hover:bg-accent transition-colors flex items-center gap-2"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search...</span>
          <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center gap-1 rounded border bg-muted text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={onNotifications}
          className="h-9 w-9 rounded-lg border border-input bg-background hover:bg-accent transition-colors flex items-center justify-center relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={onProfile}
          className="h-9 w-9 rounded-lg border border-input bg-background hover:bg-accent transition-colors flex items-center justify-center"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}