import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, GraduationCap } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';

export const UserProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { studentProfile } = useUser();

  const userName = studentProfile.name || user?.name || 'Student';
  const regNo = studentProfile.regNo || (user?.email ? user.email.split('@')[0].toUpperCase() : '251FA04001');
  const userSubtext = `${regNo} • CSE`;

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
          <Avatar name={userName} size="md" status="online" />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-none">{userName}</span>
            <span className="text-[11px] text-muted-foreground capitalize mt-0.5">{userSubtext}</span>
          </div>
        </button>

        {/* Dropdown Card */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
            {/* Header info */}
            <div className="px-3 py-2 border-b border-border mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{userName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                  <GraduationCap className="h-3 w-3" />
                  Student
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">{userSubtext}</span>
            </div>

            {/* Menu options */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/student/profile');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </button>

              <div className="my-1 border-t border-border" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog Modal */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of the VFSTR Transport Management System?"
        confirmText="Log Out"
        variant="danger"
      />
    </>
  );
};
