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

  const userName = user?.name || studentProfile.name;
  const userSubtext = `${studentProfile.regNo} • CSE`;

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
          className="flex items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
        >
          <Avatar name={userName} size="md" status="online" />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-none">{userName}</span>
            <span className="text-[11px] text-slate-500 capitalize mt-0.5">{userSubtext}</span>
          </div>
        </button>

        {/* Dropdown Card */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-xl animate-in fade-in-0 zoom-in-95">
            {/* Header info */}
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{userName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 capitalize">
                  <GraduationCap className="h-3 w-3" />
                  Student
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{userSubtext}</span>
            </div>

            {/* Menu options */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/student/profile');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-slate-500" />
                <span>My Profile</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
