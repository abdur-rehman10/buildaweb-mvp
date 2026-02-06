import { Button } from './Button';
import { FileQuestion, Inbox, Search, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'inbox' | 'search' | 'error' | 'image' | 'question';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon = 'inbox', 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  const icons = {
    inbox: Inbox,
    search: Search,
    error: AlertCircle,
    image: ImageIcon,
    question: FileQuestion,
  };

  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && (
        <div className="flex gap-3">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specific empty states for common scenarios
export function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon="inbox"
      title="No projects yet"
      description="Create your first project to get started building amazing websites"
      action={{
        label: "Create Project",
        onClick: onCreate,
      }}
    />
  );
}

export function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for"
      action={{
        label: "Clear Filters",
        onClick: onClear,
      }}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="inbox"
      title="No notifications"
      description="You're all caught up! We'll notify you when something important happens"
    />
  );
}
