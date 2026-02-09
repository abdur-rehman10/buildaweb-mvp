import { useState } from 'react';
import { ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { authApi } from '../../lib/api';
import { appToast, toApiErrorMessage } from '../../lib/toast';

interface ResetPasswordProps {
  initialToken?: string;
  onNavigateToLogin: () => void;
}

export function ResetPassword({ initialToken, onNavigateToLogin }: ResetPasswordProps) {
  const [token, setToken] = useState(initialToken ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let hasError = false;
    if (!token.trim()) {
      setTokenError('Token is required');
      hasError = true;
    } else {
      setTokenError('');
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token: token.trim(), newPassword });
      appToast.success('Password reset successfully. Please log in.');
      onNavigateToLogin();
    } catch (err) {
      appToast.error(toApiErrorMessage(err, 'Unable to reset password.'), {
        eventKey: 'reset-password-error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-3xl font-bold mb-2">Set a new password</h2>
          <p className="text-muted-foreground">Enter your reset token and choose a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              label="Reset token"
              placeholder="Paste your reset token"
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                setTokenError('');
              }}
              error={tokenError}
            />
            <KeyRound className="absolute right-3 top-[38px] h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordError('');
              }}
              error={passwordError}
            />
            <Lock className="absolute right-3 top-[38px] h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
