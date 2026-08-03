import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { useToast } from '@/hooks/useToast';
import { APP_CONFIG } from '@/config/app.config';
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';

const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter your Registration Roll Number or VFSTR Email'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '211FA04001',
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    const targetEmail = data.identifier.includes('@')
      ? data.identifier
      : `${data.identifier.toLowerCase()}@vignan.ac.in`;

    setTimeout(() => {
      setIsLoading(false);
      setSubmittedEmail(targetEmail);
      toast.success('Reset Link Sent', `Password reset instructions dispatched to ${targetEmail}`);
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
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {APP_CONFIG.shortName} • {APP_CONFIG.institution}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {submittedEmail ? (
            <div className="space-y-4 text-center py-2">
              <Alert variant="success" className="text-left">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <AlertTitle className="text-xs font-bold">Reset Instructions Dispatched</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    A password recovery link has been sent to <span className="font-bold text-foreground">{submittedEmail}</span>. Please check your inbox and follow the instructions.
                  </AlertDescription>
                </div>
              </Alert>

              <p className="text-xs text-muted-foreground">
                Didn’t receive an email? Check your spam folder or request a new link in 60 seconds.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Link to="/reset-password">
                  <Button variant="primary" className="w-full" leftIcon={<KeyRound className="h-4 w-4" />}>
                    Proceed to Reset Password Page (Demo)
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => setSubmittedEmail(null)}>
                  Try Different Roll Number / Email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your VFSTR Registration Roll Number or official campus email address. We will send a secure link to reset your transport account password.
              </p>

              <Input
                label="Roll Number or Campus Email"
                placeholder="e.g. 211FA04001 or student@vignan.ac.in"
                leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
                error={errors.identifier?.message}
                {...register('identifier')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11"
                isLoading={isLoading}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Password Reset Link
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="bg-muted/30 py-4 text-center justify-center border-t border-border">
          <span className="text-xs text-muted-foreground">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};
