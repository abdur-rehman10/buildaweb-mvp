import { Home, FolderOpen, Plus, Bell, User } from 'lucide-react';

interface BottomTabBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onCreateProject: () => void;
}

export function BottomTabBar({ currentScreen, onNavigate, onCreateProject }: BottomTabBarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'project-folders', label: 'Projects', icon: FolderOpen },
    { id: 'create', label: 'Create', icon: Plus, isAction: true },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'account-settings', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onCreateProject}
                className="flex flex-col items-center justify-center min-w-[64px] min-h-[56px] -mt-6"
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
