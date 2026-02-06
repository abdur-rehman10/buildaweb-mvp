import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Home, Search, ArrowLeft } from 'lucide-react';

interface Error404Props {
  onNavigateHome: () => void;
  onNavigateBack?: () => void;
}

export function Error404({ onNavigateHome, onNavigateBack }: Error404Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E0E7FF] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[200px] font-bold text-primary/10 leading-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-24 w-24 text-primary/40 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onNavigateBack && (
            <Button variant="outline" size="lg" onClick={onNavigateBack}>
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>
          )}
          <Button size="lg" onClick={onNavigateHome}>
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground mt-8">
          If you believe this is a mistake, please{' '}
          <a href="#" className="text-primary hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
