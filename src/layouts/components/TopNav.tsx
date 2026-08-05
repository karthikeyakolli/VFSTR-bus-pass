import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { SearchBar } from '@/components/ui/SearchBar';
import { useTheme } from '@/hooks/useTheme';
import { NotificationsPopover } from './NotificationsPopover';
import { UserProfileMenu } from './UserProfileMenu';

export interface TopNavProps {
  onMobileMenuToggle?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

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
      else if (path === '/student/settings') items.push({ label: 'Settings' });
      return items;
    }

    return [{ label: 'Home', href: '/' }];
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6">
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

      {/* Center: Search Bar Placeholder */}
      <div className="hidden md:block flex-1 max-w-xs mx-4">
        <SearchBar placeholder="Search routes, passes, students..." />
      </div>

      {/* Right: Notifications Popover, Theme Toggle & User Profile Dropdown Menu */}
      <div className="flex items-center gap-2">
        <NotificationsPopover />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle light/dark theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <UserProfileMenu />
      </div>
    </header>
  );
};
