import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { CheckCircle, ArrowRight, Lock } from 'lucide-react';

interface PasswordResetSuccessProps {
  onNavigateToLogin: () => void;
}

export function PasswordResetSuccess({ onNavigateToLogin }: PasswordResetSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E0E7FF] dark:from-gray-900 dark:to-purple-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <Logo size="lg" />
          </div>
        </div>

        <Card className="p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-4 border-card">
                <Lock className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-3">Password Reset Successful!</h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
          </div>

          {/* Security Tips */}
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-sm mb-2 text-blue-900 dark:text-blue-100">
              Security Tips
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use a unique password for each account</li>
              <li>• Enable two-factor authentication</li>
              <li>• Never share your password with anyone</li>
            </ul>
          </Card>

          {/* Action Button */}
          <Button 
            fullWidth 
            size="lg" 
            onClick={onNavigateToLogin}
            className="mb-4"
          >
            Continue to Login
            <ArrowRight className="h-5 w-5" />
          </Button>

          {/* Additional Info */}
          <p className="text-xs text-center text-muted-foreground">
            If you didn't request this password reset, please{' '}
            <a href="#" className="text-primary hover:underline">
              contact support
            </a>{' '}
            immediately.
          </p>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help?{' '}
          <a href="#" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
