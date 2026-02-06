import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { CheckCircle, Circle, X, Trophy, Sparkles, ArrowRight } from 'lucide-react';

interface LaunchChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: string;
  screen: string;
}

export function LaunchChecklist({ isOpen, onClose, onNavigate }: LaunchChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Create your first page',
      description: 'Add content and design your homepage',
      completed: true,
      action: 'Edit pages',
      screen: 'page-manager',
    },
    {
      id: '2',
      title: 'Customize your design',
      description: 'Apply colors, fonts, and branding',
      completed: true,
      action: 'Open editor',
      screen: 'editor',
    },
    {
      id: '3',
      title: 'Set up SEO',
      description: 'Add meta tags and optimize for search',
      completed: false,
      action: 'Configure SEO',
      screen: 'seo-manager',
    },
    {
      id: '4',
      title: 'Connect a custom domain',
      description: 'Use your own domain name',
      completed: false,
      action: 'Add domain',
      screen: 'domain-wizard',
    },
    {
      id: '5',
      title: 'Publish your site',
      description: 'Make your website live to the world',
      completed: false,
      action: 'Publish now',
      screen: 'preview-publish',
    },
  ]);

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progress = (completedCount / totalCount) * 100;

  const handleItemClick = (item: ChecklistItem) => {
    onNavigate(item.screen);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">5 Steps to Launch 🚀</h2>
              <p className="text-muted-foreground">
                Complete these steps to get your website live
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {completedCount} of {totalCount} completed
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  item.completed
                    ? 'border-success/20 bg-success/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent cursor-pointer'
                }`}
                onClick={() => !item.completed && handleItemClick(item)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="h-6 w-6 text-success" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3
                      className={`font-bold mb-1 ${
                        item.completed ? 'text-muted-foreground line-through' : ''
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    {!item.completed && (
                      <Button size="sm" variant="outline">
                        {item.action}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {progress === 100 && (
            <div className="bg-gradient-to-br from-primary/10 to-cyan-500/10 border-2 border-primary/20 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Congratulations! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                You've completed all steps! Your website is ready to launch.
              </p>
              <Button size="lg" onClick={() => handleItemClick(items[4])}>
                <Sparkles className="h-5 w-5" />
                View Your Site
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}