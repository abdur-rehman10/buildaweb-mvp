import { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  FolderOpen, 
  LayoutTemplate, 
  Images,
  BarChart3, 
  Users,
  Settings,
  CreditCard,
  HelpCircle,
  Bell,
  LogOut
} from 'lucide-react';

interface MobileNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function MobileNav({ currentScreen, onNavigate, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'project-folders', label: 'Projects', icon: FolderOpen },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'assets', label: 'Assets', icon: Images },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const bottomNav = [
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'account-settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-card border border-border rounded-lg shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-40 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-cyan-500" />
              <div>
                <h2 className="font-bold text-lg">Buildaweb</h2>
                <p className="text-xs text-muted-foreground">AI Website Builder</p>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Main
              </p>
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Settings
              </p>
              {bottomNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
