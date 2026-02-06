import { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const maxPull = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.min(currentY - startY.current, maxPull);

    if (distance > 0) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    setIsPulling(false);

    if (pullDistance >= maxPull && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const pullProgress = Math.min(pullDistance / maxPull, 1);
  const rotation = pullProgress * 360;
  const opacity = pullProgress;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none transition-opacity"
        style={{
          height: `${pullDistance}px`,
          opacity,
        }}
      >
        <div
          className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
          }}
        >
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
