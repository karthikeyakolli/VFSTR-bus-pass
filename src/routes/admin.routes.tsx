import { RouteObject } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import {
  AdminDashboardPage,
  ApplicationsPage,
  BusFleetPage,
  ManageRoutesPage,
  PaymentVerificationPage,
  StudentDirectoryPage,
  AnalyticsPage,
} from '@/pages';

export const adminRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['admin', 'superadmin']} />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: '/admin', element: <AdminDashboardPage /> },
        { path: '/admin/applications', element: <ApplicationsPage /> },
        { path: '/admin/buses', element: <BusFleetPage /> },
        { path: '/admin/routes', element: <ManageRoutesPage /> },
        { path: '/admin/payments', element: <PaymentVerificationPage /> },
        { path: '/admin/students', element: <StudentDirectoryPage /> },
        { path: '/admin/analytics', element: <AnalyticsPage /> },
      ],
    },
  ],
};
