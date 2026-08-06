import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { StudentLayout } from '@/layouts/StudentLayout';
import { ProtectedRoute } from './ProtectedRoute';

const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const StudentProfilePage = lazy(() => import('@/pages/student/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const ApplyPassPage = lazy(() => import('@/pages/student/ApplyPassPage').then(m => ({ default: m.ApplyPassPage })));
const RenewPassPage = lazy(() => import('@/pages/student/RenewPassPage').then(m => ({ default: m.RenewPassPage })));
const DigitalPassPage = lazy(() => import('@/pages/student/DigitalPassPage').then(m => ({ default: m.DigitalPassPage })));
const PaymentHistoryPage = lazy(() => import('@/pages/student/PaymentHistoryPage').then(m => ({ default: m.PaymentHistoryPage })));
const StudentRoutesPage = lazy(() => import('@/pages/student/StudentRoutesPage').then(m => ({ default: m.StudentRoutesPage })));
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ApplicationStatusPage = lazy(() => import('@/pages/student/ApplicationStatusPage').then(m => ({ default: m.ApplicationStatusPage })));
const HelpPage = lazy(() => import('@/pages/help/HelpPage').then(m => ({ default: m.HelpPage })));

const SuspenseFallback: React.FC = () => (
  <div className="flex min-h-[400px] w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-xs font-semibold">Loading page...</span>
    </div>
  </div>
);

const DriverDashboardPage = lazy(() => import('@/pages/driver/DriverDashboardPage').then(m => ({ default: m.DriverDashboardPage })));
const FleetMaintenancePage = lazy(() => import('@/pages/admin/FleetMaintenancePage').then(m => ({ default: m.FleetMaintenancePage })));

export const studentRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['student']} />,
  children: [
    {
      element: <StudentLayout />,
      children: [
        { path: '/student', element: <Suspense fallback={<SuspenseFallback />}><StudentDashboardPage /></Suspense> },
        { path: '/student/profile', element: <Suspense fallback={<SuspenseFallback />}><StudentProfilePage /></Suspense> },
        { path: '/student/applications', element: <Suspense fallback={<SuspenseFallback />}><ApplicationStatusPage /></Suspense> },
        { path: '/student/apply', element: <Suspense fallback={<SuspenseFallback />}><ApplyPassPage /></Suspense> },
        { path: '/student/renew', element: <Suspense fallback={<SuspenseFallback />}><RenewPassPage /></Suspense> },
        { path: '/student/pass', element: <Suspense fallback={<SuspenseFallback />}><DigitalPassPage /></Suspense> },
        { path: '/student/payments', element: <Suspense fallback={<SuspenseFallback />}><PaymentHistoryPage /></Suspense> },
        { path: '/student/routes', element: <Suspense fallback={<SuspenseFallback />}><StudentRoutesPage /></Suspense> },
        { path: '/student/notifications', element: <Suspense fallback={<SuspenseFallback />}><NotificationsPage /></Suspense> },
        { path: '/driver/dashboard', element: <Suspense fallback={<SuspenseFallback />}><DriverDashboardPage /></Suspense> },
        { path: '/admin/fleet', element: <Suspense fallback={<SuspenseFallback />}><FleetMaintenancePage /></Suspense> },
        { path: '/help', element: <Suspense fallback={<SuspenseFallback />}><HelpPage /></Suspense> },
      ],
    },
  ],
};

