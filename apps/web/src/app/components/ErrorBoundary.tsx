import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Logo } from './Logo';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You could log to an error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#FFE5E5] dark:from-gray-900 dark:to-red-950 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Logo size="lg" />
            </div>

            {/* Error Illustration */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-16 w-16 text-destructive animate-pulse" />
                </div>
              </div>
            </div>

            {/* Content */}
            <h1 className="text-4xl font-bold mb-4">Oops! Something Went Wrong</h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={this.handleReset}>
                <RefreshCw className="h-5 w-5" />
                Try Again
              </Button>
              <Button variant="outline" size="lg" onClick={this.handleReload}>
                <Home className="h-5 w-5" />
                Reload Page
              </Button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Card className="mt-8 text-left">
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-lg text-destructive">Error Details (Dev Only)</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2">Error Message:</p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <p className="text-sm font-bold mb-2">Component Stack:</p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Help Text */}
            <p className="text-sm text-muted-foreground mt-8">
              If the problem persists, please{' '}
              <a href="#" className="text-primary hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
