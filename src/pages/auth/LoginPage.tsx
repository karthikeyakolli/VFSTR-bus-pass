import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { APP_CONFIG } from '@/config/app.config';
import { Bus, Eye, EyeOff, GraduationCap, Lock, UserCheck, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Registration Roll Number / Staff ID is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const { login } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '251FA04564',
      password: '251FA04564',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (data.password === 'error') {
        setIsLoading(false);
        setAuthError('Invalid credentials. Please check your Roll Number / Email and password.');
        toast.error('Authentication Failed', 'Invalid credentials provided.');
        return;
      }

      await login('student', data.identifier, data.rememberMe);

      setIsLoading(false);
      setAuthSuccess(`Authentication successful! Redirecting to Student Portal...`);
      toast.success('Login Successful', `Welcome back to ${APP_CONFIG.shortName}`);

      setTimeout(() => {
        if (redirectTarget) {
          navigate(decodeURIComponent(redirectTarget));
        } else {
          navigate('/student');
        }
      }, 800);
    } catch (err) {
      setIsLoading(false);
      setAuthError('An unexpected authentication error occurred.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back to Home Link */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to VFSTR Transport Portal</span>
        </Link>
      </div>

      <Card className="border-2 border-border shadow-2xl overflow-hidden bg-card">
        {/* Brand Header Banner */}
        <CardHeader className="bg-primary/5 pb-6 border-b border-border/60 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-3">
            <Bus className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {APP_CONFIG.shortName} Student Sign In
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {APP_CONFIG.institution}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Redirect Notice Banner if coming from a protected route */}
            {redirectTarget && !authError && !authSuccess && (
              <Alert variant="info" className="py-2.5">
                <AlertTitle className="text-xs font-bold">Authentication Required</AlertTitle>
                <AlertDescription className="text-xs">Please sign in to access the requested page.</AlertDescription>
              </Alert>
            )}

            {/* Feedback Alerts */}
            {authError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertTitle className="text-xs font-bold">Authentication Failed</AlertTitle>
                <AlertDescription className="text-xs">{authError}</AlertDescription>
              </Alert>
            )}

            {authSuccess && (
              <Alert variant="success" className="py-2.5">
                <AlertTitle className="text-xs font-bold">Success</AlertTitle>
                <AlertDescription className="text-xs">{authSuccess}</AlertDescription>
              </Alert>
            )}

            {/* Identifier Input */}
            <Input
              label="Roll Number or College Email"
              placeholder="e.g. 251FA04564 or 251FA04564@gmail.com"
              leftIcon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            {/* Password Input */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your account password"
              leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember Me & Dedicated Forgot Password Page Link */}
            <div className="flex items-center justify-between pt-1">
              <Checkbox label="Remember me" {...register('rememberMe')} />
              <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 mt-2"
              isLoading={isLoading}
              leftIcon={<GraduationCap className="h-4 w-4" />}
            >
              Sign In to Student Portal
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-muted/30 py-4 text-center justify-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            Having trouble logging in? Contact the{' '}
            <Link to="/help" className="font-semibold text-primary hover:underline">
              Transport Helpdesk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
