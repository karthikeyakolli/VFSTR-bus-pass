import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { APP_CONFIG } from '@/config/app.config';
import {
  Bus,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  UserCheck,
  ArrowLeft,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Registration Roll Number / Staff ID is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type UserRoleOption = 'student' | 'faculty' | 'driver' | 'admin';

interface RoleCredentialInfo {
  role: UserRoleOption;
  label: string;
  name: string;
  badge: string;
  icon: React.ReactNode;
  identifier: string;
  password: string;
  operations: string[];
  gradient: string;
  borderAccent: string;
  portalPath: string;
}

const ROLE_CREDENTIALS: RoleCredentialInfo[] = [
  {
    role: 'student',
    label: 'Student Portal',
    name: 'Karthikeya Kolli',
    badge: 'AY 2026-27 Active',
    icon: <GraduationCap className="h-5 w-5" />,
    identifier: '251FA04001',
    password: 'password123',
    operations: [
      'Digital Pass with Dynamic 30s QR Code',
      'Campus Bus Seat Selection & Pass Application',
      'Live Bus GPS Radar & Arrival ETA',
      'Instant UPI Payment & PDF Tax Invoices',
      'Campus Emergency SOS Dialing Beacon',
    ],
    gradient: 'from-blue-600 to-indigo-700',
    borderAccent: 'border-blue-500/40 hover:border-blue-500',
    portalPath: '/student',
  },
  {
    role: 'faculty',
    label: 'Faculty Portal',
    name: 'Dr. M. S. R. Murthy (Dean)',
    badge: '100% University Subsidy',
    icon: <Briefcase className="h-5 w-5" />,
    identifier: 'VFSTR-FAC-101',
    password: 'password123',
    operations: [
      'Institutional 100% Subsidized Transit Pass',
      'Priority Front-Row Reserved Berth Selection',
      'Payroll Deduction & Accounts Counter Toggle',
      'Duty Travel & Special Campus Shuttle Desk',
    ],
    gradient: 'from-emerald-600 to-teal-700',
    borderAccent: 'border-emerald-500/40 hover:border-emerald-500',
    portalPath: '/faculty',
  },
  {
    role: 'driver',
    label: 'Driver Console',
    name: 'K. Venkateswarlu',
    badge: 'Bus AP 07 TJ 4521 • Route #14',
    icon: <Bus className="h-5 w-5" />,
    identifier: 'DRV-001',
    password: 'password123',
    operations: [
      'Device Camera Optical QR Pass Scanner',
      'Real-Time Live GPS Telemetry Broadcaster',
      'Passenger Trip Manifest & Headcount Audit',
      'Pre-Trip Vehicle Safety & Fuel Checklist',
    ],
    gradient: 'from-amber-600 to-orange-700',
    borderAccent: 'border-amber-500/40 hover:border-amber-500',
    portalPath: '/driver',
  },
  {
    role: 'admin',
    label: 'Transport Admin Office',
    name: 'Dr. K. Sathyanarayana (Dean Operations)',
    badge: 'Transport Authority',
    icon: <ShieldCheck className="h-5 w-5" />,
    identifier: 'VFSTR-ADM-001',
    password: 'admin123',
    operations: [
      '71-Route Fleet Maintenance & RTO FC Tracker',
      'Corridor Capacity & Real-Time Load Heatmap',
      'Excel Batch Student Admission Onboarding',
      'Heavy Commercial Driver & Crew Roster',
      'Distance Fee Slabs & Disciplinary Challans',
    ],
    gradient: 'from-rose-600 to-red-800',
    borderAccent: 'border-rose-500/40 hover:border-rose-500',
    portalPath: '/admin/fleet',
  },
];

export const LoginPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRoleOption>('student');
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
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '251FA04001',
      password: 'password123',
      rememberMe: true,
    },
  });

  const activeCredInfo = ROLE_CREDENTIALS.find((c) => c.role === activeRole) || ROLE_CREDENTIALS[0];

  const handleRoleSelect = (role: UserRoleOption) => {
    setActiveRole(role);
    setAuthError(null);
    const target = ROLE_CREDENTIALS.find((c) => c.role === role);
    if (target) {
      setValue('identifier', target.identifier);
      setValue('password', target.password);
    }
  };

  const handleQuickLogin = async (cred: RoleCredentialInfo) => {
    setActiveRole(cred.role);
    setValue('identifier', cred.identifier);
    setValue('password', cred.password);
    setIsLoading(true);
    setAuthError(null);

    try {
      await login(cred.role, cred.identifier, true, cred.password);
      setIsLoading(false);
      setAuthSuccess(`Authorized as ${cred.name}. Redirecting to ${cred.label}...`);
      toast.success('Fast-Track Sign In', `Welcome to ${cred.label}`);
      setTimeout(() => {
        navigate(cred.portalPath);
      }, 500);
    } catch {
      setIsLoading(false);
      setAuthError('Authentication failed. Please verify credentials.');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (data.password === 'error') {
        setIsLoading(false);
        setAuthError('Invalid credentials. Please verify your identification and password.');
        toast.error('Authentication Failed', 'Invalid credentials provided.');
        return;
      }

      await login(activeRole, data.identifier, data.rememberMe, data.password);

      setIsLoading(false);
      setAuthSuccess(`Authentication successful! Redirecting to ${activeCredInfo.label}...`);
      toast.success('Login Successful', `Welcome back to ${APP_CONFIG.shortName}`);

      setTimeout(() => {
        if (redirectTarget) {
          navigate(decodeURIComponent(redirectTarget));
        } else {
          navigate(activeCredInfo.portalPath);
        }
      }, 600);
    } catch {
      setIsLoading(false);
      setAuthError('An unexpected authentication error occurred.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 space-y-8 animate-page">
      {/* Back to Home & Portal Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg border border-border w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to University Home
        </Link>

        <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs w-fit">
          VFSTR Role-Based Transport Access Gateway
        </Badge>
      </div>

      {/* TOP CREDENTIALS DIRECTORY SHOWCASE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              Role-Based Login Directory & Test Credentials
            </h2>
            <p className="text-xs text-muted-foreground">
              Select any role card below to inspect credentials or click 1-Click Sign In to access that role instantly:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLE_CREDENTIALS.map((cred) => {
            const isSelected = activeRole === cred.role;

            return (
              <Card
                key={cred.role}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? `${cred.borderAccent} shadow-lg ring-2 ring-primary/20 bg-card`
                    : 'border-border bg-card/60 hover:bg-card'
                }`}
                onClick={() => handleRoleSelect(cred.role)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cred.gradient} text-white shadow-sm`}>
                      {cred.icon}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                      {cred.badge}
                    </Badge>
                  </div>

                  {/* Name and Role */}
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">{cred.label}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{cred.name}</p>
                  </div>

                  {/* Login Credentials Box */}
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-[11px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-bold text-foreground">{cred.identifier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Password:</span>
                      <span className="font-bold text-foreground">{cred.password}</span>
                    </div>
                  </div>

                  {/* Operations checklist */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Operations Unlocked:
                    </span>
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      {cred.operations.slice(0, 3).map((op, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{op}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 1-Click Fast Sign In Button */}
                <div className="pt-4 mt-2 border-t border-border">
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? 'primary' : 'outline'}
                    className="w-full text-xs font-bold gap-1.5 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(cred);
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Sign In as {cred.role.toUpperCase()}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* DEDICATED AUTHENTICATION WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Info Panel */}
        <Card className="lg:col-span-5 p-6 border-2 border-border/80 bg-gradient-to-b from-card to-muted/20 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-tr ${activeCredInfo.gradient} text-white shadow-md`}>
                {activeCredInfo.icon}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Active Mode
                </span>
                <h3 className="text-xl font-black text-foreground">{activeCredInfo.label}</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Signed-in operations are scoped strictly to the selected user role. Switching roles modifies permissions, visible telemetry layers, and financial clearance levels.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Full Scope of Role Operations:
            </h4>
            <div className="space-y-2">
              {activeCredInfo.operations.map((op, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-background border border-border text-xs">
                  <div className="p-1 rounded-md bg-primary/10 text-primary mt-0.5 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">{op}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl border border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Destination Route:</span>
            <code className="font-mono font-bold text-foreground">{activeCredInfo.portalPath}</code>
          </div>
        </Card>

        {/* Right Form Card */}
        <Card className="lg:col-span-7 p-6 sm:p-8 border-2 border-primary/20 bg-card shadow-xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground">Sign In to Your Account</h2>
              <Badge variant="outline" className="font-mono text-xs">
                {activeCredInfo.role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your official identification or use the pre-filled credentials.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl border border-border">
            {ROLE_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => handleRoleSelect(cred.role)}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeRole === cred.role
                    ? 'bg-card text-foreground shadow-sm font-black border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cred.icon}
                <span className="hidden sm:inline">{cred.role.charAt(0).toUpperCase() + cred.role.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertTitle className="text-xs font-bold">Authentication Failed</AlertTitle>
              <AlertDescription className="text-xs">{authError}</AlertDescription>
            </Alert>
          )}

          {authSuccess && (
            <Alert variant="success" className="py-2.5">
              <AlertTitle className="text-xs font-bold">Authenticated</AlertTitle>
              <AlertDescription className="text-xs">{authSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={
                activeRole === 'faculty'
                  ? 'University Employee ID or Email'
                  : activeRole === 'driver'
                  ? 'Driver Commercial Staff ID'
                  : activeRole === 'admin'
                  ? 'Administrator Access ID'
                  : 'Student Roll Number / Email'
              }
              placeholder="Enter your assigned identification"
              leftIcon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <Input
              label="Secret Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <Checkbox label="Keep session active" {...register('rememberMe')} />
              <Link to="/help" className="text-primary font-semibold hover:underline">
                Transport Helpdesk (Room 104)
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-black shadow-md mt-2"
              isLoading={isLoading}
              leftIcon={activeCredInfo.icon}
            >
              Sign In to {activeCredInfo.label}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
