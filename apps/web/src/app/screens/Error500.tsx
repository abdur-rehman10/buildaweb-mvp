import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { RefreshCw, Home, MessageCircle, AlertTriangle } from 'lucide-react';

interface Error500Props {
  onNavigateHome: () => void;
  onRetry?: () => void;
}

export function Error500({ onNavigateHome, onRetry }: Error500Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#FFE5E5] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* 500 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[200px] font-bold text-destructive/10 leading-none">500</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="h-24 w-24 text-destructive/40 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold mb-4">Something Went Wrong</h1>
        <p className="text-lg text-muted-foreground mb-8">
          We're experiencing technical difficulties. Our team has been notified and is working on a fix.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <Button variant="outline" size="lg" onClick={onRetry}>
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
          )}
          <Button size="lg" onClick={onNavigateHome}>
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-border">
          <h3 className="font-bold mb-2">Need immediate help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team if the problem persists
          </p>
          <Button variant="outline">
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
