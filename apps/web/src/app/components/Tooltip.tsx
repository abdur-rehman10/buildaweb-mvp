import { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface TooltipProps {
  id: string;
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  dismissible?: boolean;
}

export function Tooltip({
  id,
  content,
  children,
  position = 'top',
  showOnce = false,
  dismissible = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if tooltip was already shown
    if (showOnce) {
      const shown = localStorage.getItem(`tooltip-${id}-shown`);
      if (shown) {
        setIsDismissed(true);
      }
    }
  }, [id, showOnce]);

  const handleMouseEnter = () => {
    if (isDismissed) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    if (showOnce) {
      localStorage.setItem(`tooltip-${id}-shown`, 'true');
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-card border-x-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-card border-x-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-card border-y-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-card border-y-transparent border-l-transparent';
    }
  };

  if (isDismissed) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${getPositionClasses()} animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{content}</p>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="p-0.5 hover:bg-accent rounded transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
        </div>
      )}
    </div>
  );
}
