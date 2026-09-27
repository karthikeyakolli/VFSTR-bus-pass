import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  LogOut,
  GraduationCap,
  Briefcase,
  Bus,
  ShieldCheck,
  Zap,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { UserRole } from '@/types';
import { ROLE_METADATA } from '@/config/rbac.config';
import { cn } from '@/lib/utils';

export const UserProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, role, switchRole, logout } = useAuth();
  const { studentProfile } = useUser();

  // Dynamic user display based on active role
  const getUserDetails = () => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return {
          name: user?.name || 'Dr. K. Sathyanarayana',
          subtext: 'Dean Transport Operations • Adm Office',
          roleBadge: 'Admin Office',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />,
          profileLink: '/admin/fleet',
          profileLinkLabel: 'Admin Fleet Desk',
        };
      case 'faculty':
        return {
          name: user?.name || 'Dr. M. S. R. Murthy',
          subtext: 'Dean CSE • Employee VFSTR-FAC-101',
          roleBadge: 'Faculty Member',
          icon: <Briefcase className="h-3.5 w-3.5 text-emerald-500" />,
          profileLink: '/faculty',
          profileLinkLabel: 'Faculty Transit Desk',
        };
      case 'driver':
        return {
          name: user?.name || 'K. Venkateswarlu',
          subtext: 'Route #14 • Heavy Bus AP 07 TJ 4521',
          roleBadge: 'Driver Staff',
          icon: <Bus className="h-3.5 w-3.5 text-amber-500" />,
          profileLink: '/driver/dashboard',
          profileLinkLabel: 'Driver Console',
        };
      case 'student':
      default:
        const regNo =
          studentProfile.regNo ||
          (user?.email ? user.email.split('@')[0].toUpperCase() : '251FA04001');
        return {
          name: studentProfile.name || user?.name || 'Karthikeya Kolli',
          subtext: `${regNo} • CSE Department`,
          roleBadge: 'Student',
          icon: <GraduationCap className="h-3.5 w-3.5 text-blue-500" />,
          profileLink: '/student/profile',
          profileLinkLabel: 'My Student Profile',
        };
    }
  };

  const details = getUserDetails();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRoleSwitch = async (targetRole: UserRole) => {
    setIsOpen(false);
    await switchRole(targetRole);
    const dest = ROLE_METADATA[targetRole]?.defaultPath || '/';
    navigate(dest);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* User Profile Avatar Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="User profile menu"
          className="flex items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Avatar name={details.name} size="md" status="online" />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-none">{details.name}</span>
            <span className="text-[11px] text-muted-foreground truncate max-w-[150px] mt-0.5">
              {details.subtext}
            </span>
          </div>
        </button>

        {/* Dropdown Card */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
            {/* Header info */}
            <div className="px-3 py-2 border-b border-border mb-1.5">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-foreground truncate">{details.name}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {details.icon}
                  {details.roleBadge}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground block truncate">{details.subtext}</span>
            </div>

            {/* Menu options */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(details.profileLink);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{details.profileLinkLabel}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </button>

              {role === 'student' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/student/pass');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>Digital Bus Pass</span>
                </button>
              )}
            </div>

            {/* Demo Quick Role Switcher */}
            <div className="my-1.5 border-t border-border pt-1.5">
              <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>Switch Persona (Demo Mode)</span>
              </div>

              <div className="space-y-0.5 mt-1">
                {(['student', 'faculty', 'driver', 'admin'] as UserRole[]).map((r) => {
                  const meta = ROLE_METADATA[r];
                  const isCurrent = role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                        isCurrent
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <span className="capitalize">{meta.title}</span>
                      {isCurrent ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Switch</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="my-1.5 border-t border-border" />

            <button
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out Session"
        description="Are you sure you want to log out of your VFSTR transport session?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
