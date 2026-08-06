import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sparkles, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { NotificationsPopover } from './NotificationsPopover';
import { UserProfileMenu } from './UserProfileMenu';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 shadow-xs transition-colors">
        {/* Left: Mobile Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="lg:hidden text-muted-foreground hover:text-foreground"
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
            className="flex h-9 w-full items-center justify-between rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:bg-accent/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Quick search routes, passes, actions...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Theme Toggle, System Badge, Notifications & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>STMS Portal</span>
          </div>
          <NotificationsPopover />
          <div className="h-6 w-px bg-border mx-1" />
          <UserProfileMenu />
        </div>
      </header>

      {/* Global Command Palette Dialog */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </>
  );
};

