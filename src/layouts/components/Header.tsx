import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/config/app.config';
import {
  Bus,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Zap,
  LayoutDashboard,
  QrCode,
  PackageSearch,
  HelpCircle,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ROLE_METADATA } from '@/config/rbac.config';

export interface HeaderProps {
  navItems?: { label: string; href: string }[];
}

export const Header: React.FC<HeaderProps> = ({ navItems = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, user, role, switchRole, logout, portalPath } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (newRole: UserRole) => {
    setRoleMenuOpen(false);
    await switchRole(newRole);
    const dest = ROLE_METADATA[newRole]?.defaultPath || '/';
    navigate(dest);
  };

  const getRoleIcon = (r?: UserRole | null) => {
    switch (r) {
      case 'student':
        return <GraduationCap className="h-3.5 w-3.5 text-blue-500" />;
      case 'faculty':
        return <Briefcase className="h-3.5 w-3.5 text-emerald-500" />;
      case 'driver':
        return <Bus className="h-3.5 w-3.5 text-amber-500" />;
      case 'admin':
      case 'superadmin':
        return <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <GraduationCap className="h-3.5 w-3.5" />;
    }
  };

  // Split items into primary (first 4) and secondary (dropdown for non-XL screens)
  const primaryNavItems = navItems.slice(0, 4);
  const secondaryNavItems = navItems.slice(4);

  const getServiceIcon = (label: string) => {
    if (label.includes('Scanner')) return <QrCode className="h-4 w-4 text-primary" />;
    if (label.includes('Lost')) return <PackageSearch className="h-4 w-4 text-amber-500" />;
    if (label.includes('Fee')) return <CreditCard className="h-4 w-4 text-emerald-500" />;
    return <HelpCircle className="h-4 w-4 text-blue-500" />;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Emblem & Portal Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm group-hover:scale-105 transition-transform">
            <Bus className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
              {APP_CONFIG.shortName}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {APP_CONFIG.institution}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'relative text-xs lg:text-sm font-medium transition-all px-2.5 lg:px-3 py-1.5 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-primary whitespace-nowrap',
                    isActive ? 'text-primary bg-primary/10 font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Extra Services Dropdown on medium & large screens */}
            {secondaryNavItems.length > 0 && (
              <div className="relative" ref={servicesDropdownRef}>
                <button
                  type="button"
                  onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                  className={cn(
                    'flex items-center gap-1 text-xs lg:text-sm font-medium transition-all px-2.5 lg:px-3 py-1.5 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-primary whitespace-nowrap cursor-pointer',
                    secondaryNavItems.some((s) => s.href === location.pathname)
                      ? 'text-primary bg-primary/10 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  <span>Services</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {servicesMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary" /> Campus Transit Portals
                    </div>
                    <div className="space-y-1 mt-1">
                      {secondaryNavItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setServicesMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground hover:bg-muted/80'
                            )}
                          >
                            {getServiceIcon(item.label)}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        {/* Actions & Portal Access */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Quick Role Switcher Dropdown (Demo/Testing) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-accent/60 transition-colors text-xs font-semibold text-foreground focus:outline-none"
                >
                  <Avatar name={user.name || 'User'} size="sm" />
                  <span className="max-w-[120px] truncate hidden sm:inline">{user.name?.split(' ')[0]}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase border-primary/30 text-primary flex items-center gap-1">
                    {getRoleIcon(role)}
                    <span>{role}</span>
                  </Badge>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-2 border-b border-border mb-1.5">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Switch Role (Prototype Demo)
                    </div>

                    <div className="space-y-1 mt-1">
                      {(['student', 'faculty', 'driver', 'admin'] as UserRole[]).map((r) => {
                        const meta = ROLE_METADATA[r];
                        const isCurrent = role === r;
                        return (
                          <button
                            key={r}
                            onClick={() => handleRoleSwitch(r)}
                            className={cn(
                              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors text-left',
                              isCurrent ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {getRoleIcon(r)}
                              <span>{meta.title}</span>
                            </div>
                            {isCurrent && <span className="text-[10px] text-primary">Active</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-1.5 border-t border-border" />

                    <Link
                      to={portalPath}
                      onClick={() => setRoleMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-foreground hover:bg-muted font-medium transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                      <span>Open Role Dashboard</span>
                    </Link>

                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-destructive hover:bg-destructive/10 font-medium transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Dashboard Link */}
              <Link to={portalPath}>
                <Button
                  variant="primary"
                  size="sm"
                  className="shadow-xs hover:shadow-sm"
                  leftIcon={<LayoutDashboard className="h-3.5 w-3.5" />}
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5">
                <Link to="/driver">
                  <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-foreground">
                    Driver Console
                  </Button>
                </Link>
                <Link to="/admin/fleet">
                  <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-foreground">
                    Admin Office
                  </Button>
                </Link>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                    leftIcon={<GraduationCap className="h-4 w-4" />}
                  >
                    Portal Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

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
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 flex flex-col gap-1.5 animate-in slide-in-from-top-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-xl transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-muted/80'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {getServiceIcon(item.label)}
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-foreground">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">Role: {role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8 px-2 text-xs"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
                <Link to={portalPath} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    Go to {ROLE_METADATA[role || 'student']?.title || 'Dashboard'}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/driver" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Driver Console
                    </Button>
                  </Link>
                  <Link to="/admin/fleet" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Admin Office
                    </Button>
                  </Link>
                </div>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full justify-center" leftIcon={<GraduationCap className="h-4 w-4" />}>
                    Portal Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
