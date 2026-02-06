import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showHomeButton?: boolean;
}

export function ErrorState({ 
  title = "Something went wrong",
  message, 
  onRetry,
  onGoHome,
  showHomeButton = true 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {showHomeButton && onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Inline error for forms and smaller components
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-destructive font-medium">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Toast-style error notification
export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom">
      <div className="bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg max-w-md flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm flex-1">{message}</p>
        <button onClick={() => setIsVisible(false)} className="hover:opacity-80">
          ×
        </button>
      </div>
    </div>
  );
}
