import { useState, useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface ContextualTooltip {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface ContextualTooltipsProps {
  currentScreen: string;
}

export function ContextualTooltips({ currentScreen }: ContextualTooltipsProps) {
  const [activeTip, setActiveTip] = useState<ContextualTooltip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  const tooltips: Record<string, ContextualTooltip[]> = {
    dashboard: [
      {
        id: 'dashboard-create',
        target: 'create-button',
        title: 'Create Your First Site',
        description: 'Click here to start building with AI assistance or choose from templates',
        position: 'left',
      },
      {
        id: 'dashboard-views',
        target: 'view-toggle',
        title: 'Change View Mode',
        description: 'Switch between grid, list, or compact view to organize your projects',
        position: 'bottom',
      },
    ],
    editor: [
      {
        id: 'editor-components',
        target: 'component-library',
        title: 'Component Library',
        description: 'Drag components from here to build your page',
        position: 'right',
      },
      {
        id: 'editor-layers',
        target: 'layers-panel',
        title: 'Layers Panel',
        description: 'View and manage your page structure here',
        position: 'right',
      },
      {
        id: 'editor-styles',
        target: 'style-inspector',
        title: 'Style Inspector',
        description: 'Customize colors, fonts, spacing and more',
        position: 'left',
      },
      {
        id: 'editor-shortcuts',
        target: 'keyboard-hint',
        title: 'Keyboard Shortcuts',
        description: 'Press ? to see all available shortcuts',
        position: 'top',
      },
    ],
    'preview-publish': [
      {
        id: 'publish-seo',
        target: 'seo-settings',
        title: 'SEO Settings',
        description: 'Optimize your site for search engines before publishing',
        position: 'bottom',
      },
    ],
  };

  useEffect(() => {
    // Show first non-dismissed tip for current screen
    const screenTips = tooltips[currentScreen] || [];
    const nextTip = screenTips.find((tip) => !dismissedTips.includes(tip.id));
    
    if (nextTip) {
      const timer = setTimeout(() => {
        setActiveTip(nextTip);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, dismissedTips]);

  const handleDismiss = () => {
    if (activeTip) {
      setDismissedTips([...dismissedTips, activeTip.id]);
      setActiveTip(null);
    }
  };

  if (!activeTip) return null;

  return (
    <div className="fixed top-20 right-6 z-50 w-80 animate-in slide-in-from-right">
      <div className="bg-card border border-primary shadow-2xl rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">{activeTip.title}</h3>
            <p className="text-sm text-muted-foreground">{activeTip.description}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Don't show again
          </button>
          <Button size="sm" onClick={handleDismiss}>
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
