import { ButtonHTMLAttributes, forwardRef, ReactNode, memo } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  touchFriendly?: boolean; // Ensures minimum 44px height for mobile
}

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, children, disabled, touchFriendly, ...props }, ref) => {
      return (
        <button
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)]',
            'transition-all duration-200 ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'active:scale-95',
            {
              'bg-primary text-primary-foreground hover:bg-[#7C3AED] hover:shadow-lg hover:shadow-primary/25': variant === 'primary',
              'bg-secondary text-secondary-foreground hover:bg-[#0891B2] hover:shadow-lg hover:shadow-secondary/25': variant === 'secondary',
              'border border-border bg-background hover:bg-accent hover:border-primary/50': variant === 'outline',
              'hover:bg-accent hover:text-foreground': variant === 'ghost',
              'bg-destructive text-destructive-foreground hover:bg-red-600 hover:shadow-lg hover:shadow-destructive/25': variant === 'destructive',
              'h-8 px-3 text-sm': size === 'sm' && !touchFriendly,
              'h-10 px-4': size === 'md' && !touchFriendly,
              'h-12 px-6 text-lg': size === 'lg',
              'min-h-[44px] px-4': touchFriendly && size !== 'lg', // Touch-friendly size (44px minimum)
              'w-full': fullWidth,
            },
            className
          )}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';