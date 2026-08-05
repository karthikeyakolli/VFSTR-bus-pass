import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


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
    <div className="w-full max-w-5xl mx-auto py-6 animate-page">
      {/* Back to Home Link */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 py-0.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to VFSTR Transport Portal</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border-2 border-border shadow-2xl overflow-hidden bg-card">
        {/* Left Side: Campus Image Placeholder & Academic Welcome (Desktop) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-10 text-primary-foreground flex flex-col justify-between relative overflow-hidden hidden sm:flex">
          {/* Subtle Background Overlay Grid */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/20 backdrop-blur border border-white/20 text-primary-foreground">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-primary-foreground/80 block">
                  VFSTR PORTAL
                </span>
                <span className="text-lg font-black tracking-tight">{APP_CONFIG.shortName}</span>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Vignan Foundation for Science, Technology & Research
              </h2>
              <p className="text-xs sm:text-sm text-primary-foreground/85 leading-relaxed">
                Official Transport Management System. Digitizing student bus pass subscriptions, route schedules, and fee receipts across Vadlamudi campus.
              </p>
            </div>
          </div>

          {/* Campus Hero Graphic Placeholder */}
          <div className="relative z-10 my-6 p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">Vadlamudi Main Campus Terminal</span>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded font-semibold">65+ Fleet Buses</span>
            </div>
            <p className="text-[11px] text-primary-foreground/80">
              Connecting Guntur, Vijayawada, Tenali, and surrounding districts safely.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] text-primary-foreground/80">
            <span>Deemed to be University</span>
            <span>Est. Vadlamudi • AP</span>
          </div>
        </div>

        {/* Right Side: Modern Login Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-card">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Student Sign In
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter your Registration Roll Number or College Email to proceed.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Redirect Notice Banner */}
            {redirectTarget && !authError && !authSuccess && (
              <Alert variant="info" className="py-2.5">
                <AlertTitle className="text-xs font-bold">Authentication Required</AlertTitle>
                <AlertDescription className="text-xs">Please sign in to access your requested page.</AlertDescription>
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
              placeholder="e.g. 211FA04001 or student@vignan.ac.in"
              leftIcon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            {/* Password Input with Visibility Toggle */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your account password"
              leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember Me & Forgot Password Placeholder Link */}
            <div className="flex items-center justify-between pt-1">
              <Checkbox label="Remember me" {...register('rememberMe')} />
              <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 mt-2 text-sm font-bold shadow-sm"
              isLoading={isLoading}
              leftIcon={<GraduationCap className="h-4 w-4" />}
            >
              Sign In to Transport Portal
            </Button>
          </form>

          <div className="mt-8 pt-4 border-t border-border/80 text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble logging in? Contact{' '}
              <Link to="/help" className="font-semibold text-primary hover:underline">
                Transport Helpdesk Room 104
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
