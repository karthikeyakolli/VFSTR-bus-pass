import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { useToast } from '@/hooks/useToast';
import { APP_CONFIG } from '@/config/app.config';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password', '');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-border', percent: 0 };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-rose-500', percent: 33 };
    if (pass.length < 10) return { label: 'Moderate', color: 'bg-amber-500', percent: 66 };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
  };

  const strength = getPasswordStrength(watchPassword);

  const onSubmit = (_data: ResetPasswordFormValues) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Password Updated', 'Your transport account password has been reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back to Login */}
      <div className="mb-4">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>

      <Card className="border-2 border-border shadow-2xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 pb-6 border-b border-border/60 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Set New Password
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {APP_CONFIG.shortName} • {APP_CONFIG.institution}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {isSuccess ? (
            <Alert variant="success">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <AlertTitle className="text-xs font-bold">Password Reset Complete!</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Your new password is now active. Redirecting you to the login screen...
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create a strong new password for your VFSTR transport account.
              </p>

              {/* New Password */}
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password (min 6 chars)"
                leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Password Strength Indicator */}
              {watchPassword && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className="font-semibold text-foreground">{strength.label}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 mt-2"
                isLoading={isLoading}
                leftIcon={<ShieldCheck className="h-4 w-4" />}
              >
                Update Password
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="bg-muted/30 py-4 text-center justify-center border-t border-border">
          <span className="text-xs text-muted-foreground">
            Back to{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};
