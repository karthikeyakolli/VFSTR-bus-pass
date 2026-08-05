import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/config/app.config';
import { Bus, Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface HeaderProps {
  navItems?: { label: string; href: string }[];
}

export const Header: React.FC<HeaderProps> = ({ navItems = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Emblem & Portal Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm group-hover:scale-105 transition-transform">
            <Bus className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              {APP_CONFIG.shortName}
            </span>
            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">
              {APP_CONFIG.institution}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary font-semibold' : 'text-slate-600'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions & Portal Access */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/login">
              <Button variant="primary" size="sm" leftIcon={<GraduationCap className="h-4 w-4" />}>
                Student Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium py-2 text-slate-800 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full justify-start" leftIcon={<GraduationCap className="h-4 w-4" />}>
                Student Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
