import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sparkles, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { NotificationsPopover } from './NotificationsPopover';
import { UserProfileMenu } from './UserProfileMenu';
import { CommandPalette } from '@/components/ui/CommandPalette';

export interface TopNavProps {
  onMobileMenuToggle?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate dynamic breadcrumb trail based on active route pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    if (path.startsWith('/student')) {
      const items: BreadcrumbItem[] = [{ label: 'Home', href: '/student' }];
      if (path === '/student/apply') items.push({ label: 'Apply' });
      else if (path === '/student/renew') items.push({ label: 'Renew' });
      else if (path === '/student/pass') items.push({ label: 'Bus Pass' });
      else if (path === '/student/payments') items.push({ label: 'Payments' });
      else if (path === '/student/routes') items.push({ label: 'Routes & Fees' });
      else if (path === '/student/notifications') items.push({ label: 'Notices' });
      else if (path === '/student/profile') items.push({ label: 'Profile' });
      else if (path === '/student/applications') items.push({ label: 'Requests' });
      return items;
    }

    return [{ label: 'Home', href: '/' }];
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-sm">
        {/* Left: Mobile Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="lg:hidden text-slate-600 hover:text-slate-900"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Dynamic Breadcrumb Navigation */}
          <div className="hidden sm:block">
            <Breadcrumbs items={generateBreadcrumbs()} />
          </div>
        </div>

        {/* Center: Command Palette Trigger Button */}
        <div className="flex-1 max-w-sm mx-4">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Quick search routes, passes, actions...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: System Badge, Notifications & Profile Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>STMS Portal</span>
          </div>
          <NotificationsPopover />
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <UserProfileMenu />
        </div>
      </header>

      {/* Global Command Palette Dialog */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </>
  );
};

