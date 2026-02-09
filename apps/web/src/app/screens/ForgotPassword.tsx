import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../../lib/api';
import { appToast, toApiErrorMessage } from '../../lib/toast';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
  onNavigateToResetPassword: (token?: string) => void;
}

export function ForgotPassword({ onNavigateToLogin, onNavigateToResetPassword }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [debugResetToken, setDebugResetToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitError('');
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword({ email });
      setDebugResetToken(response.debugResetToken ?? '');
      setSubmitted(true);
      appToast.success('If an account exists, you will receive a reset link.', {
        eventKey: 'forgot-password-success',
      });
    } catch (err) {
      const message = toApiErrorMessage(err, 'Unable to send reset request.');
      setSubmitError(message);
      appToast.error(message, {
        eventKey: 'forgot-password-error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-8">
            If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.
          </p>

          {debugResetToken && (
            <div className="text-left rounded-lg border border-border bg-muted/40 p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-2">Development token (not shown in production):</p>
              <code className="text-xs break-all">{debugResetToken}</code>
            </div>
          )}

          <div className="space-y-4">
            <Button fullWidth size="lg" onClick={onNavigateToLogin}>
              Back to login
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => onNavigateToResetPassword(debugResetToken || undefined)}
            >
              I have a reset token
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <button
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Reset your password</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
                if (submitError) setSubmitError('');
              }}
              error={emailError}
            />
            <Mail className="absolute right-3 top-[38px] h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </div>
    </div>
  );
}
