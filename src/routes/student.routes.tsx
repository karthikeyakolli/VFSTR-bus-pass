import { RouteObject } from 'react-router-dom';
import { StudentLayout } from '@/layouts/StudentLayout';
import { ProtectedRoute } from './ProtectedRoute';
import {
  StudentDashboardPage,
  StudentProfilePage,
  ApplyPassPage,
  RenewPassPage,
  DigitalPassPage,
  PaymentHistoryPage,
  StudentRoutesPage,
  NotificationsPage,
  ApplicationStatusPage,
  HelpPage,
} from '@/pages';

export const studentRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['student', 'superadmin']} />,
  children: [
    {
      element: <StudentLayout />,
      children: [
        { path: '/student', element: <StudentDashboardPage /> },
        { path: '/student/profile', element: <StudentProfilePage /> },
        { path: '/student/applications', element: <ApplicationStatusPage /> },
        { path: '/student/apply', element: <ApplyPassPage /> },
        { path: '/student/renew', element: <RenewPassPage /> },
        { path: '/student/pass', element: <DigitalPassPage /> },
        { path: '/student/payments', element: <PaymentHistoryPage /> },
        { path: '/student/routes', element: <StudentRoutesPage /> },
        { path: '/student/notifications', element: <NotificationsPage /> },
        { path: '/help', element: <HelpPage /> },
      ],
    },
  ],
};
