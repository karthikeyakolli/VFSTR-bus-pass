import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarItem } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Footer } from './components/Footer';
import { Container } from './components/Container';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  LayoutDashboard,
  Bus,
  Users,
  BarChart3,
  Sliders,
  FolderKanban,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const adminNavItems: SidebarItem[] = [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      label: 'Pass Management',
      icon: <FolderKanban className="h-4 w-4" />,
      children: [
        { label: 'Pass Applications', href: '/admin/applications', badge: '12 New' },
        { label: 'Payment Verifications', href: '/admin/payments' },
      ],
    },
    {
      label: 'Fleet & Network',
      icon: <Bus className="h-4 w-4" />,
      children: [
        { label: 'Buses & Drivers', href: '/admin/buses' },
        { label: 'Routes & Stops', href: '/admin/routes' },
      ],
    },
    { label: 'Students Directory', href: '/admin/students', icon: <Users className="h-4 w-4" /> },
    { label: 'Reports & Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'System Configuration', href: '/admin/settings', icon: <Sliders className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Admin Sidebar Navigation */}
      <Sidebar
        items={adminNavItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        portalTitle="Transport Admin ERP"
        onLogoutClick={() => setShowLogoutConfirm(true)}
      />

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav onMobileMenuToggle={() => setSidebarOpen(true)} />

        {/* Workspace Content Container */}
        <main className="flex-1 py-6">
          <Container size="full" className="px-4 sm:px-6 lg:px-8">
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
        description="Are you sure you want to sign out of the VFSTR Transport Administration ERP?"
        confirmText="Log Out"
        variant="danger"
      />
    </div>
  );
};
