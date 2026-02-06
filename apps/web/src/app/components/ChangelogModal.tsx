import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { X, Sparkles, Zap, Bug, ArrowRight } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  items: {
    type: 'feature' | 'improvement' | 'fix';
    title: string;
    description: string;
  }[];
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [selectedVersion, setSelectedVersion] = useState(0);

  const changelog: ChangelogEntry[] = [
    {
      version: '2.1.0',
      date: 'February 6, 2026',
      items: [
        {
          type: 'feature',
          title: 'Command Palette',
          description: 'Press Cmd+K to quickly navigate anywhere in the app and execute actions.',
        },
        {
          type: 'feature',
          title: 'Dark Mode',
          description: 'Full dark mode support with automatic system detection and manual toggle.',
        },
        {
          type: 'feature',
          title: 'Avatar Upload',
          description: 'Upload custom profile pictures with drag & drop support.',
        },
        {
          type: 'improvement',
          title: 'Loading States',
          description: 'Improved loading animations and skeleton screens throughout the app.',
        },
        {
          type: 'improvement',
          title: 'Keyboard Shortcuts',
          description: 'Added comprehensive keyboard shortcuts for power users.',
        },
      ],
    },
    {
      version: '2.0.0',
      date: 'January 15, 2026',
      items: [
        {
          type: 'feature',
          title: 'AI Assistant',
          description: 'Persistent AI helper to assist with design and content creation.',
        },
        {
          type: 'feature',
          title: 'Team Collaboration',
          description: 'Real-time comments and feedback on your designs.',
        },
        {
          type: 'feature',
          title: 'Version History',
          description: 'Track and restore previous versions of your site.',
        },
        {
          type: 'improvement',
          title: 'Editor Performance',
          description: '3x faster rendering and smoother interactions in the visual editor.',
        },
        {
          type: 'fix',
          title: 'Mobile Responsiveness',
          description: 'Fixed various issues with mobile preview and editing.',
        },
      ],
    },
    {
      version: '1.5.0',
      date: 'December 1, 2025',
      items: [
        {
          type: 'feature',
          title: 'Form Builder',
          description: 'Drag-and-drop form creation with advanced field types.',
        },
        {
          type: 'feature',
          title: 'A/B Testing',
          description: 'Run experiments to optimize your site performance.',
        },
        {
          type: 'improvement',
          title: 'SEO Manager',
          description: 'Enhanced SEO tools with AI-powered suggestions.',
        },
      ],
    },
  ];

  const currentEntry = changelog[selectedVersion];

  const getIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="h-4 w-4 text-primary" />;
      case 'improvement':
        return <Zap className="h-4 w-4 text-warning" />;
      case 'fix':
        return <Bug className="h-4 w-4 text-success" />;
      default:
        return null;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-primary/10 text-primary';
      case 'improvement':
        return 'bg-warning/10 text-warning';
      case 'fix':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl">What's New</h2>
              <p className="text-sm text-muted-foreground">
                Latest updates and improvements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Version Sidebar */}
          <div className="w-48 border-r border-border p-4 space-y-2 overflow-y-auto">
            {changelog.map((entry, index) => (
              <button
                key={entry.version}
                onClick={() => setSelectedVersion(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedVersion === index
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="font-bold text-sm">v{entry.version}</div>
                <div className={`text-xs ${
                  selectedVersion === index ? 'text-primary-foreground/80' : 'text-muted-foreground'
                }`}>
                  {entry.date}
                </div>
              </button>
            ))}
          </div>

          {/* Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-bold text-2xl mb-1">Version {currentEntry.version}</h3>
              <p className="text-sm text-muted-foreground">{currentEntry.date}</p>
            </div>

            <div className="space-y-4">
              {currentEntry.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="mt-0.5">{getIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{item.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getBadgeColor(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {changelog.length} versions • Last updated {changelog[0].date}
          </p>
          <Button onClick={onClose}>
            Got it
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Hook to show changelog on first visit or version update
export function useChangelog() {
  const [showChangelog, setShowChangelog] = useState(false);

  const checkForUpdates = () => {
    const currentVersion = '2.1.0';
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    
    if (lastSeenVersion !== currentVersion) {
      setShowChangelog(true);
    }
  };

  const markAsRead = () => {
    const currentVersion = '2.1.0';
    localStorage.setItem('lastSeenVersion', currentVersion);
    setShowChangelog(false);
  };

  return {
    showChangelog,
    openChangelog: () => setShowChangelog(true),
    closeChangelog: markAsRead,
    checkForUpdates,
  };
}
