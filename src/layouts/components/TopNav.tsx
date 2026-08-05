import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { SearchBar } from '@/components/ui/SearchBar';
import { NotificationsPopover } from './NotificationsPopover';
import { UserProfileMenu } from './UserProfileMenu';

export interface TopNavProps {
  onMobileMenuToggle?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();

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

      {/* Center: Search Bar Placeholder */}
      <div className="hidden md:block flex-1 max-w-xs mx-4">
        <SearchBar placeholder="Search routes, passes, students..." />
      </div>

      {/* Right: System Badge, Notifications & Profile Menu */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>STMS Light Mode</span>
        </div>
        <NotificationsPopover />
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <UserProfileMenu />
      </div>
    </header>
  );
};
