import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

export function ForgotPassword({ onNavigateToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }

    toast.success('Password reset email sent!');
    setSubmitted(true);
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
            We've sent a password reset link to <strong>{email}</strong>
          </p>

          <div className="space-y-4">
            <Button fullWidth size="lg" onClick={onNavigateToLogin}>
              Back to login
            </Button>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  toast.success('Email resent!');
                }}
                className="font-medium text-primary hover:underline"
              >
                Resend
              </button>
            </p>
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
                setError('');
              }}
              error={error}
            />
            <Mail className="absolute right-3 top-[38px] h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>

          <Button type="submit" fullWidth size="lg">
            Send reset link
          </Button>
        </form>
      </div>
    </div>
  );
}
