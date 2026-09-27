import { Suspense, lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '@/layouts/AdminLayout';

const FleetMaintenancePage = lazy(() =>
  import('@/pages/admin/FleetMaintenancePage').then((m) => ({ default: m.FleetMaintenancePage }))
);
const DriverRosterPage = lazy(() =>
  import('@/pages/admin/DriverRosterPage').then((m) => ({ default: m.DriverRosterPage }))
);
const FeeManagementPage = lazy(() =>
  import('@/pages/admin/FeeManagementPage').then((m) => ({ default: m.FeeManagementPage }))
);
const ViolationsPage = lazy(() =>
  import('@/pages/admin/ViolationsPage').then((m) => ({ default: m.ViolationsPage }))
);
const PassAllocationsPage = lazy(() =>
  import('@/pages/admin/PassAllocationsPage').then((m) => ({ default: m.PassAllocationsPage }))
);

const SuspenseFallback = () => (
  <div className="flex min-h-[400px] w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-xs font-semibold">Loading transport admin portal...</span>
    </div>
  </div>
);

export const adminRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['admin', 'superadmin']} />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        {
          path: '/admin',
          element: <Navigate to="/admin/fleet" replace />,
        },
        {
          path: '/admin/fleet',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <FleetMaintenancePage />
            </Suspense>
          ),
        },
        {
          path: '/admin/drivers',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <DriverRosterPage />
            </Suspense>
          ),
        },
        {
          path: '/admin/fees',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <FeeManagementPage />
            </Suspense>
          ),
        },
        {
          path: '/admin/violations',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <ViolationsPage />
            </Suspense>
          ),
        },
        {
          path: '/admin/passes',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <PassAllocationsPage />
            </Suspense>
          ),
        },
      ],
    },
  ],
};
