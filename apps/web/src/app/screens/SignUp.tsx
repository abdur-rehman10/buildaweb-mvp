import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ApiError } from '../../lib/api';
import { signup } from '../../lib/auth-service';
import { appToast } from '../../lib/toast';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';

interface SignUpProps {
  onNavigateToLogin: () => void;
  onSignUp: () => void;
}

export function SignUp({ onNavigateToLogin, onSignUp }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await signup(email, password);
      appToast.success('Account created successfully!', {
        eventKey: 'auth-signup-success',
      });
      onSignUp();
    } catch (err) {
      const message =
        err instanceof ApiError && err.code === 'EMAIL_ALREADY_EXISTS'
          ? 'An account with this email already exists.'
          : getUserFriendlyErrorMessage(err, 'Sign up failed');
      setSubmitError(message);
      appToast.error(message, {
        eventKey: 'auth-signup-error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] p-12 flex-col justify-between text-white">
        <Logo size="lg" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-muted-foreground">Start building beautiful websites today</p>
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
                  setErrors({ ...errors, email: undefined });
                  if (submitError) setSubmitError('');
                }}
                error={errors.email}
              />
              <Mail className="absolute right-3 top-[38px] h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: undefined });
                  if (submitError) setSubmitError('');
                }}
                error={errors.password}
              />
              <Lock className="absolute right-10 top-[38px] h-5 w-5 text-muted-foreground pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="font-medium text-primary hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
