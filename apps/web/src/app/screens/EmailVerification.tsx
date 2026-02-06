import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { CheckCircle, Mail, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailVerificationProps {
  onVerified: () => void;
  onResendEmail?: () => void;
}

export function EmailVerification({ onVerified, onResendEmail }: EmailVerificationProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Simulate email verification
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    if (onResendEmail) {
      onResendEmail();
    }
    toast.success('Verification email sent!');
    setCanResend(false);
    setCountdown(60);
  };

  const handleContinue = () => {
    onVerified();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <Card>
          <div className="p-8 text-center">
            {/* Status Icon */}
            <div className="mb-6">
              {status === 'verifying' && (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto animate-scale-in">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
              )}
              {status === 'error' && (
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
              )}
            </div>

            {/* Content */}
            {status === 'verifying' && (
              <>
                <h1 className="text-2xl font-bold mb-3">Verifying Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  Please wait while we confirm your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <h1 className="text-2xl font-bold mb-3">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">
                  Your email has been successfully verified. You can now access all features.
                </p>
                <Button size="lg" fullWidth onClick={handleContinue}>
                  Continue to Dashboard
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <h1 className="text-2xl font-bold mb-3">Verification Failed</h1>
                <p className="text-muted-foreground mb-6">
                  The verification link is invalid or has expired. Please request a new one.
                </p>
                <Button 
                  size="lg" 
                  fullWidth 
                  onClick={handleResend}
                  disabled={!canResend}
                >
                  <Mail className="h-4 w-4" />
                  {canResend ? 'Resend Verification Email' : `Resend in ${countdown}s`}
                </Button>
              </>
            )}
          </div>

          {/* Help Section */}
          {status === 'verifying' && (
            <div className="px-8 pb-8 border-t border-border pt-6 mt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend}
                >
                  <Mail className="h-4 w-4" />
                  {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Additional Help */}
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
