import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Small delay to prevent flash for quick transitions
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

// Mini loading spinner for inline use
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}
