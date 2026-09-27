import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarItem } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Footer } from './components/Footer';
import { Container } from './components/Container';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import {
  Wrench,
  Users,
  CreditCard,
  ShieldAlert,
  FileCheck2,
  Route,
  HelpCircle,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const adminNavItems: SidebarItem[] = [
    {
      label: 'Fleet & Telemetry',
      href: '/admin/fleet',
      icon: <Wrench className="h-4 w-4" />,
      badge: 'Active',
    },
    {
      label: 'Driver & Crew Roster',
      href: '/admin/drivers',
      icon: <Users className="h-4 w-4" />,
      badge: '71 Routes',
    },
    {
      label: 'Pass Allocations',
      href: '/admin/passes',
      icon: <FileCheck2 className="h-4 w-4" />,
    },
    {
      label: 'Fee Slabs & Revenue',
      href: '/admin/fees',
      icon: <CreditCard className="h-4 w-4" />,
      badge: 'AY 26-27',
    },
    {
      label: 'Security & Violations',
      href: '/admin/violations',
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      label: 'Route Network',
      href: '/routes',
      icon: <Route className="h-4 w-4" />,
    },
    {
      label: 'Help & Knowledgebase',
      href: '/help',
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Admin Sidebar Navigation */}
      <Sidebar
        items={adminNavItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        portalTitle="Transport Office"
        onLogoutClick={() => setShowLogoutConfirm(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav onMobileMenuToggle={() => setSidebarOpen(true)} />

        <main id="main-content" className="flex-1 py-6" tabIndex={-1}>
          <Container>
            <Outlet />
          </Container>
        </main>

        <Footer />
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of the VFSTR Transport Administration Console?"
        confirmText="Log Out"
        variant="danger"
      />
    </div>
  );
};
