// Page transition wrapper component
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [transitionKey]);

  return (
    <div
      className={`transition-all duration-300 ${
        isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      {children}
    </div>
  );
}

// Fade transition
export function FadeTransition({ children, isVisible }: { children: ReactNode; isVisible: boolean }) {
  return (
    <div
      className={`transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
}

// Slide transition
export function SlideTransition({ 
  children, 
  isVisible,
  direction = 'right' 
}: { 
  children: ReactNode; 
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
}) {
  const directions = {
    left: 'translate-x-full',
    right: '-translate-x-full',
    up: 'translate-y-full',
    down: '-translate-y-full',
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? 'translate-x-0 translate-y-0 opacity-100' : `${directions[direction]} opacity-0`
      }`}
    >
      {children}
    </div>
  );
}

// Scale transition
export function ScaleTransition({ children, isVisible }: { children: ReactNode; isVisible: boolean }) {
  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      {children}
    </div>
  );
}
