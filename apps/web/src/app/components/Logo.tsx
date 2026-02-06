import { Sparkles } from 'lucide-react';
import { memo } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = memo(function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      <Sparkles className={sizeClasses[size]} />
      {showText && (
        <span className={`font-bold text-secondary ${textSizeClasses[size]}`}>
          Buildaweb
        </span>
      )}
    </div>
  );
});