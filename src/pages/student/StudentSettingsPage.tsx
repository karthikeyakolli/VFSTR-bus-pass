import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { useUser } from '@/hooks/useUser';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Shield,
  LogOut,
  ChevronRight,
  Sliders,
  Mail,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const StudentSettingsPage: React.FC = () => {
  const { studentProfile } = useUser();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Notification switches state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [routeDelayNotifs, setRouteDelayNotifs] = useState(true);
  const [renewalReminders, setRenewalReminders] = useState(true);

  // Privacy switches state
  const [shareAnalytics, setShareAnalytics] = useState(false);

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordFields.currentPassword || !passwordFields.newPassword) {
      toast.error('Validation Error', 'Please fill in all password fields.');
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      toast.error('Validation Error', 'New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setShowPasswordModal(false);
      setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password Updated', 'Your transport portal password has been updated.');
    }, 1000);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    toast.info('Signed Out', 'You have been logged out of your session.');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-page">
      {/* Section Header */}
      <SectionHeader
        title="Portal & System Settings"
        subtitle="Manage account preferences, security options, and notification controls"
        badge={<Badge variant="outline">Student Account Settings</Badge>}
      />

      <div className="space-y-6">
        {/* 1. Account Settings Card */}
        <Card className="p-6">
          <SectionHeader
            title="Account Information"
            subtitle="Student account credentials and profile link"
            badge={<Badge variant="secondary">Verified Student</Badge>}
            className="pb-3 mb-4"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                {studentProfile.name.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground">{studentProfile.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Reg No: <span className="font-mono font-semibold text-foreground">{studentProfile.regNo}</span> • {studentProfile.department}
                </p>
                <p className="text-xs text-muted-foreground">{studentProfile.email}</p>
              </div>
            </div>

            <Link to="/student/profile">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View Full Profile
              </Button>
            </Link>
          </div>
        </Card>

        {/* 2. Appearance Section */}
        <Card className="p-6">
          <SectionHeader
            title="Appearance & Theme"
            subtitle="Customize interface theme and display preferences"
            badge={<Badge variant="outline">Current: {theme}</Badge>}
            className="pb-3 mb-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              <Sun className="h-5 w-5 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              <Moon className="h-5 w-5 text-indigo-400" />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              aria-pressed={theme === 'system'}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                theme === 'system'
                  ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              <Laptop className="h-5 w-5 text-slate-400" />
              <span>System Theme</span>
            </button>
          </div>
        </Card>

        {/* 3. Notification Preferences Section */}
        <Card className="p-6">
          <SectionHeader
            title="Notification Preferences"
            subtitle="Choose how and when you receive transport alerts"
            badge={<Bell className="h-4 w-4 text-primary" />}
            className="pb-3 mb-4"
          />

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/30">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email Notifications
                </span>
                <p className="text-muted-foreground text-[11px]">Receive pass approval and fee clearance emails.</p>
              </div>
              <Switch checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/30">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-primary" /> SMS Alerts
                </span>
                <p className="text-muted-foreground text-[11px]">Receive urgent text alerts for bus delays or emergency announcements.</p>
              </div>
              <Switch checked={smsNotifs} onChange={(e) => setSmsNotifs(e.target.checked)} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/30">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" /> Route Delay Alerts
                </span>
                <p className="text-muted-foreground text-[11px]">Get instant notifications for traffic or route schedule shifts.</p>
              </div>
              <Switch checked={routeDelayNotifs} onChange={(e) => setRouteDelayNotifs(e.target.checked)} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/30">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-primary" /> Annual Renewal Reminders
                </span>
                <p className="text-muted-foreground text-[11px]">Receive early-bird renewal window notifications 30 days prior to term end.</p>
              </div>
              <Switch checked={renewalReminders} onChange={(e) => setRenewalReminders(e.target.checked)} />
            </div>
          </div>
        </Card>

        {/* 4. Language Placeholder Section */}
        <Card className="p-6">
          <SectionHeader
            title="Language & Regional Settings"
            subtitle="Select portal display language"
            badge={<Globe className="h-4 w-4 text-primary" />}
            className="pb-3 mb-4"
          />

          <div className="max-w-xs">
            <Select
              label="Portal Display Language"
              options={[
                { value: 'en', label: 'English (United States)' },
                { value: 'te', label: 'Telugu (తెలుగు) • Preview' },
                { value: 'hi', label: 'Hindi (हिन्दी) • Preview' },
              ]}
              defaultValue="en"
              onChange={(e) => toast.info('Language Updated', `Display language set to ${e.target.value.toUpperCase()}`)}
            />
          </div>
        </Card>

        {/* 5. Security Section */}
        <Card className="p-6">
          <SectionHeader
            title="Security & Password"
            subtitle="Account password and authentication protection"
            badge={<Lock className="h-4 w-4 text-primary" />}
            className="pb-3 mb-4"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-foreground block">Account Password</span>
              <p className="text-muted-foreground">Last updated 30 days ago. Keep your password secure.</p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="success" dot>2FA Enabled via VFSTR SSO</Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </Card>

        {/* 6. Privacy Placeholder Section */}
        <Card className="p-6">
          <SectionHeader
            title="Privacy Preferences"
            subtitle="Manage data usage and telemetry preferences"
            badge={<Shield className="h-4 w-4 text-primary" />}
            className="pb-3 mb-4"
          />

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/30">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground">Share Anonymous Portal Usage Analytics</span>
                <p className="text-muted-foreground text-[11px]">Helps VFSTR Transport Cell improve route scheduling performance.</p>
              </div>
              <Switch checked={shareAnalytics} onChange={(e) => setShareAnalytics(e.target.checked)} />
            </div>
          </div>
        </Card>

        {/* 7. Logout Section */}
        <Card className="p-6 border-2 border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-foreground text-sm">Account Sign Out</h4>
              <p className="text-muted-foreground">Sign out of your active session on this device.</p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sign Out of Portal
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Dialog Modal */}
      <Dialog
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Transport Account Password"
        description="Enter your current password and a new secure password."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 py-2">
          <Input
            label="Current Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter current password"
            value={passwordFields.currentPassword}
            onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
            leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password (min 6 chars)"
            value={passwordFields.newPassword}
            onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
            leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
          />

          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={passwordFields.confirmPassword}
            onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
            leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasswordModal(false)} disabled={isUpdatingPassword}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingPassword} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
              Update Password
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of the VFSTR Student Transport Portal?"
        confirmText="Log Out Now"
        variant="danger"
      />
    </div>
  );
};
