import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarItem } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Footer } from './components/Footer';
import { Container } from './components/Container';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, CreditCard, Route, FileText, Bell, User, Armchair, Navigation, HelpCircle } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const studentNavItems: SidebarItem[] = [
    { label: 'Home', href: '/student', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Bus Pass', href: '/student/pass', icon: <FileText className="h-4 w-4" /> },
    { label: 'Apply Bus Pass', href: '/student/apply', icon: <Armchair className="h-4 w-4" />, badge: 'New' },
    { label: 'Book Seat', href: '/student/booking', icon: <Armchair className="h-4 w-4" />, badge: 'Seat Map' },
    { label: 'Live GPS Navigation', href: '/student/navigation', icon: <Navigation className="h-4 w-4" />, badge: 'Live' },
    { label: 'Routes & Stops', href: '/student/routes', icon: <Route className="h-4 w-4" /> },
    { label: 'Applications', href: '/student/applications', icon: <FileText className="h-4 w-4" /> },
    { label: 'Fee & Payments', href: '/student/payments', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Notices', href: '/student/notifications', icon: <Bell className="h-4 w-4" /> },
    { label: 'Profile', href: '/student/profile', icon: <User className="h-4 w-4" /> },
    { label: 'Support & FAQs', href: '/help', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout(); // Clears AuthContext state + localStorage/sessionStorage
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Skip-to-content: accessibility for keyboard & screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Student Sidebar Navigation */}
      <Sidebar
        items={studentNavItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        portalTitle="Student Portal"
        onLogoutClick={() => setShowLogoutConfirm(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav onMobileMenuToggle={() => setSidebarOpen(true)} />

        {/* Content Container */}
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
        description="Are you sure you want to sign out of the VFSTR Student Transport Portal?"
        confirmText="Log Out"
        variant="danger"
      />
    </div>
  );
};
