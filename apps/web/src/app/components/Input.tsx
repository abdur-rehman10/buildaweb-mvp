import { InputHTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, success, helperText, ...props }, ref) => {
      const hasError = !!error;
      const hasSuccess = !!success && !hasError;

      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-medium mb-2">
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          <div className="relative">
            <input
              ref={ref}
              className={cn(
                'w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-input-background text-foreground',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors',
                hasError && 'border-destructive focus-visible:ring-destructive',
                hasSuccess && 'border-success focus-visible:ring-success',
                !hasError && !hasSuccess && 'border-input',
                className
              )}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${props.id}-error` : 
                success ? `${props.id}-success` : 
                helperText ? `${props.id}-helper` : 
                undefined
              }
              {...props}
            />
            {hasError && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
            )}
            {hasSuccess && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
            )}
          </div>
          {error && (
            <p id={`${props.id}-error`} className="mt-1 text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
          {success && !error && (
            <p id={`${props.id}-success`} className="mt-1 text-sm text-success flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p id={`${props.id}-helper`} className="mt-1 text-sm text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';