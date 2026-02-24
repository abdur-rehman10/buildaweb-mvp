import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ApiError } from '../../lib/api';
import { login } from '../../lib/auth-service';
import { appToast } from '../../lib/toast';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';

interface LoginProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onLogin: () => void;
}

export function Login({ onNavigateToSignUp, onNavigateToForgotPassword, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await login(email, password);
      appToast.success('Logged in successfully!', {
        eventKey: 'auth-login-success',
      });
      onLogin();
    } catch (err) {
      const message =
        err instanceof ApiError && err.code === 'INVALID_CREDENTIALS'
          ? 'Invalid email or password.'
          : getUserFriendlyErrorMessage(err, 'Login failed');
      setSubmitError(message);
      appToast.error(message, {
        eventKey: 'auth-login-error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] p-12 flex-col justify-between text-white">
        <Logo size="lg" />
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-lg opacity-90">Continue building amazing websites with AI-powered tools.</p>
        </div>
        <div className="flex gap-4 text-sm opacity-75">
          <span>© 2026 Buildaweb</span>
          <span>•</span>
          <a href="#" className="hover:opacity-100">Terms</a>
          <span>•</span>
          <a href="#" className="hover:opacity-100">Privacy</a>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Log in to your account</h2>
            <p className="text-muted-foreground">Enter your credentials to continue</p>
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
                placeholder="Enter your password"
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

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
