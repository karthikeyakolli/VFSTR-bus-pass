import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/config/app.config';
import { Bus, X, LogOut, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface SidebarSubItem {
  label: string;
  href: string;
  badge?: string;
}

export interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: SidebarSubItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  portalTitle?: string;
  onLogoutClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
  portalTitle = 'Transport Portal',
  onLogoutClick,
}) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group if current pathname matches a child item
  useEffect(() => {
    items.forEach((group) => {
      if (group.children) {
        const hasActiveChild = group.children.some((child) => child.href === location.pathname);
        if (hasActiveChild) {
          setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
        }
      }
    });
  }, [location.pathname, items]);

  // Keyboard accessibility for mobile drawer escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        aria-label="Sidebar navigation"
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bus className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-foreground truncate">
                  {APP_CONFIG.shortName}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  {portalTitle}
                </span>
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden lg:flex text-muted-foreground hover:text-foreground h-8 w-8"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isGroupOpen = Boolean(openGroups[item.label]);
            const isDirectActive = item.href ? location.pathname === item.href : false;
            const isChildActive = hasChildren && item.children?.some((child) => child.href === location.pathname);
            const isActive = isDirectActive || isChildActive;

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  {/* Parent Accordion Group Trigger */}
                  <button
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={isGroupOpen}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      isActive
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && (
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
                          isGroupOpen && 'rotate-180'
                        )}
                      />
                    )}
                  </button>

                  {/* Expandable Child Sub-menu */}
                  {!collapsed && isGroupOpen && (
                    <div className="pl-9 pr-2 space-y-1 py-1 border-l-2 border-primary/30 ml-4 animate-in slide-in-from-top-2 duration-200">
                      {item.children?.map((child) => {
                        const isSubActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            to={child.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                              isSubActive
                                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                          >
                            <span className="truncate">{child.label}</span>
                            {child.badge && (
                              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-secondary-foreground">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single Standard Link Item
            return (
              <Link
                key={item.href || item.label}
                to={item.href || '#'}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out Button */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            onClick={onLogoutClick}
            className={cn(
              'w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Log Out</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};
