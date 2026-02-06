import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailChangeConfirmationProps {
  newEmail?: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

export function EmailChangeConfirmation({ 
  newEmail = 'newemail@example.com',
  onConfirmed,
  onCancel 
}: EmailChangeConfirmationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      toast.success('Email verified successfully!');
      onConfirmed();
    }, 2000);
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      toast.success('Verification email resent!');
    }, 1000);
  };

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
          {/* Mail Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-3">Verify Your New Email</h1>
            <p className="text-muted-foreground mb-4">
              We've sent a verification link to:
            </p>
            <div className="bg-muted px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">{newEmail}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to confirm your new email address.
            </p>
          </div>

          {/* Instructions */}
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm mb-1 text-blue-900 dark:text-blue-100">
                  Important
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Check your spam/junk folder if you don't see the email</li>
                  <li>• The verification link expires in 24 hours</li>
                  <li>• Your old email will remain active until verified</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3 mb-4">
            <Button 
              fullWidth 
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  I've Clicked the Link
                </>
              )}
            </Button>

            <Button 
              fullWidth 
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button 
              fullWidth 
              variant="ghost"
              onClick={onCancel}
            >
              Cancel Email Change
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-muted-foreground">
            Wrong email address?{' '}
            <button 
              onClick={onCancel}
              className="text-primary hover:underline"
            >
              Go back and change it
            </button>
          </p>
        </Card>

        {/* Support Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Having trouble?{' '}
          <a href="#" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
